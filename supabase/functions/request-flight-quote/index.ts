import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to format BRL currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get secrets and initialize clients
    const serpApiKey = Deno.env.get('SERPAPI_API_KEY');
    const wootsapToken = Deno.env.get('WOOTSAP_API_TOKEN');
    const wootsapInstanceId = Deno.env.get('WOOTSAP_INSTANCE_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!serpApiKey || !wootsapToken || !wootsapInstanceId || !supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing required environment variables/secrets.');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const {
      nome, telefone, origem, destino, data_partida, data_retorno, somente_ida, quantidade_pessoas
    } = await req.json();

    // 2. Search for flights using SerpApi
    const params = new URLSearchParams({
      engine: 'google_flights',
      departure_id: origem,
      arrival_id: destino,
      outbound_date: data_partida.substring(0, 10), // YYYY-MM-DD
      currency: 'BRL',
      hl: 'pt-br',
      api_key: serpApiKey,
      adults: String(quantidade_pessoas),
    });

    if (!somente_ida && data_retorno) {
      params.append('return_date', data_retorno.substring(0, 10));
      params.append('type', '1'); // Round trip
    } else {
      params.append('type', '2'); // One way
    }

    const serpApiUrl = `https://serpapi.com/search?${params.toString()}`;
    const serpApiResponse = await fetch(serpApiUrl);

    if (!serpApiResponse.ok) {
      throw new Error(`SerpApi request failed with status: ${serpApiResponse.status}`);
    }

    const flightData = await serpApiResponse.json();
    const allFlights = (flightData.best_flights || []).concat(flightData.other_flights || []);
    
    // Find the cheapest flight
    let cheapestFlight = null;
    if (allFlights.length > 0) {
      cheapestFlight = allFlights.reduce((min, flight) => flight.price < min.price ? flight : min, allFlights[0]);
    }

    // 3. Format and send WhatsApp message
    let whatsappMessage = "";
    if (cheapestFlight) {
      const price = formatCurrency(cheapestFlight.price);
      whatsappMessage = `Olá, ${nome}! Encontrei uma ótima opção de voo de ${origem} para ${destino} por ${price}. O que acha? Posso te ajudar a finalizar a reserva.`;
    } else {
      whatsappMessage = `Olá, ${nome}! Busquei por voos de ${origem} para ${destino}, mas não encontrei opções online para essa data. Vou verificar manualmente com meus fornecedores e te retorno em breve.`;
    }

    const cleanPhoneNumber = telefone.replace(/\D/g, '');
    const jid = `55${cleanPhoneNumber}@s.whatsapp.net`;
    const encodedMsg = encodeURIComponent(whatsappMessage);

    const wootsapUrl = `https://api.wootsap.com/api/v1/send-text?token=${wootsapToken}&instance_id=${wootsapInstanceId}&jid=${jid}&msg=${encodedMsg}`;
    
    const wootsapResponse = await fetch(wootsapUrl, { method: 'GET' });
    const wootsapResult = await wootsapResponse.json();

    if (!wootsapResponse.ok || !wootsapResult.success) {
      console.error("Wootsap API Error:", wootsapResult);
      // Don't throw an error here, just log it. The quote should still be saved.
    }

    // 4. Save the quote request to the database
    const { error: dbError } = await supabaseAdmin.from('bookings').insert({
      destination_id: `${origem}-${destino}`,
      destination_name: `Cotação: ${origem} para ${destino}`,
      full_name: nome,
      cpf: '000.000.000-00', // Placeholder as it's not in the form
      email: `${cleanPhoneNumber}@placeholder.user`, // Placeholder
      phone: telefone,
      adults: quantidade_pessoas,
      children: 0, // Not in the form
      departure_date: data_partida,
      return_date: somente_ida ? null : data_retorno,
      total_price: cheapestFlight ? cheapestFlight.price : 0,
    });

    if (dbError) {
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    // 5. Return success response
    return new Response(JSON.stringify({ success: true, message: "Quote request processed successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in request-flight-quote function:', error);
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});