import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Iniciando função de cotação...");
    const serpApiKey = Deno.env.get('SERPAPI_API_KEY');
    const wootsapToken = Deno.env.get('WOOTSAP_API_TOKEN');
    const wootsapInstanceId = Deno.env.get('WOOTSAP_INSTANCE_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Log de depuração para a chave da API
    console.log("Chave SerpApi lida:", serpApiKey ? `${serpApiKey.substring(0, 4)}...${serpApiKey.slice(-4)}` : "Não encontrada");

    if (!serpApiKey || !wootsapToken || !wootsapInstanceId || !supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(`Um ou mais segredos de ambiente não estão configurados.`);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      }
    });

    const {
      telefone, origem, destino, data_partida, data_retorno, somente_ida, quantidade_pessoas
    } = await req.json();
    console.log("Dados da solicitação recebidos:", { telefone, origem, destino, data_partida });

    console.log("Buscando voos na SerpApi...");
    const params = new URLSearchParams({
      engine: 'google_flights',
      departure_id: origem,
      arrival_id: destino,
      outbound_date: data_partida, // Agora recebe YYYY-MM-DD diretamente
      currency: 'BRL',
      hl: 'pt-br',
      api_key: serpApiKey,
      adults: String(quantidade_pessoas),
    });

    if (!somente_ida && data_retorno) {
      params.append('return_date', data_retorno); // Agora recebe YYYY-MM-DD diretamente
      params.append('type', '1');
    } else {
      params.append('type', '2');
    }

    const serpApiUrl = `https://serpapi.com/search?${params.toString()}`;
    const serpApiResponse = await fetch(serpApiUrl);
    console.log(`Resposta da SerpApi: Status ${serpApiResponse.status}`);

    if (!serpApiResponse.ok) {
      const errorText = await serpApiResponse.text();
      throw new Error(`A busca de voos falhou: ${serpApiResponse.status} - ${errorText}`);
    }

    const flightData = await serpApiResponse.json();
    const allFlights = (flightData.best_flights || []).concat(flightData.other_flights || []);
    console.log(`Encontrados ${allFlights.length} voos.`);
    
    let cheapestFlight = null;
    if (allFlights.length > 0) {
      cheapestFlight = allFlights.reduce((min, flight) => flight.price < min.price ? flight : min, allFlights[0]);
    }

    let whatsappMessage = "";
    const formatDate = (dateStr: string) => { // dateStr é YYYY-MM-DD
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    if (cheapestFlight) {
      const destinoCompleto = `${origem} para ${destino}`;
      const dataIdaFormatada = formatDate(data_partida);
      const dataVoltaFormatada = data_retorno ? formatDate(data_retorno) : 'N/A';
      const periodo = data_retorno ? `${dataIdaFormatada} a ${dataVoltaFormatada}` : `a partir de ${dataIdaFormatada}`;
      
      const valorOriginal = cheapestFlight.price;
      const valorComDesconto = valorOriginal * 0.94;

      const valorOriginalFormatado = formatCurrency(valorOriginal);
      const valorComDescontoFormatado = formatCurrency(valorComDesconto);

      whatsappMessage = `Olá! Aqui é o GFC IA da GFC Travel Experience.

Sua cotação para ${destinoCompleto}, no período de ${periodo}, já está pronta!
Seguem as melhores opções que selecionei para você:

🌍 Destino: ${destinoCompleto}
📅 Datas: ${dataIdaFormatada} → ${data_retorno ? dataVoltaFormatada : 'Somente Ida'}
✈️ Valor na Companhia Aérea: ${valorOriginalFormatado}
✨ *Nossa tarifa exclusiva GFC: ${valorComDescontoFormatado}*

O que acha? Posso te ajudar a finalizar a reserva.`;

    } else {
      const destinoCompleto = `${origem} para ${destino}`;
      whatsappMessage = `Olá! Aqui é o GFC IA da GFC Travel Experience.

Busquei por voos de ${destinoCompleto}, mas não encontrei opções online para essa data. 

Não se preocupe! Vou verificar manualmente com meus fornecedores e te retorno em breve com as melhores alternativas.`;
    }

    const cleanPhoneNumber = telefone.replace(/\D/g, '');
    const jid = `55${cleanPhoneNumber}@s.whatsapp.net`;
    const encodedMsg = encodeURIComponent(whatsappMessage);

    const wootsapUrl = `https://api.wootsap.com/api/v1/send-text?token=${wootsapToken}&instance_id=${wootsapInstanceId}&jid=${jid}&msg=${encodedMsg}`;
    
    console.log("Enviando mensagem via Wootsap...");
    const wootsapResponse = await fetch(wootsapUrl, { method: 'GET' });
    const wootsapResult = await wootsapResponse.json();

    if (!wootsapResponse.ok || !wootsapResult.success) {
      console.error("Erro na API Wootsap:", wootsapResult);
      throw new Error(`Falha ao enviar mensagem via WhatsApp: ${wootsapResult.message || 'Erro desconhecido'}`);
    }
    console.log("Mensagem enviada com sucesso via Wootsap.");

    console.log("Salvando cotação na tabela 'quote_requests'...");
    const { error: dbError } = await supabaseAdmin.from('quote_requests').insert({
      telefone: telefone,
      origem: origem,
      destino: destino,
      data_partida: data_partida,
      data_retorno: somente_ida ? null : data_retorno,
      somente_ida: somente_ida,
      quantidade_pessoas: quantidade_pessoas,
    });

    if (dbError) {
      console.error("Erro ao salvar cotação no Supabase:", dbError);
      throw new Error(`Falha ao registrar a cotação no banco de dados: ${dbError.message}`);
    }
    console.log("Cotação salva com sucesso.");

    return new Response(JSON.stringify({ success: true, message: "Quote request processed successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na função request-flight-quote:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido na função.';
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    return new Response(JSON.stringify({ success: false, message: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});