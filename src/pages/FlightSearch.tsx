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
      max: 5, // Request 5 from each source
    };

    // Invoke both functions in parallel
    const amadeusPromise = supabase.functions.invoke("search-flights", { body: searchData });
    const travelpayoutsPromise = supabase.functions.invoke("search-flights-travelpayouts", { body: searchData });

    const results = await Promise.allSettled([amadeusPromise, travelpayoutsPromise]);
    
    setLoading(false);

    let allFlights: FlightOffer[] = [];
    let allDictionaries: any = { carriers: {} };
    let hasErrors = false;

    // Process Amadeus results
    const amadeusResult = results[0];
    if (amadeusResult.status === 'fulfilled' && !amadeusResult.value.data.error) {
      allFlights.push(...(amadeusResult.value.data.data || []));
      Object.assign(allDictionaries.carriers, amadeusResult.value.data.dictionaries?.carriers || {});
    } else {
      console.error("Amadeus API Error:", amadeusResult.status === 'fulfilled' ? amadeusResult.value.data.error : amadeusResult.reason);
      hasErrors = true;
    }

    // Process Travelpayouts results
    const travelpayoutsResult = results[1];
    if (travelpayoutsResult.status === 'fulfilled' && !travelpayoutsResult.value.data.error) {
      allFlights.push(...(travelpayoutsResult.value.data.data || []));
      Object.assign(allDictionaries.carriers, travelpayoutsResult.value.data.dictionaries?.carriers || {});
    } else {
      console.error("Travelpayouts API Error:", travelpayoutsResult.status === 'fulfilled' ? travelpayoutsResult.value.data.error : travelpayoutsResult.reason);
      hasErrors = true;
    }

    // Sort all flights by price
    allFlights.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));

    setFlights(allFlights);
    setDictionaries(allDictionaries);

    if (allFlights.length > 0) {
      toast({
        title: "Voos encontrados!",
        description: `Encontramos ${allFlights.length} opções para você.`,
      });
      if (hasErrors) {
        toast({
          title: "Aviso",
          description: "Alguns dos nossos provedores de voos não responderam. A lista pode estar incompleta.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Nenhum voo encontrado",
        description: "Tente ajustar seus critérios de busca.",
        variant: "destructive",
      });
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