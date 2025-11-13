import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, departureDate, returnDate, adults, children, infants, travelClass } = await req.json();
    
    const apiKey = Deno.env.get('SERPAPI_API_KEY');
    if (!apiKey) {
      throw new Error('SERPAPI_API_KEY not configured');
    }

    console.log('Searching flights with SerpApi:', { origin, destination, departureDate, returnDate, adults, children, infants, travelClass });

    // Build SerpApi Google Flights URL
    const params = new URLSearchParams({
      engine: 'google_flights',
      departure_id: origin,
      arrival_id: destination,
      outbound_date: departureDate,
      currency: 'BRL',
      hl: 'pt-br',
      api_key: apiKey,
    });

    // Add return date if it's a round trip
    if (returnDate) {
      params.append('return_date', returnDate);
      params.append('type', '1'); // Round trip
    } else {
      params.append('type', '2'); // One way
    }

    // Add passengers
    const totalPassengers = (adults || 1) + (children || 0) + (infants || 0);
    params.append('adults', String(adults || 1));
    if (children) params.append('children', String(children));
    if (infants) params.append('infants_in_seat', String(infants));

    // Add travel class
    if (travelClass && travelClass !== 'ECONOMY') {
      const classMap: Record<string, string> = {
        'PREMIUM_ECONOMY': '2',
        'BUSINESS': '3',
        'FIRST': '4'
      };
      params.append('travel_class', classMap[travelClass] || '1');
    }

    const serpApiUrl = `https://serpapi.com/search?${params.toString()}`;
    console.log('SerpApi request URL:', serpApiUrl.replace(apiKey, 'HIDDEN'));

    const response = await fetch(serpApiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SerpApi error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `Erro na busca de voos (${response.status}). Verifique suas credenciais SerpApi.`,
          details: errorText 
        }), 
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log('SerpApi response received, processing flights...');

    // Transform SerpApi response to match our FlightOffer interface
    const flights = (data.best_flights || []).concat(data.other_flights || []).map((flight: any, index: number) => {
      const outbound = flight.flights?.[0];
      const inbound = flight.flights?.[1];

      return {
        id: `serpapi-${index}`,
        price: {
          total: String(flight.price || 0),
          currency: 'BRL'
        },
        itineraries: [
          {
            duration: `PT${Math.floor((outbound?.duration || 0) / 60)}H${(outbound?.duration || 0) % 60}M`,
            segments: (outbound?.layovers || [outbound]).filter(Boolean).map((segment: any) => ({
              departure: {
                iataCode: segment.departure_airport?.id || origin,
                at: segment.departure_airport?.time || ''
              },
              arrival: {
                iataCode: segment.arrival_airport?.id || destination,
                at: segment.arrival_airport?.time || ''
              },
              carrierCode: segment.airline || 'XX',
              number: segment.flight_number || '',
              duration: `PT${Math.floor((segment.duration || 0) / 60)}H${(segment.duration || 0) % 60}M`
            }))
          },
          ...(inbound ? [{
            duration: `PT${Math.floor((inbound.duration || 0) / 60)}H${(inbound.duration || 0) % 60}M`,
            segments: (inbound.layovers || [inbound]).filter(Boolean).map((segment: any) => ({
              departure: {
                iataCode: segment.departure_airport?.id || destination,
                at: segment.departure_airport?.time || ''
              },
              arrival: {
                iataCode: segment.arrival_airport?.id || origin,
                at: segment.arrival_airport?.time || ''
              },
              carrierCode: segment.airline || 'XX',
              number: segment.flight_number || '',
              duration: `PT${Math.floor((segment.duration || 0) / 60)}H${(segment.duration || 0) % 60}M`
            }))
          }] : [])
        ]
      };
    });

    // Build carriers dictionary
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

    console.log(`Found ${flights.length} flights`);

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