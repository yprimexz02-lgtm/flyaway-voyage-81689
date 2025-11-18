import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper para processar voos e evitar repetição de código
const processFlights = (flightData: any, idPrefix: string) => {
  const flights = (flightData.best_flights || []).concat(flightData.other_flights || []).map((flight: any, index: number) => {
    if (!flight) return null;

    const itineraries = (flight.flights || []).map((leg: any) => {
      if (!leg) return null;
      
      return {
        duration: `PT${Math.floor((leg.duration || 0) / 60)}H${(leg.duration || 0) % 60}M`,
        stops: leg.stops,
        segments: (leg.layovers || []).length > 0 
          ? leg.layovers.map((segment: any) => ({
              departure: {
                iataCode: segment?.departure_airport?.id || '',
                at: `${segment?.departure_airport?.time}` || ''
              },
              arrival: {
                iataCode: segment?.arrival_airport?.id || '',
                at: `${segment?.arrival_airport?.time}` || ''
              },
              carrierCode: segment?.airline || 'XX',
              number: segment?.flight_number || '',
              duration: `PT${Math.floor((segment?.duration || 0) / 60)}H${(segment?.duration || 0) % 60}M`
            }))
          : [{
              departure: {
                iataCode: leg.departure_airport?.id || '',
                at: `${leg.departure_airport?.time}` || ''
              },
              arrival: {
                iataCode: leg.arrival_airport?.id || '',
                at: `${leg.arrival_airport?.time}` || ''
              },
              carrierCode: leg.airline || 'XX',
              number: leg.flight_number || '',
              duration: `PT${Math.floor((leg.duration || 0) / 60)}H${(leg.duration || 0) % 60}M`
            }]
      };
    }).filter(Boolean);

    return {
      id: `${idPrefix}-${index}`,
      price: {
        total: String(flight.price || 0),
        currency: 'BRL'
      },
      itineraries,
      departure_token: flight.departure_token,
      type: flight.type
    };
  }).filter(Boolean);

  const carriers: Record<string, string> = {};
  flights.forEach((flight: any) => {
    flight.itineraries.forEach((itinerary: any) => {
      itinerary.segments.forEach((segment: any) => {
        if (segment.carrierCode && !carriers[segment.carrierCode]) {
          carriers[segment.carrierCode] = segment.carrierCode;
        }
      });
    });
  });

  return { flights, carriers };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { origin, destination, departureDate, returnDate, adults, children, infants, travelClass, departure_token } = requestBody;
    
    const apiKey = Deno.env.get('SERPAPI_API_KEY');
    if (!apiKey) {
      throw new Error('SERPAPI_API_KEY not configured');
    }

    const params = new URLSearchParams({
      engine: 'google_flights',
      departure_id: origin,
      arrival_id: destination,
      outbound_date: departureDate,
      currency: 'BRL',
      hl: 'pt-br',
      api_key: apiKey,
    });

    if (departure_token) {
      params.append('departure_token', departure_token);
      params.append('return_date', returnDate || departureDate);
    } else if (returnDate) {
      params.append('return_date', returnDate);
      params.append('type', '1'); // Round trip
    } else {
      params.append('type', '2'); // One way
    }

    params.append('adults', String(adults || 1));
    if (children) params.append('children', String(children));
    if (infants) params.append('infants_in_seat', String(infants));

    if (travelClass && travelClass !== 'ECONOMY') {
      const classMap: Record<string, string> = {
        'PREMIUM_ECONOMY': '2',
        'BUSINESS': '3',
        'FIRST': '4'
      };
      params.append('travel_class', classMap[travelClass] || '1');
    }

    const serpApiUrl = `https://serpapi.com/search?${params.toString()}`;
    const response = await fetch(serpApiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SerpApi error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `Erro na busca de voos (${response.status}).`,
          details: errorText 
        }), 
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const idPrefix = departure_token ? 'serpapi-return' : 'serpapi';
    const { flights, carriers } = processFlights(data, idPrefix);

    return new Response(
      JSON.stringify({
        data: flights,
        dictionaries: { carriers }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in search-flights-serpapi:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao buscar voos',
        details: error.toString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});