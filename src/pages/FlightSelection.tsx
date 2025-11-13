import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FlightCard from "@/components/FlightCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, ArrowLeft, ArrowRight, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FlightFilters from "@/components/FlightFilters";

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
  departure_token?: string;
  type?: string;
}

const FlightSelection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [outboundFlights, setOutboundFlights] = useState<FlightOffer[]>([]);
  const [returnFlights, setReturnFlights] = useState<FlightOffer[]>([]);
  const [selectedOutbound, setSelectedOutbound] = useState<FlightOffer | null>(null);
  const [dictionaries, setDictionaries] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'outbound' | 'return'>('outbound');
  const [filters, setFilters] = useState({
    priceRange: [0, 10000] as [number, number],
    selectedAirlines: [] as string[],
    maxStops: null as number | null,
    departureTimeRange: [] as string[],
  });
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const { toast } = useToast();

  useEffect(() => {
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const departureDate = searchParams.get("departureDate");
    const returnDate = searchParams.get("returnDate");

    if (origin && destination && departureDate) {
      if (returnDate) {
        // Round trip - search outbound flights first
        searchOutboundFlights();
      } else {
        // One way - search directly
        searchFlights();
      }
    }
  }, [searchParams]);

  const searchOutboundFlights = async () => {
    setLoading(true);
    setOutboundFlights([]);
    setDictionaries({});

    const searchData = {
      origin: searchParams.get("origin") || "",
      destination: searchParams.get("destination") || "",
      departureDate: searchParams.get("departureDate") || "",
      returnDate: searchParams.get("returnDate") || undefined,
      adults: parseInt(searchParams.get("adults") || "1"),
      travelClass: searchParams.get("travelClass") || "ECONOMY",
      max: 10,
    };

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("search-flights-serpapi", { body: searchData });

      if (invokeError) throw invokeError;
      if (data && data.error) {
        console.error("API Error from function:", data.error);
        toast({
          title: "Erro ao buscar voos",
          description: `A API retornou um erro: ${data.error}`,
          variant: "destructive",
        });
        setOutboundFlights([]);
        return;
      }

      const flightResults: FlightOffer[] = data.data || [];
      const flightDictionaries = data.dictionaries || {};

      flightResults.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));

      setOutboundFlights(flightResults);
      setDictionaries(flightDictionaries);

      // Set initial price range based on results
      if (flightResults.length > 0) {
        const min = Math.floor(parseFloat(flightResults[0].price.total));
        const max = Math.ceil(parseFloat(flightResults[flightResults.length - 1].price.total));
        setMinPrice(min);
        setMaxPrice(max);
        setFilters(prev => ({ ...prev, priceRange: [min, max] }));
      }

      if (flightResults.length > 0) {
        toast({
          title: "Voos de ida encontrados!",
          description: `Encontramos ${flightResults.length} opções de voos de ida.`,
        });
      } else {
        toast({
          title: "Nenhum voo encontrado",
          description: "Tente ajustar seus critérios de busca.",
        });
      }
    } catch (error: any) {
      console.error("Error searching flights:", error);
      toast({
        title: "Erro ao buscar voos",
        description: error.message || "Ocorreu um erro ao buscar voos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchReturnFlights = async (departureToken: string) => {
    setLoading(true);
    setReturnFlights([]);

    const searchData = {
      departure_token: departureToken,
      origin: searchParams.get("origin") || "",
      destination: searchParams.get("destination") || "",
      departureDate: searchParams.get("departureDate") || "",
      returnDate: searchParams.get("returnDate") || "",
      adults: parseInt(searchParams.get("adults") || "1"),
      travelClass: searchParams.get("travelClass") || "ECONOMY",
    };

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("search-flights-serpapi", {
        body: searchData
      });

      if (invokeError) throw invokeError;
      if (data && data.error) {
        console.error("API Error from function:", data.error);
        toast({
          title: "Erro ao buscar voos de volta",
          description: `A API retornou um erro: ${data.error}`,
          variant: "destructive",
        });
        return;
      }

      const flightResults: FlightOffer[] = data.data || [];
      flightResults.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));

      setReturnFlights(flightResults);

      // Update price range for return flights
      if (flightResults.length > 0) {
        const min = Math.floor(parseFloat(flightResults[0].price.total));
        const max = Math.ceil(parseFloat(flightResults[flightResults.length - 1].price.total));
        setMinPrice(min);
        setMaxPrice(max);
        setFilters(prev => ({ ...prev, priceRange: [min, max] }));
      }

      if (flightResults.length > 0) {
        toast({
          title: "Voos de volta encontrados!",
          description: `Encontramos ${flightResults.length} opções de voos de volta.`,
        });
        setStep('return');
      }
    } catch (error: any) {
      console.error("Error searching return flights:", error);
      toast({
        title: "Erro ao buscar voos de volta",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchFlights = async () => {
    // For one-way flights, use the existing FlightSearch page logic
    navigate("/buscar-voos?" + searchParams.toString());
  };

  const handleSelectOutbound = (flight: FlightOffer) => {
    setSelectedOutbound(flight);
    if (flight.departure_token) {
      searchReturnFlights(flight.departure_token);
    }
  };

  const handleSelectReturn = (flight: FlightOffer) => {
    if (selectedOutbound) {
      const totalPrice = String(parseFloat(selectedOutbound.price.total) + parseFloat(flight.price.total));
      
      toast({
        title: "Voos selecionados!",
        description: "Redirecionando para finalizar a reserva...",
      });
      
      navigate("/finalizar-reserva", {
        state: {
          flightData: {
            outbound: selectedOutbound,
            return: flight,
            totalPrice,
            currency: selectedOutbound.price.currency
          }
        }
      });
    }
  };

  // Apply filters to flights
  const filteredFlights = (step === 'outbound' ? outboundFlights : returnFlights).filter(flight => {
    const price = parseFloat(flight.price.total);
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;

    // Filter by stops
    const totalStops = flight.itineraries[0]?.segments.length - 1 || 0;
    if (filters.maxStops !== null && totalStops > filters.maxStops) return false;

    // Filter by airlines
    if (filters.selectedAirlines.length > 0) {
      const flightAirlines = flight.itineraries[0]?.segments.map(s => s.carrierCode) || [];
      if (!flightAirlines.some(airline => filters.selectedAirlines.includes(airline))) return false;
    }

    // Filter by departure time
    if (filters.departureTimeRange.length > 0) {
      const departureTime = new Date(flight.itineraries[0]?.segments[0]?.departure.at);
      const hour = departureTime.getHours();
      const matchesTime = filters.departureTimeRange.some(range => {
        if (range === 'night') return hour >= 0 && hour < 6;
        if (range === 'morning') return hour >= 6 && hour < 12;
        if (range === 'afternoon') return hour >= 12 && hour < 18;
        if (range === 'evening') return hour >= 18 && hour < 24;
        return false;
      });
      if (!matchesTime) return false;
    }

    return true;
  });

  // Get unique airlines from current flights
  const currentFlights = step === 'outbound' ? outboundFlights : returnFlights;
  const uniqueAirlines = Array.from(
    new Set(
      currentFlights.flatMap(flight => 
        flight.itineraries[0]?.segments.map(s => s.carrierCode) || []
      )
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-20 md:pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 md:mb-8">
            <Button 
              variant="ghost" 
              onClick={() => {
                if (step === 'return' && selectedOutbound) {
                  setStep('outbound');
                  setSelectedOutbound(null);
                  setReturnFlights([]);
                } else {
                  navigate("/");
                }
              }}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <div className="flex-grow">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                {step === 'outbound' ? 'Selecione o voo de ida' : 'Selecione o voo de volta'}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {searchParams.get("origin")} → {searchParams.get("destination")}
                {step === 'return' && selectedOutbound && (
                  <span className="block sm:inline sm:ml-4 text-primary font-semibold mt-1 sm:mt-0">
                    Voo de ida: R$ {parseFloat(selectedOutbound.price.total).toFixed(2)}
                  </span>
                )}
              </p>
            </div>

            {/* Mobile Filter Button */}
            {!loading && (step === 'outbound' ? outboundFlights : returnFlights).length > 0 && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="lg" className="lg:hidden w-full sm:w-auto">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <FlightFilters
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    airlines={uniqueAirlines}
                    onFilterChange={setFilters}
                  />
                </SheetContent>
              </Sheet>
            )}
          </div>

          <div className="flex gap-6">
            {/* Filters Sidebar */}
            {!loading && (step === 'outbound' ? outboundFlights : returnFlights).length > 0 && (
              <aside className="w-80 flex-shrink-0 hidden lg:block">
                <div className="sticky top-32">
                  <FlightFilters
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    airlines={uniqueAirlines}
                    onFilterChange={setFilters}
                  />
                </div>
              </aside>
            )}

            {/* Main Content */}
            <div className="flex-grow">
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">
                    {step === 'outbound' ? 'Buscando voos de ida...' : 'Buscando voos de volta...'}
                  </p>
                </div>
              )}

              {!loading && step === 'outbound' && filteredFlights.length > 0 && (
                <div className="space-y-6">
                  {filteredFlights.map((flight) => (
                    <FlightCard 
                      key={flight.id}
                      flight={flight} 
                      carriers={dictionaries.carriers || {}} 
                      flightType="outbound"
                      onSelect={() => handleSelectOutbound(flight)}
                      buttonLabel="Selecionar voo de ida"
                    />
                  ))}
                </div>
              )}

              {!loading && step === 'return' && filteredFlights.length > 0 && (
                <div className="space-y-6">
                  {filteredFlights.map((flight) => (
                    <FlightCard 
                      key={flight.id}
                      flight={flight} 
                      carriers={dictionaries.carriers || {}} 
                      flightType="return"
                      onSelect={() => handleSelectReturn(flight)}
                      buttonLabel="Selecionar e finalizar"
                    />
                  ))}
                </div>
              )}

              {!loading && step === 'outbound' && outboundFlights.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">Nenhum voo encontrado</p>
                  <p className="text-sm text-muted-foreground mt-2">Tente ajustar seus critérios de busca.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FlightSelection;
