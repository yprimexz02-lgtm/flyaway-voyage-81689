import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FlightSearchForm from "@/components/FlightSearchForm";
import FlightCard from "@/components/FlightCard";
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
      travelClass: searchParams.get("travelClass") || "ECONOMY",
      max: 10,
    };

    try {
      const { data, error } = await supabase.functions.invoke("search-flights-travelpayouts", { body: searchData });

      if (error || data.error) {
        throw new Error(error?.message || data.error);
      }

      const flightResults: FlightOffer[] = data.data || [];
      const flightDictionaries = data.dictionaries || {};

      flightResults.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));

      setFlights(flightResults);
      setDictionaries(flightDictionaries);

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
    } catch (err) {
      console.error("Travelpayouts API Error:", err);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar os voos. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">
                {flights.length} {flights.length === 1 ? "voo encontrado" : "voos encontrados"}
              </h2>
              
              {flights.map((flight) => (
                <FlightCard 
                  key={flight.id} 
                  flight={flight} 
                  carriers={dictionaries.carriers || {}} 
                />
              ))}
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