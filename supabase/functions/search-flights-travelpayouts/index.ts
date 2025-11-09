import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to map our class names to Travelpayouts' single-letter codes
const mapTravelClass = (travelClass: string) => {
  switch (travelClass) {
    case 'BUSINESS': return 'C';
    case 'FIRST': return 'F';
    case 'PREMIUM_ECONOMY': return 'W';
    default: return 'Y'; // Economy
  }
};

// Helper to introduce a delay, necessary for polling the API
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to convert duration from minutes to ISO 8601 format (e.g., PT2H30M)
const formatDurationFromMinutes = (minutes: number) => {
  if (!minutes || minutes <= 0) return 'PT0M';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `PT${h}H${m}M`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, departureDate, returnDate, adults, children, infants, travelClass } = await req.json();
    const apiToken = Deno.env.get('TRAVELPAYOUTS_API_TOKEN');
    const marker = Deno.env.get('TRAVELPAYOUTS_MARKER');

    if (!apiToken || !marker) {
      throw new Error('Travelpayouts API token or marker not configured');
    }

    const directions = [{
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      date: departureDate,
    }];

    if (returnDate) {
      directions.push({
        origin: destination.toUpperCase(),
        destination: origin.toUpperCase(),
        date: returnDate,
      });
    }

    const searchBody = {
      host: "gfchavestravelexperience.com",
      marker: marker,
      search_params: {
        trip_class: mapTravelClass(travelClass),
        passengers: {
          adults: adults,
          children: children || 0,
          infants: infants || 0,
        },
        directions: directions,
      },
    };

    // Step 1: Initiate the search and get a search ID (UUID)
    const initResponse = await fetch('https://api.travelpayouts.com/v1/flight_search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Access-Token': apiToken },
      body: JSON.stringify(searchBody),
    });

    if (!initResponse.ok) throw new Error(`Failed to initiate search: ${await initResponse.text()}`);
    const { uuid } = await initResponse.json();

    // Step 2: Poll for results a few times
    let results = null;
    for (let i = 0; i < 10; i++) { // Poll up to 10 times (30 seconds total)
      await delay(3000); // Wait 3 seconds between polls
      const resultsResponse = await fetch(`https://api.travelpayouts.com/v1/flight_search_results?uuid=${uuid}`, {
        headers: { 'X-Access-Token': apiToken },
      });
      
      if (resultsResponse.ok) {
        const data = await resultsResponse.json();
        if (data && data.length > 0) {
          results = data;
          break;
        }
      }
    }

    if (!results) {
      return new Response(JSON.stringify({ data: [], dictionaries: {} }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Step 3: Transform Travelpayouts data to match our standard Amadeus structure
    const carriers: Record<string, string> = {};
    const RUB_TO_EUR_RATE = 0.01; // Approximate conversion rate

    const transformedData = results.map((flight: any, index: number) => {
      const itineraries = flight.proposals.map((proposal: any) => {
        proposal.segment.forEach((s: any) => {
          carriers[s.flight.carrier] = s.flight.carrier_name;
        });
        return {
          duration: formatDurationFromMinutes(proposal.total_duration_minutes),
          segments: proposal.segment.map((segment: any) => ({
            departure: { iataCode: segment.departure_code, at: new Date(segment.departure_date).toISOString() },
            arrival: { iataCode: segment.arrival_code, at: new Date(segment.arrival_date).toISOString() },
            carrierCode: segment.flight.carrier,
            number: segment.flight.number,
            duration: formatDurationFromMinutes(segment.flight_duration_minutes),
          })),
        };
      });

      return {
        id: `tp-${uuid}-${index}`,
        price: {
          total: (flight.price * RUB_TO_EUR_RATE).toFixed(2),
          currency: 'EUR', // Standardize to EUR to match Amadeus
        },
        itineraries,
      };
    });

    return new Response(JSON.stringify({ data: transformedData, dictionaries: { carriers } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error in search-flights-travelpayouts function:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});