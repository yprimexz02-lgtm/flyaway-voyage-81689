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
  flightType?: 'outbound' | 'return';
  onSelect?: () => void;
  buttonLabel?: string;
  isRoundTrip?: boolean;
}

const FlightCard = ({ flight, carriers, flightType = 'outbound', onSelect, buttonLabel, isRoundTrip = false }: FlightCardProps) => {
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' });
  
  const formatDuration = (duration: string) => {
    if (!duration) return "N/A";
    const hours = duration.match(/(\d+)H/)?.[1] || "0";
    const minutes = duration.match(/(\d+)M/)?.[1] || "0";
    return `${hours}h ${minutes}m`;
  };

  const getLayoverDuration = (arrival: string, departure: string) => {
    const arrivalTime = new Date(arrival).getTime();
    const departureTime = new Date(departure).getTime();
    const diff = departureTime - arrivalTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getAirlineLogo = (carrierCode: string) => {
    return `https://images.kiwi.com/airlines/64/${carrierCode}.png`;
  };

  const eurToBrl = 5.85;
  const airlinePriceInBRL = flight.price.currency === "EUR" 
    ? parseFloat(flight.price.total) * eurToBrl 
    : parseFloat(flight.price.total);
  
  const gfcTravelPrice = airlinePriceInBRL * 0.88; // 12% discount

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 border border-border bg-card">
      <div className="flex flex-col lg:flex-row">
        {/* Flight Details Section */}
        <div className="flex-grow p-6">
          {flight.itineraries.map((itinerary, itineraryIndex) => (
            <div key={itineraryIndex} className="mb-6 last:mb-0">
              {/* Itinerary Header with Airline Info */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {itinerary.segments.map((seg, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <img 
                          src={getAirlineLogo(seg.carrierCode)}
                          alt={carriers[seg.carrierCode] || seg.carrierCode}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {idx < itinerary.segments.length - 1 && (
                          <span className="text-muted-foreground">+</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <Badge variant="outline" className="font-semibold mb-1">
                      {flightType === 'outbound' ? "Voo de Ida" : "Voo de Volta"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {itinerary.segments.map(s => carriers[s.carrierCode] || s.carrierCode).join(" + ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(itinerary.duration)}</span>
                </div>
              </div>

              {/* Segments */}
              <div className="space-y-6">
                {itinerary.segments.map((segment, segmentIndex) => (
                  <div key={segmentIndex}>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
                      {/* Departure */}
                      <div className="text-left">
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatTime(segment.departure.at)}</p>
                        <p className="text-lg sm:text-xl font-semibold text-foreground mt-1">{segment.departure.iataCode}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{formatDate(segment.departure.at)}</p>
                      </div>

                      {/* Arrow and Duration */}
                      <div className="flex flex-col items-center min-w-[80px] sm:min-w-[120px]">
                        <div className="relative w-full">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-border"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <Plane className="w-4 h-4 sm:w-5 sm:h-5 bg-card text-primary rotate-90" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium text-center">{formatDuration(segment.duration)}</p>
                        <Badge variant="secondary" className="mt-1 text-xs hidden sm:inline-flex">
                          {segment.carrierCode} {segment.number}
                        </Badge>
                      </div>

                      {/* Arrival */}
                      <div className="text-right">
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatTime(segment.arrival.at)}</p>
                        <p className="text-lg sm:text-xl font-semibold text-foreground mt-1">{segment.arrival.iataCode}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{formatDate(segment.arrival.at)}</p>
                      </div>
                    </div>

                    {/* Layover info */}
                    {segmentIndex < itinerary.segments.length - 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 sm:py-4 mt-4 bg-muted/30 rounded-lg">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium text-center">
                          Conexão em {segment.arrival.iataCode} • 
                          Espera de {getLayoverDuration(segment.arrival.at, itinerary.segments[segmentIndex + 1].departure.at)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {itineraryIndex < flight.itineraries.length - 1 && (
                <Separator className="my-6" />
              )}
            </div>
          ))}

          {/* Flight Info Footer */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  <span>Bagagem de mão incluída</span>
                </div>
                <Badge variant="outline" className="text-primary border-primary/50 w-fit">
                  {flight.itineraries[0].segments.length - 1 === 0 
                    ? "Voo direto" 
                    : `${flight.itineraries[0].segments.length - 1} parada${flight.itineraries[0].segments.length - 1 > 1 ? 's' : ''}`
                  }
                </Badge>
              </div>
              <a 
                href="#" 
                className="text-primary hover:underline text-xs font-medium"
                onClick={(e) => e.preventDefault()}
              >
                Ver política de bagagem →
              </a>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="lg:w-64 bg-muted/30 p-4 sm:p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border">
          <div className="flex-grow">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Preço da companhia</p>
            <p className="text-base sm:text-lg font-semibold text-muted-foreground line-through mb-3">
              R$ {airlinePriceInBRL.toFixed(2)}
            </p>
            
            <div className="bg-primary/10 rounded-lg p-3 mb-4">
              <p className="text-xs text-primary font-semibold mb-1">
                {isRoundTrip ? "PREÇO TOTAL IDA E VOLTA PELA GFC TRAVEL" : "PREÇO PELA GFC TRAVEL"}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                R$ {gfcTravelPrice.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Economia de R$ {(airlinePriceInBRL - gfcTravelPrice).toFixed(2)}
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground mb-4">
              ou até 12x de <span className="font-semibold text-foreground">R$ {(gfcTravelPrice / 12).toFixed(2)}</span>
            </p>
          </div>

          {onSelect && buttonLabel && (
            <Button
              onClick={onSelect}
              className="w-full mt-4"
              size="lg"
            >
              {buttonLabel}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FlightCard;