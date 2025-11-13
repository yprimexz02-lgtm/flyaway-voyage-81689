import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FlightSearchForm from "@/components/FlightSearchForm";
import FlightCard from "@/components/FlightCard";
import FlightFilters, { FilterState } from "@/components/FlightFilters";
import { Button } from "@/components/ui/button";
import { Loader2, Plane, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      duration: string;
    }>;
  }>;
}

const FlightSearch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [dictionaries, setDictionaries] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000],
    selectedAirlines: [],
    maxStops: null,
    departureTimeRange: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const departureDate = searchParams.get("departureDate");

    if (origin && destination && departureDate) {
      searchFlights();
    }
  }, [searchParams]);

  const searchFlights = async () => {
    setLoading(true);
    setFlights([]);
    setDictionaries({});

    const searchData = {
      origin: searchParams.get("origin") || "",
      destination: searchParams.get("destination") || "",
      departureDate: searchParams.get("departureDate") || "",
      returnDate: searchParams.get("returnDate") || undefined,
      adults: parseInt(searchParams.get("adults") || "1"),
      children: parseInt(searchParams.get("children") || "0"),
      infants: parseInt(searchParams.get("infants") || "0"),
      travelClass: searchParams.get("travelClass") || "ECONOMY",
      max: 10,
    };

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("search-flights-serpapi", { body: searchData });

      if (invokeError) {
        throw invokeError;
      }

      if (data && data.error) {
        console.error("API Error from function:", data.error);
        toast({
          title: "Erro ao buscar voos",
          description: `A API retornou um erro: ${data.error}`,
          variant: "destructive",
        });
        setFlights([]);
        return;
      }

      const flightResults: FlightOffer[] = data.data || [];
      const flightDictionaries = data.dictionaries || {};

      flightResults.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));

      setFlights(flightResults);
      setDictionaries(flightDictionaries);

      // Reset filters when new search is performed
      const maxPrice = Math.max(...flightResults.map(f => parseFloat(f.price.total)), 10000);
      setFilters({
        priceRange: [0, maxPrice],
        selectedAirlines: [],
        maxStops: null,
        departureTimeRange: [],
      });

      if (flightResults.length > 0) {
        toast({
          title: "Voos encontrados!",
          description: `Encontramos ${flightResults.length} opções para você.`,
        });
      } else {
        toast({
          title: "Nenhum voo encontrado",
          description: "Tente ajustar seus critérios de busca.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Flight search failed:", err);
      toast({
        title: "Erro Crítico na Busca",
        description: err.message || "Não foi possível buscar os voos. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter flights based on active filters
  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      const price = parseFloat(flight.price.total);
      
      // Price filter
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Airline filter
      if (filters.selectedAirlines.length > 0) {
        const flightAirlines = flight.itineraries.flatMap(it => 
          it.segments.map(seg => seg.carrierCode)
        );
        if (!flightAirlines.some(airline => filters.selectedAirlines.includes(airline))) {
          return false;
        }
      }

      // Stops filter
      if (filters.maxStops !== null) {
        const maxStopsInFlight = Math.max(...flight.itineraries.map(it => it.segments.length - 1));
        if (maxStopsInFlight > filters.maxStops) {
          return false;
        }
      }

      // Departure time filter
      if (filters.departureTimeRange.length > 0) {
        const departureHour = new Date(flight.itineraries[0].segments[0].departure.at).getHours();
        const matchesTimeRange = filters.departureTimeRange.some(range => {
          if (range === 'night' && departureHour >= 0 && departureHour < 6) return true;
          if (range === 'morning' && departureHour >= 6 && departureHour < 12) return true;
          if (range === 'afternoon' && departureHour >= 12 && departureHour < 18) return true;
          if (range === 'evening' && departureHour >= 18 && departureHour < 24) return true;
          return false;
        });
        if (!matchesTimeRange) return false;
      }

      return true;
    });
  }, [flights, filters]);

  // Get unique airlines for filter
  const availableAirlines = useMemo(() => {
    const airlines = new Set<string>();
    flights.forEach(flight => {
      flight.itineraries.forEach(itinerary => {
        itinerary.segments.forEach(segment => {
          airlines.add(segment.carrierCode);
        });
      });
    });
    return Array.from(airlines).sort();
  }, [flights]);

  const maxPrice = useMemo(() => {
    return Math.max(...flights.map(f => parseFloat(f.price.total)), 10000);
  }, [flights]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold mb-8 text-center">Buscar Voos</h1>

          <div className="mb-12">
            <FlightSearchForm />
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Buscando nas melhores fontes para você...</p>
            </div>
          )}

          {!loading && flights.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <FlightFilters
                  maxPrice={maxPrice}
                  airlines={availableAirlines}
                  onFilterChange={setFilters}
                />
              </div>

              {/* Flight Results */}
              <div className="lg:col-span-3 space-y-6">
                <h2 className="text-2xl font-bold">
                  {filteredFlights.length} {filteredFlights.length === 1 ? "voo encontrado" : "voos encontrados"}
                  {filteredFlights.length !== flights.length && (
                    <span className="text-muted-foreground text-lg ml-2">
                      (de {flights.length} total)
                    </span>
                  )}
                </h2>
                
                {filteredFlights.length > 0 ? (
                  filteredFlights.map((flight) => (
                    <FlightCard 
                      key={flight.id} 
                      flight={flight} 
                      carriers={dictionaries.carriers || {}} 
                    />
                  ))
                ) : (
                  <div className="text-center py-20">
                    <Plane className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum voo corresponde aos filtros</h3>
                    <p className="text-muted-foreground">Tente ajustar os filtros para ver mais resultados</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && flights.length === 0 && searchParams.get("origin") && (
            <div className="text-center py-20">
              <Plane className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum voo encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar seus critérios de busca</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FlightSearch;