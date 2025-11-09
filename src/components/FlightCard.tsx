import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, ArrowRight, Briefcase } from "lucide-react";

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

interface FlightCardProps {
  flight: FlightOffer;
  carriers: Record<string, string>;
}

const FlightCard = ({ flight, carriers }: FlightCardProps) => {
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' });
  
  const formatDuration = (duration: string) => {
    if (!duration) return "N/A";
    const hours = duration.match(/(\d+)H/)?.[1] || "0";
    const minutes = duration.match(/(\d+)M/)?.[1] || "0";
    return `${hours}h ${minutes}m`;
  };

  const estimatePriceInBRL = (price: string, currency: string) => {
    // Using a more current rate for estimation, but the original price in EUR is the source of truth.
    const eurToBrl = 5.85; 
    const priceInBrl = currency === "EUR" ? parseFloat(price) * eurToBrl : parseFloat(price);
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceInBrl);
  };

  const getLayoverDuration = (arrival: string, departure: string) => {
    const arrivalTime = new Date(arrival).getTime();
    const departureTime = new Date(departure).getTime();
    const diff = departureTime - arrivalTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-premium hover:border-primary/50 border-2 border-transparent">
      <div className="flex flex-col lg:flex-row">
        {/* Flight Details Section */}
        <div className="flex-grow p-6">
          {flight.itineraries.map((itinerary, itineraryIndex) => (
            <div key={itineraryIndex}>
              {/* Itinerary Header */}
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline" className="font-semibold">
                  {itineraryIndex === 0 ? "Voo de Ida" : "Voo de Volta"}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Duração total: {formatDuration(itinerary.duration)}</span>
                </div>
              </div>

              {/* Segments */}
              {itinerary.segments.map((segment, segmentIndex) => (
                <div key={segmentIndex}>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center mb-4">
                    {/* Departure */}
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatTime(segment.departure.at)}</p>
                      <p className="text-lg font-semibold">{segment.departure.iataCode}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(segment.departure.at)}</p>
                    </div>

                    {/* Arrow and Duration */}
                    <div className="flex flex-col items-center text-muted-foreground">
                      <div className="w-full h-px bg-border" />
                      <Plane className="w-5 h-5 -mt-2.5 bg-card px-1" />
                      <p className="text-xs mt-1">{formatDuration(segment.duration)}</p>
                    </div>

                    {/* Arrival */}
                    <div className="text-left">
                      <p className="text-2xl font-bold">{formatTime(segment.arrival.at)}</p>
                      <p className="text-lg font-semibold">{segment.arrival.iataCode}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(segment.arrival.at)}</p>
                    </div>
                  </div>
                  
                  {/* Airline Info */}
                  <div className="text-center text-sm text-muted-foreground mb-4">
                    {carriers[segment.carrierCode] || segment.carrierCode} - Voo {segment.number}
                  </div>

                  {/* Layover Info */}
                  {segmentIndex < itinerary.segments.length - 1 && (
                    <div className="flex items-center justify-center gap-2 my-4 text-sm text-accent-foreground bg-accent/20 p-2 rounded-md">
                      <Clock className="w-4 h-4" />
                      <span>
                        Conexão em {segment.arrival.iataCode} - Espera de {getLayoverDuration(segment.arrival.at, itinerary.segments[segmentIndex + 1].departure.at)}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Separator between itineraries */}
              {itineraryIndex < flight.itineraries.length - 1 && (
                <Separator className="my-6" />
              )}
            </div>
          ))}
        </div>

        {/* Price and CTA Section */}
        <div className="bg-muted/30 lg:w-64 flex flex-col justify-center items-center p-6 border-t lg:border-t-0 lg:border-l border-border">
          <p className="text-sm text-muted-foreground">Preço total GFC Travel</p>
          <p className="text-3xl font-extrabold text-gradient mb-2">
            {estimatePriceInBRL(flight.price.total, flight.price.currency)}
          </p>
          <p className="text-sm text-muted-foreground">Preço pela companhia</p>
          <p className="text-lg font-semibold text-foreground mb-4">
            {new Intl.NumberFormat("de-DE", { style: "currency", currency: flight.price.currency }).format(parseFloat(flight.price.total))}
          </p>
          <Button size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-glow">
            Selecionar Voo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
            <Briefcase className="w-3 h-3" />
            <span>Verificar política de bagagem</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FlightCard;