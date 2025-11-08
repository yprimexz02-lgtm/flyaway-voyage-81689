import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface Location {
  name: string;
  country: string;
  type: "city" | "country";
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: "plane" | "mappin";
}

const locations: Location[] = [
  { name: "São Paulo", country: "Brasil", type: "city" },
  { name: "Rio de Janeiro", country: "Brasil", type: "city" },
  { name: "Brasília", country: "Brasil", type: "city" },
  { name: "Salvador", country: "Brasil", type: "city" },
  { name: "Fortaleza", country: "Brasil", type: "city" },
  { name: "Belo Horizonte", country: "Brasil", type: "city" },
  { name: "Manaus", country: "Brasil", type: "city" },
  { name: "Curitiba", country: "Brasil", type: "city" },
  { name: "Recife", country: "Brasil", type: "city" },
  { name: "Porto Alegre", country: "Brasil", type: "city" },
  { name: "Belém", country: "Brasil", type: "city" },
  { name: "Goiânia", country: "Brasil", type: "city" },
  { name: "Florianópolis", country: "Brasil", type: "city" },
  { name: "Natal", country: "Brasil", type: "city" },
  { name: "João Pessoa", country: "Brasil", type: "city" },
  { name: "Maceió", country: "Brasil", type: "city" },
  { name: "Brasil", country: "", type: "country" },

  { name: "Paris", country: "França", type: "city" },
  { name: "Lyon", country: "França", type: "city" },
  { name: "Marselha", country: "França", type: "city" },
  { name: "Nice", country: "França", type: "city" },
  { name: "França", country: "", type: "country" },

  { name: "Nova York", country: "Estados Unidos", type: "city" },
  { name: "Los Angeles", country: "Estados Unidos", type: "city" },
  { name: "Miami", country: "Estados Unidos", type: "city" },
  { name: "Las Vegas", country: "Estados Unidos", type: "city" },
  { name: "Orlando", country: "Estados Unidos", type: "city" },
  { name: "San Francisco", country: "Estados Unidos", type: "city" },
  { name: "Chicago", country: "Estados Unidos", type: "city" },
  { name: "Washington", country: "Estados Unidos", type: "city" },
  { name: "Boston", country: "Estados Unidos", type: "city" },
  { name: "Estados Unidos", country: "", type: "country" },

  { name: "Londres", country: "Inglaterra", type: "city" },
  { name: "Manchester", country: "Inglaterra", type: "city" },
  { name: "Liverpool", country: "Inglaterra", type: "city" },
  { name: "Inglaterra", country: "", type: "country" },

  { name: "Roma", country: "Itália", type: "city" },
  { name: "Milão", country: "Itália", type: "city" },
  { name: "Veneza", country: "Itália", type: "city" },
  { name: "Florença", country: "Itália", type: "city" },
  { name: "Nápoles", country: "Itália", type: "city" },
  { name: "Itália", country: "", type: "country" },

  { name: "Barcelona", country: "Espanha", type: "city" },
  { name: "Madrid", country: "Espanha", type: "city" },
  { name: "Sevilha", country: "Espanha", type: "city" },
  { name: "Valência", country: "Espanha", type: "city" },
  { name: "Espanha", country: "", type: "country" },

  { name: "Tóquio", country: "Japão", type: "city" },
  { name: "Osaka", country: "Japão", type: "city" },
  { name: "Kyoto", country: "Japão", type: "city" },
  { name: "Hiroshima", country: "Japão", type: "city" },
  { name: "Japão", country: "", type: "country" },

  { name: "Dubai", country: "Emirados Árabes Unidos", type: "city" },
  { name: "Abu Dhabi", country: "Emirados Árabes Unidos", type: "city" },
  { name: "Emirados Árabes Unidos", country: "", type: "country" },

  { name: "Atenas", country: "Grécia", type: "city" },
  { name: "Santorini", country: "Grécia", type: "city" },
  { name: "Mykonos", country: "Grécia", type: "city" },
  { name: "Grécia", country: "", type: "country" },

  { name: "Lisboa", country: "Portugal", type: "city" },
  { name: "Porto", country: "Portugal", type: "city" },
  { name: "Faro", country: "Portugal", type: "city" },
  { name: "Portugal", country: "", type: "country" },

  { name: "Amsterdã", country: "Holanda", type: "city" },
  { name: "Roterdã", country: "Holanda", type: "city" },
  { name: "Holanda", country: "", type: "country" },

  { name: "Buenos Aires", country: "Argentina", type: "city" },
  { name: "Mendoza", country: "Argentina", type: "city" },
  { name: "Córdoba", country: "Argentina", type: "city" },
  { name: "Argentina", country: "", type: "country" },

  { name: "Santiago", country: "Chile", type: "city" },
  { name: "Valparaíso", country: "Chile", type: "city" },
  { name: "Chile", country: "", type: "country" },

  { name: "Lima", country: "Peru", type: "city" },
  { name: "Cusco", country: "Peru", type: "city" },
  { name: "Peru", country: "", type: "country" },

  { name: "Cidade do México", country: "México", type: "city" },
  { name: "Cancún", country: "México", type: "city" },
  { name: "Playa del Carmen", country: "México", type: "city" },
  { name: "México", country: "", type: "country" },

  { name: "Toronto", country: "Canadá", type: "city" },
  { name: "Vancouver", country: "Canadá", type: "city" },
  { name: "Montreal", country: "Canadá", type: "city" },
  { name: "Canadá", country: "", type: "country" },

  { name: "Sydney", country: "Austrália", type: "city" },
  { name: "Melbourne", country: "Austrália", type: "city" },
  { name: "Brisbane", country: "Austrália", type: "city" },
  { name: "Austrália", country: "", type: "country" },

  { name: "Bangkok", country: "Tailândia", type: "city" },
  { name: "Phuket", country: "Tailândia", type: "city" },
  { name: "Tailândia", country: "", type: "country" },

  { name: "Singapura", country: "Singapura", type: "city" },

  { name: "Istambul", country: "Turquia", type: "city" },
  { name: "Ancara", country: "Turquia", type: "city" },
  { name: "Turquia", country: "", type: "country" },

  { name: "Cairo", country: "Egito", type: "city" },
  { name: "Alexandria", country: "Egito", type: "city" },
  { name: "Egito", country: "", type: "country" },

  { name: "Marrakech", country: "Marrocos", type: "city" },
  { name: "Casablanca", country: "Marrocos", type: "city" },
  { name: "Marrocos", country: "", type: "country" },

  { name: "Cidade do Cabo", country: "África do Sul", type: "city" },
  { name: "Joanesburgo", country: "África do Sul", type: "city" },
  { name: "África do Sul", country: "", type: "country" },

  { name: "Bali", country: "Indonésia", type: "city" },
  { name: "Jacarta", country: "Indonésia", type: "city" },
  { name: "Indonésia", country: "", type: "country" },

  { name: "Seul", country: "Coreia do Sul", type: "city" },
  { name: "Busan", country: "Coreia do Sul", type: "city" },
  { name: "Coreia do Sul", country: "", type: "country" },

  { name: "Hong Kong", country: "China", type: "city" },
  { name: "Pequim", country: "China", type: "city" },
  { name: "Xangai", country: "China", type: "city" },
  { name: "China", country: "", type: "country" },

  { name: "Maldivas", country: "", type: "country" },
  { name: "Islândia", country: "", type: "country" },
  { name: "Noruega", country: "", type: "country" },
  { name: "Suécia", country: "", type: "country" },
  { name: "Dinamarca", country: "", type: "country" },
  { name: "Finlândia", country: "", type: "country" },
  { name: "Suíça", country: "", type: "country" },
  { name: "Áustria", country: "", type: "country" },
  { name: "Alemanha", country: "", type: "country" },
  { name: "Bélgica", country: "", type: "country" },
  { name: "Irlanda", country: "", type: "country" },
  { name: "Escócia", country: "", type: "country" },
  { name: "Polônia", country: "", type: "country" },
  { name: "República Tcheca", country: "", type: "country" },
  { name: "Hungria", country: "", type: "country" },
  { name: "Croácia", country: "", type: "country" },
];

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "Digite a cidade ou país...",
  className,
  icon = "mappin"
}: LocationAutocompleteProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);

    if (inputValue.trim().length >= 2) {
      const searchTerm = inputValue.toLowerCase();
      const filtered = locations
        .filter(loc =>
          loc.name.toLowerCase().includes(searchTerm) ||
          loc.country.toLowerCase().includes(searchTerm)
        )
        .sort((a, b) => {
          const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
          const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return 0;
        })
        .slice(0, 10);

      setFilteredLocations(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredLocations([]);
    }
  };

  const handleSelectLocation = (location: Location) => {
    const displayValue = location.type === "country"
      ? location.name
      : `${location.name}, ${location.country}`;
    onChange(displayValue);
    setShowSuggestions(false);
  };

  const Icon = icon === "plane" ? Plane : MapPin;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (filteredLocations.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className={cn("pl-10", className)}
        />
      </div>

      {showSuggestions && filteredLocations.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredLocations.map((location, index) => (
            <button
              key={`${location.name}-${location.country}-${index}`}
              type="button"
              onClick={() => handleSelectLocation(location)}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3"
            >
              <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{location.name}</div>
                {location.country && (
                  <div className="text-sm text-muted-foreground truncate">{location.country}</div>
                )}
                {location.type === "country" && (
                  <div className="text-xs text-muted-foreground">País</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
