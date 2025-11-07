import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FlightSearchForm from "@/components/FlightSearchForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plane, Clock, ArrowRight, ArrowLeft } from "lucide-react";
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

    try {
      const searchData = {
        origin: searchParams.get("origin") || "",
        destination: searchParams.get("destination") || "",
        departureDate: searchParams.get("departureDate") || "",
        returnDate: searchParams.get("returnDate") || undefined,
        adults: parseInt(searchParams.get("adults") || "1"),
        travelClass: searchParams.get("travelClass") || "ECONOMY",
        max: 10,
      };

      console.log("Searching flights with:", searchData);

      const { data, error } = await supabase.functions.invoke("search-flights", {
        body: searchData,
      });

      if (error) throw error;

      console.log("Flight search response:", data);

      if (data?.data) {
        setFlights(data.data);
        toast({
          title: "Voos encontrados!",
          description: `Encontramos ${data.data.length} opções para você.`,
        });
      } else {
        toast({
          title: "Nenhum voo encontrado",
          description: "Tente ajustar seus critérios de busca.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching flights:", error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar voos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (duration: string) => {
    const hours = duration.match(/(\d+)H/)?.[1] || "0";
    const minutes = duration.match(/(\d+)M/)?.[1] || "0";
    return `${hours}h ${minutes}m`;
  };

  const formatPrice = (price: string, currency: string) => {
    // Converter EUR para BRL (taxa aproximada)
    const eurToBrl = 5.65; // Taxa de câmbio aproximada
    const priceInBrl = currency === "EUR" ? parseFloat(price) * eurToBrl : parseFloat(price);
    
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceInBrl);
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
              <p className="text-muted-foreground">Buscando os melhores voos para você...</p>
            </div>
          )}

          {!loading && flights.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">{flights.length} voos encontrados</h2>
              
              {flights.map((flight) => (
                <Card key={flight.id} className="hover:shadow-hover transition-all">
                  <CardContent className="p-6">
                    {flight.itineraries.map((itinerary, idx) => (
                      <div key={idx} className="mb-4 last:mb-0">
                        {itinerary.segments.map((segment, segIdx) => (
                          <div key={segIdx} className="mb-4 last:mb-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6 flex-1">
                                <div className="text-center">
                                  <p className="text-2xl font-bold">{formatTime(segment.departure.at)}</p>
                                  <p className="text-sm text-muted-foreground">{segment.departure.iataCode}</p>
                                </div>

                                <div className="flex-1 flex flex-col items-center">
                                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">{formatDuration(segment.duration)}</span>
                                  </div>
                                  <div className="w-full h-px bg-border relative">
                                    <Plane className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background" />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {segment.carrierCode} {segment.number}
                                  </p>
                                </div>

                                <div className="text-center">
                                  <p className="text-2xl font-bold">{formatTime(segment.arrival.at)}</p>
                                  <p className="text-sm text-muted-foreground">{segment.arrival.iataCode}</p>
                                </div>
                              </div>

                              {segIdx === 0 && (
                                <div className="ml-8 text-right">
                                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                                   <p className="text-3xl font-bold text-primary mb-2">
                                    {formatPrice(flight.price.total, flight.price.currency)}
                                   </p>
                                   <p className="text-xs text-muted-foreground">
                                     Valor original: €{parseFloat(flight.price.total).toFixed(2)}
                                   </p>
                                  <Button className="bg-gradient-to-r from-primary to-secondary">
                                    Reservar Agora
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {itinerary.segments.length > 1 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {itinerary.segments.length - 1} {itinerary.segments.length === 2 ? "escala" : "escalas"}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
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
