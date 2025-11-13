import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FlightCard from "@/components/FlightCard";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
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
    // Combine outbound and return flights for booking
    if (selectedOutbound) {
      const combinedFlight = {
        ...selectedOutbound,
        itineraries: [...selectedOutbound.itineraries, ...flight.itineraries],
        price: {
          total: String(parseFloat(selectedOutbound.price.total) + parseFloat(flight.price.total)),
          currency: selectedOutbound.price.currency
        }
      };
      
      // Navigate to booking page or show booking options
      toast({
        title: "Voos selecionados!",
        description: "Redirecionando para a página de reserva...",
      });
      
      // Here you would navigate to a booking page with the combined flight
      console.log("Combined flight:", combinedFlight);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
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
              <h1 className="text-4xl font-bold mb-2">
                {step === 'outbound' ? 'Selecione o voo de ida' : 'Selecione o voo de volta'}
              </h1>
              <p className="text-muted-foreground">
                {searchParams.get("origin")} → {searchParams.get("destination")}
                {step === 'return' && selectedOutbound && (
                  <span className="ml-4 text-primary font-semibold">
                    Voo de ida selecionado: R$ {parseFloat(selectedOutbound.price.total).toFixed(2)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                {step === 'outbound' ? 'Buscando voos de ida...' : 'Buscando voos de volta...'}
              </p>
            </div>
          )}

          {!loading && step === 'outbound' && outboundFlights.length > 0 && (
            <div className="space-y-6">
              {outboundFlights.map((flight) => (
                <div key={flight.id} className="relative">
                  <FlightCard flight={flight} carriers={dictionaries.carriers || {}} />
                  <Button
                    onClick={() => handleSelectOutbound(flight)}
                    className="absolute bottom-6 right-6"
                    size="lg"
                  >
                    Selecionar voo de ida
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!loading && step === 'return' && returnFlights.length > 0 && (
            <div className="space-y-6">
              {returnFlights.map((flight) => (
                <div key={flight.id} className="relative">
                  <FlightCard flight={flight} carriers={dictionaries.carriers || {}} />
                  <Button
                    onClick={() => handleSelectReturn(flight)}
                    className="absolute bottom-6 right-6"
                    size="lg"
                  >
                    Selecionar e finalizar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
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

      <Footer />
    </div>
  );
};

export default FlightSelection;
