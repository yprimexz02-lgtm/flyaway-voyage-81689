import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FlightSearchForm from "@/components/FlightSearchForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plane, Clock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

// Interface para os dados do voo, similar à da página FlightSearch
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

const Cotacao = () => {
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Função para buscar voos, agora dentro da página de cotação
  const searchFlights = async (params: URLSearchParams) => {
    setLoading(true);
    setFlights([]);

    try {
      const searchData = {
        origin: params.get("origin") || "",
        destination: params.get("destination") || "",
        departureDate: params.get("departureDate") || "",
        returnDate: params.get("returnDate") || undefined,
        adults: parseInt(params.get("adults") || "1"),
        travelClass: params.get("travelClass") || "ECONOMY",
        max: 15, // Aumentando um pouco o número de resultados
      };

      if (!searchData.origin || !searchData.destination || !searchData.departureDate) {
        toast({
          title: "Dados insuficientes",
          description: "Por favor, preencha origem, destino e data de partida.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("search-flights", {
        body: searchData,
      });

      if (error) throw error;

      if (data?.data && data.data.length > 0) {
        setFlights(data.data);
        toast({
          title: "Voos encontrados!",
          description: `Encontramos ${data.data.length} opções para você.`,
        });
      } else {
        setFlights([]);
        toast({
          title: "Nenhum voo encontrado",
          description: "Tente ajustar seus critérios de busca ou datas.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching flights:", error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar voos. Verifique se as chaves da Amadeus estão configuradas corretamente no Supabase e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções de formatação
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const formatDuration = (duration: string) => (duration.match(/(\d+)H/)?.[1] || "0") + "h " + (duration.match(/(\d+)M/)?.[1] || "0") + "m";
  
  const formatPrice = (price: string) => {
    const eurToBrlRate = 6.15;
    const priceInBrl = parseFloat(price) * eurToBrlRate;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceInBrl);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Card className="backdrop-blur-sm bg-card/95 border-primary/20 shadow-xl mb-12">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Pesquise seu Voo
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Encontre os melhores preços e opções para sua viagem em tempo real.
                </p>
              </div>
              {/* Usando um componente de formulário modificado para acionar a busca nesta página */}
              <FlightSearchForm onSearch={searchFlights} />
            </CardContent>
          </Card>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Buscando os melhores voos para você...</p>
              <p className="text-sm text-muted-foreground mt-2">(Isso pode levar alguns segundos)</p>
            </div>
          )}

          {!loading && flights.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">{flights.length} voos encontrados</h2>
              {flights.map((flight) => (
                <Card key={flight.id} className="hover:shadow-hover transition-all duration-300 border-border/50 hover:border-primary/50">
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div className="md:col-span-3">
                      {flight.itineraries.map((itinerary, idx) => (
                        <div key={idx} className="mb-4 last:mb-0 border-b border-border/30 pb-4 last:border-b-0 last:pb-0">
                          <p className="font-semibold text-primary mb-2">{idx === 0 ? 'Voo de Ida' : 'Voo de Volta'}</p>
                          {itinerary.segments.map((segment, segIdx) => (
                            <div key={segIdx} className="flex items-center gap-4 md:gap-6">
                              <div className="text-center">
                                <p className="text-xl font-bold">{formatTime(segment.departure.at)}</p>
                                <p className="text-sm font-semibold text-muted-foreground">{segment.departure.iataCode}</p>
                              </div>
                              <div className="flex-1 flex flex-col items-center">
                                <div className="text-xs text-muted-foreground">{formatDuration(segment.duration)}</div>
                                <div className="w-full h-px bg-border relative my-1">
                                  <Plane className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-0.5" />
                                </div>
                                <div className="text-xs text-muted-foreground">{segment.carrierCode} {segment.number}</div>
                              </div>
                              <div className="text-center">
                                <p className="text-xl font-bold">{formatTime(segment.arrival.at)}</p>
                                <p className="text-sm font-semibold text-muted-foreground">{segment.arrival.iataCode}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="md:col-span-1 text-center md:text-right border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6">
                      <p className="text-sm text-muted-foreground mb-1">Preço total</p>
                      <p className="text-3xl font-bold text-gradient mb-2">{formatPrice(flight.price.total)}</p>
                      <p className="text-xs text-muted-foreground mb-4">Valor original: €{parseFloat(flight.price.total).toFixed(2)}</p>
                      <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform">
                        Selecionar Voo
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Precisamos modificar o FlightSearchForm para ele chamar a função de busca em vez de navegar
const FlightSearchForm = ({ onSearch }: { onSearch: (params: URLSearchParams) => void }) => {
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    adults: "1",
    travelClass: "ECONOMY",
    tripType: "roundtrip",
  });
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      origin: formData.origin,
      destination: formData.destination,
      departureDate: departureDate ? format(departureDate, "yyyy-MM-dd") : "",
      ...(formData.tripType === "roundtrip" && returnDate ? { returnDate: format(returnDate, "yyyy-MM-dd") } : {}),
      adults: formData.adults,
      travelClass: formData.travelClass,
    });
    onSearch(params);
  };

  // O restante do formulário (Inputs, Popovers, etc.) permanece o mesmo
  // Para simplificar, vou colocar uma versão mais enxuta aqui,
  // mantendo a lógica principal. O seu componente original é mais completo.
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Input placeholder="Origem (ex: GRU)" onChange={e => setFormData({...formData, origin: e.target.value.toUpperCase()})} required />
         <Input placeholder="Destino (ex: LIS)" onChange={e => setFormData({...formData, destination: e.target.value.toUpperCase()})} required />
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date pickers e outros campos iriam aqui. Usando inputs simples para o exemplo */}
        <Input type="text" onFocus={(e) => e.target.type='date'} onBlur={(e) => e.target.type='text'} placeholder="Data de Ida" onChange={e => setDepartureDate(new Date(e.target.value))} required />
        <Input type="text" onFocus={(e) => e.target.type='date'} onBlur={(e) => e.target.type='text'} placeholder="Data de Volta" onChange={e => setReturnDate(new Date(e.target.value))} />
       </div>
       <Button type="submit" size="lg" className="w-full">
         <Search className="w-5 h-5 mr-2" />
         Buscar Voos
       </Button>
    </form>
  );
};

export default Cotacao;