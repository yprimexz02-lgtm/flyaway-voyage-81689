import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import md5 from "https://esm.sh/md5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const mapTravelClass = (travelClass: string) => {
  switch (travelClass) {
    case 'BUSINESS': return 'C';
    case 'FIRST': return 'F';
    case 'PREMIUM_ECONOMY': return 'W';
    default: return 'Y';
  }
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const formatDurationFromMinutes = (minutes: number) => {
  if (!minutes || minutes <= 0) return 'PT0M';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `PT${h}H${m}M`;
};

const formatDateForSignature = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-');
  return `${day}${month}${year.slice(2)}`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiToken = Deno.env.get('TRAVELPAYOUTS_API_TOKEN');
    const marker = Deno.env.get('TRAVELPAYOUTS_MARKER');
    const userIp = "8.8.8.8"; // Using a static public IP for testing

    console.log('Function invoked with credentials from secrets.');

    if (!apiToken || !marker) {
      throw new Error('TRAVELPAYOUTS_API_TOKEN and TRAVELPAYOUTS_MARKER must be configured in secrets.');
    }

    const { origin, destination, departureDate, returnDate, adults, children, infants, travelClass } = await req.json();

    const directionsForApi = [{ origin: origin.toUpperCase(), destination: destination.toUpperCase(), date: departureDate }];
    if (returnDate) {
      directionsForApi.push({ origin: destination.toUpperCase(), destination: origin.toUpperCase(), date: returnDate });
    }

    const directionsStringForSignature = directionsForApi.map(d => 
      `${formatDateForSignature(d.date)}${d.origin}${d.destination}`
    ).join(',');

    const passengersString = `${adults}:${children || 0}:${infants || 0}`;
    const locale = 'pt';

    const signatureString = [
      apiToken,
      marker,
      userIp,
      locale,
      mapTravelClass(travelClass),
      passengersString,
      directionsStringForSignature,
    ].join(':');

    const signature = md5(signatureString);

    const searchBody = {
      signature: signature,
      marker: marker,
      user_ip: userIp,
      search_params: {
        locale: locale,
        trip_class: mapTravelClass(travelClass),
        passengers: { adults, children: children || 0, infants: infants || 0 },
        directions: directionsForApi,
      },
    };

    console.log('Sending request to Travelpayouts API with:', {
      url: 'https://api.travelpayouts.com/v1/flight_search',
      hasToken: !!apiToken,
      tokenPrefix: apiToken ? apiToken.substring(0, 8) + '...' : 'missing',
      marker: marker
    });

    const initResponse = await fetch('https://api.travelpayouts.com/v1/flight_search', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Access-Token': apiToken 
      },
      body: JSON.stringify(searchBody),
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      console.error("Failed to initiate search:", errorText);
      console.error("Response status:", initResponse.status);
      console.error("Request body:", JSON.stringify(searchBody, null, 2));
      return new Response(JSON.stringify({ error: `API Error (${initResponse.status}): ${errorText}. Verifique se suas credenciais Travelpayouts (API Token e Marker) estão corretas.` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const initData = await initResponse.json();

    if (!initData.uuid) {
      console.error("API did not return a search UUID. Response:", initData);
      const errorMessage = initData.message || JSON.stringify(initData);
      return new Response(JSON.stringify({ error: `Failed to start search: ${errorMessage}` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { uuid } = initData;

    let allResults: any[] = [];
    for (let i = 0; i < 30; i++) {
      await delay(3000);
      const resultsResponse = await fetch(`https://api.travelpayouts.com/v1/flight_search_results?uuid=${uuid}`, {
        headers: { 'X-Access-Token': apiToken },
      });

      if (resultsResponse.ok) {
        const data = await resultsResponse.json();
        if (data && Array.isArray(data) && data.length > 0) {
          allResults.push(...data);
          if (data.some(item => item.search_completed === true)) break;
        }
      } else {
        console.warn(`Polling failed with status ${resultsResponse.status}`);
        break;
      }
    }

    const finalResults = allResults.filter(item => !item.search_completed);
    if (finalResults.length === 0) {
      return new Response(JSON.stringify({ data: [], dictionaries: {} }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const carriers: Record<string, string> = {};
    const RUB_TO_EUR_RATE = 0.01;

    const transformedData = finalResults.map((flight: any, index: number) => {
      if (!flight.proposals || !flight.price) return null;
      const itineraries = flight.proposals.map((proposal: any) => {
        if (!proposal.segment) return null;
        proposal.segment.forEach((s: any) => {
          if (s?.flight?.carrier && s?.flight?.carrier_name) carriers[s.flight.carrier] = s.flight.carrier_name;
        });
        return {
          duration: formatDurationFromMinutes(proposal.total_duration_minutes),
          segments: proposal.segment.map((segment: any) => ({
            departure: { iataCode: segment.departure_code, at: new Date(segment.departure_date).toISOString() },
            arrival: { iataCode: segment.arrival_code, at: new Date(segment.arrival_date).toISOString() },
            carrierCode: segment.flight?.carrier,
            number: segment.flight?.number,
            duration: formatDurationFromMinutes(segment.flight_duration_minutes),
          })),
        };
      }).filter(Boolean);
      if (itineraries.length === 0) return null;
      return {
        id: `tp-${uuid}-${index}`,
        price: { total: (flight.price * RUB_TO_EUR_RATE).toFixed(2), currency: 'EUR' },
        itineraries,
      };
    }).filter(Boolean);

    return new Response(JSON.stringify({ data: transformedData, dictionaries: { carriers } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error in search-flights-travelpayouts function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});