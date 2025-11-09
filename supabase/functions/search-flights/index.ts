import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FlightSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: string;
  max?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting flight search request');
    
    const searchParams: FlightSearchRequest = await req.json();
    console.log('Search parameters:', searchParams);

    const clientId = Deno.env.get('AMADEUS_CLIENT_ID');
    const clientSecret = Deno.env.get('AMADEUS_CLIENT_SECRET');

    // Debugging log to check if secrets are loaded
    console.log('Credentials loaded:', { clientId: !!clientId, clientSecret: !!clientSecret });

    if (!clientId) {
      console.error('Missing Amadeus credential: AMADEUS_CLIENT_ID');
      throw new Error('Amadeus Client ID not configured');
    }
    if (!clientSecret) {
      console.error('Missing Amadeus credential: AMADEUS_CLIENT_SECRET');
      throw new Error('Amadeus Client Secret not configured');
    }

    // Get access token from Amadeus
    console.log('Requesting Amadeus access token');
    const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token error:', errorText);
      throw new Error('Failed to get Amadeus access token');
    }

    const { access_token } = await tokenResponse.json();
    console.log('Access token obtained successfully');

    // Build flight search query
    const queryParams = new URLSearchParams({
      originLocationCode: searchParams.origin,
      destinationLocationCode: searchParams.destination,
      departureDate: searchParams.departureDate,
      adults: searchParams.adults.toString(),
      max: (searchParams.max || 10).toString(),
    });

    if (searchParams.returnDate) {
      queryParams.append('returnDate', searchParams.returnDate);
    }
    if (searchParams.children) {
      queryParams.append('children', searchParams.children.toString());
    }
    if (searchParams.infants) {
      queryParams.append('infants', searchParams.infants.toString());
    }
    if (searchParams.travelClass) {
      queryParams.append('travelClass', searchParams.travelClass);
    }

    console.log('Searching flights with params:', queryParams.toString());

    // Search flights
    const flightResponse = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      }
    );

    if (!flightResponse.ok) {
      const errorText = await flightResponse.text();
      console.error('Flight search error:', errorText);
      throw new Error('Failed to search flights');
    }

    const flightData = await flightResponse.json();
    console.log('Flight search successful, found', flightData.data?.length || 0, 'offers');

    return new Response(
      JSON.stringify(flightData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in search-flights function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});