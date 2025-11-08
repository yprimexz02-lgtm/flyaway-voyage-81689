import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Plane, CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import FlightSearchLoading from "./FlightSearchLoading";

interface FlightSearchFormProps {
  variant?: "hero" | "page";
}

const FlightSearchForm = ({ variant = "page" }: FlightSearchFormProps) => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  
  const popularCities = [
    { name: "São Paulo", code: "GRU" },
    { name: "Rio de Janeiro", code: "GIG" },
    { name: "Brasília", code: "BSB" },
    { name: "Salvador", code: "SSA" },
    { name: "Fortaleza", code: "FOR" },
    { name: "Belo Horizonte", code: "CNF" },
    { name: "Manaus", code: "MAO" },
    { name: "Curitiba", code: "CWB" },
    { name: "Recife", code: "REC" },
    { name: "Porto Alegre", code: "POA" },
    { name: "Belém", code: "BEL" },
    { name: "Goiânia", code: "GYN" },
    { name: "Campinas", code: "VCP" },
    { name: "São Luís", code: "SLZ" },
    { name: "Maceió", code: "MCZ" },
    { name: "Natal", code: "NAT" },
    { name: "João Pessoa", code: "JPA" },
    { name: "Teresina", code: "THE" },
    { name: "Campo Grande", code: "CGR" },
    { name: "Cuiabá", code: "CGB" },
    { name: "Florianópolis", code: "FLN" },
    { name: "Vitória", code: "VIX" },
    { name: "Aracaju", code: "AJU" },
    { name: "Ribeirão Preto", code: "RAO" },
    { name: "Uberlândia", code: "UDI" },
    { name: "Juiz de Fora", code: "JDF" },
    { name: "Londrina", code: "LDB" },
    { name: "Joinville", code: "JOI" },
    { name: "Foz do Iguaçu", code: "IGU" },
    { name: "Navegantes", code: "NVT" },
    { name: "Palmas", code: "PMW" },
    { name: "Porto Seguro", code: "BPS" },
    { name: "Ilhéus", code: "IOS" },
    { name: "Imperatriz", code: "IMP" },
    { name: "Santarém", code: "STM" },
    { name: "Marabá", code: "MAB" },
    { name: "Altamira", code: "ATM" },
    { name: "Boa Vista", code: "BVB" },
    { name: "Rio Branco", code: "RBR" },
    { name: "Porto Velho", code: "PVH" },
    { name: "Lisboa", code: "LIS" },
    { name: "Paris", code: "CDG" },
    { name: "Londres", code: "LHR" },
    { name: "Nova York", code: "JFK" },
    { name: "Miami", code: "MIA" },
    { name: "Orlando", code: "MCO" },
    { name: "Buenos Aires", code: "EZE" },
    { name: "Santiago", code: "SCL" },
    { name: "Madri", code: "MAD" },
    { name: "Roma", code: "FCO" },
    { name: "Tóquio", code: "NRT" },
    { name: "Dubai", code: "DXB" },
    { name: "Cancún", code: "CUN" },
    { name: "Amsterdã", code: "AMS" },
    { name: "Frankfurt", code: "FRA" },
  ];
  
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    adults: "1",
    travelClass: "ECONOMY",
    tripType: "roundtrip",
  });

  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  const filteredOriginCities = popularCities.filter(city =>
    city.name.toLowerCase().includes(originSearch.toLowerCase()) ||
    city.code.toLowerCase().includes(originSearch.toLowerCase())
  ).slice(0, 8);

  const filteredDestinationCities = popularCities.filter(city =>
    city.name.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    city.code.toLowerCase().includes(destinationSearch.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOrigin = (city: { name: string; code: string }) => {
    setFormData({ ...formData, origin: city.code });
    setOriginSearch(`${city.name} (${city.code})`);
    setShowOriginSuggestions(false);
  };

  const selectDestination = (city: { name: string; code: string }) => {
    setFormData({ ...formData, destination: city.code });
    setDestinationSearch(`${city.name} (${city.code})`);
    setShowDestinationSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.origin || !formData.destination) {
      toast.error("Por favor, selecione origem e destino da lista", {
        description: "Clique em uma das cidades sugeridas"
      });
      return;
    }

    if (!departureDate) {
      toast.error("Por favor, selecione a data de ida");
      return;
    }

    if (formData.tripType === "roundtrip" && !returnDate) {
      toast.error("Por favor, selecione a data de volta");
      return;
    }
    
    // Show loading animation
    setIsSearching(true);
    
    // Simulate search delay and then navigate
    setTimeout(() => {
      const params = new URLSearchParams({
        origin: formData.origin,
        destination: formData.destination,
        departureDate: format(departureDate, "yyyy-MM-dd"),
        ...(formData.tripType === "roundtrip" && returnDate ? { returnDate: format(returnDate, "yyyy-MM-dd") } : {}),
        adults: formData.adults,
        travelClass: formData.travelClass,
      });
      navigate(`/buscar-voos?${params.toString()}`);
      setIsSearching(false);
    }, 2000);
  };

  const isHero = variant === "hero";

  return (
    <>
      {isSearching && (
        <FlightSearchLoading 
          origin={originSearch} 
          destination={destinationSearch} 
        />
      )}
    <form 
      onSubmit={handleSubmit} 
      className={`${
        isHero 
          ? "glass-card p-8 rounded-3xl shadow-premium border-2 border-white/30" 
          : "bg-card p-6 rounded-2xl shadow-card border-2 border-border/50"
      }`}
    >
      {/* Tipo de Viagem */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, tripType: "roundtrip" })}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            formData.tripType === "roundtrip"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Ida e Volta
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, tripType: "oneway", returnDate: "" })}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            formData.tripType === "oneway"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Apenas Ida
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Origem */}
        <div className="space-y-2" ref={originRef}>
          <Label htmlFor="origin" className="text-sm font-medium">Origem</Label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              id="origin"
              placeholder="Digite a cidade de origem..."
              className={cn(
                "pl-10",
                formData.origin ? "border-primary" : ""
              )}
              value={originSearch}
              onChange={(e) => {
                setOriginSearch(e.target.value);
                setShowOriginSuggestions(true);
                // Clear the selected origin if user types again
                if (formData.origin) {
                  setFormData({ ...formData, origin: "" });
                }
              }}
              onFocus={() => setShowOriginSuggestions(true)}
              required
            />
            {showOriginSuggestions && originSearch && filteredOriginCities.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredOriginCities.map((city) => (
                  <button
                    key={city.code}
                    type="button"
                    onClick={() => selectOrigin(city)}
                    className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <Plane className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{city.name}</span>
                    <span className="text-sm text-muted-foreground">({city.code})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Destino */}
        <div className="space-y-2" ref={destinationRef}>
          <Label htmlFor="destination" className="text-sm font-medium">Destino</Label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 z-10" />
            <Input
              id="destination"
              placeholder="Digite a cidade de destino..."
              className={cn(
                "pl-10",
                formData.destination ? "border-primary" : ""
              )}
              value={destinationSearch}
              onChange={(e) => {
                setDestinationSearch(e.target.value);
                setShowDestinationSuggestions(true);
                // Clear the selected destination if user types again
                if (formData.destination) {
                  setFormData({ ...formData, destination: "" });
                }
              }}
              onFocus={() => setShowDestinationSuggestions(true)}
              required
            />
            {showDestinationSuggestions && destinationSearch && filteredDestinationCities.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredDestinationCities.map((city) => (
                  <button
                    key={city.code}
                    type="button"
                    onClick={() => selectDestination(city)}
                    className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <Plane className="w-4 h-4 text-muted-foreground rotate-90" />
                    <span className="font-medium">{city.name}</span>
                    <span className="text-sm text-muted-foreground">({city.code})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Data Ida */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Data de Ida</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !departureDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {departureDate ? format(departureDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover" align="start">
              <Calendar
                mode="single"
                selected={departureDate}
                onSelect={setDepartureDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className="pointer-events-auto"
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Data Volta */}
        {formData.tripType === "roundtrip" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data de Volta</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !returnDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {returnDate ? format(returnDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="start">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  disabled={(date) => date < (departureDate || new Date())}
                  initialFocus
                  className="pointer-events-auto"
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Passageiros */}
        <div className="space-y-2">
          <Label htmlFor="adults" className="text-sm font-medium">Passageiros</Label>
          <Select value={formData.adults} onValueChange={(value) => setFormData({ ...formData, adults: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "adulto" : "adultos"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Classe */}
        <div className="space-y-2">
          <Label htmlFor="class" className="text-sm font-medium">Classe</Label>
          <Select value={formData.travelClass} onValueChange={(value) => setFormData({ ...formData, travelClass: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ECONOMY">Econômica</SelectItem>
              <SelectItem value="PREMIUM_ECONOMY">Econômica Premium</SelectItem>
              <SelectItem value="BUSINESS">Executiva</SelectItem>
              <SelectItem value="FIRST">Primeira Classe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        type="submit" 
        size="lg"
        disabled={isSearching}
        className={`w-full transition-all duration-300 ${isHero ? "bg-gradient-to-r from-primary to-secondary hover:shadow-glow text-lg h-16 rounded-2xl font-semibold" : "bg-gradient-to-r from-primary to-secondary hover:shadow-glow"}`}
      >
        <Search className="w-5 h-5 mr-2" />
        {isSearching ? "Buscando..." : "Buscar Voos"}
      </Button>
    </form>
    </>
  );
};

export default FlightSearchForm;