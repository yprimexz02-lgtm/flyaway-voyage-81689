import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FlightFiltersProps {
  minPrice: number;
  maxPrice: number;
  airlines: string[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  priceRange: [number, number];
  selectedAirlines: string[];
  maxStops: number | null;
  departureTimeRange: string[];
}

const FlightFilters = ({ minPrice, maxPrice, airlines, onFilterChange }: FlightFiltersProps) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [maxStops, setMaxStops] = useState<number | null>(null);
  const [departureTimeRange, setDepartureTimeRange] = useState<string[]>([]);

  const timeRanges = [
    { label: "Madrugada (00h-06h)", value: "night" },
    { label: "Manhã (06h-12h)", value: "morning" },
    { label: "Tarde (12h-18h)", value: "afternoon" },
    { label: "Noite (18h-24h)", value: "evening" },
  ];

  const handleAirlineToggle = (airline: string) => {
    const updated = selectedAirlines.includes(airline)
      ? selectedAirlines.filter((a) => a !== airline)
      : [...selectedAirlines, airline];
    setSelectedAirlines(updated);
    applyFilters({ selectedAirlines: updated });
  };

  const handleTimeRangeToggle = (range: string) => {
    const updated = departureTimeRange.includes(range)
      ? departureTimeRange.filter((r) => r !== range)
      : [...departureTimeRange, range];
    setDepartureTimeRange(updated);
    applyFilters({ departureTimeRange: updated });
  };

  const handleMinPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || minPrice;
    const newMin = Math.max(minPrice, Math.min(value, priceRange[1]));
    setPriceRange([newMin, priceRange[1]]);
    applyFilters({ priceRange: [newMin, priceRange[1]] });
  };

  const handleMaxPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || maxPrice;
    const newMax = Math.min(maxPrice, Math.max(value, priceRange[0]));
    setPriceRange([priceRange[0], newMax]);
    applyFilters({ priceRange: [priceRange[0], newMax] });
  };

  const handleStopsChange = (stops: number | null) => {
    setMaxStops(stops);
    applyFilters({ maxStops: stops });
  };

  const applyFilters = (partialFilters: Partial<FilterState> = {}) => {
    onFilterChange({
      priceRange,
      selectedAirlines,
      maxStops,
      departureTimeRange,
      ...partialFilters,
    });
  };

  const clearAllFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedAirlines([]);
    setMaxStops(null);
    setDepartureTimeRange([]);
    onFilterChange({
      priceRange: [minPrice, maxPrice],
      selectedAirlines: [],
      maxStops: null,
      departureTimeRange: [],
    });
  };

  const hasActiveFilters = selectedAirlines.length > 0 || maxStops !== null || departureTimeRange.length > 0 || priceRange[0] > minPrice || priceRange[1] < maxPrice;

  return (
    <Card className="p-6 space-y-6 sticky top-24">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filtros</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label>Faixa de Preço</Label>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                Mínimo
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  id="min-price"
                  type="number"
                  min={minPrice}
                  max={priceRange[1]}
                  value={priceRange[0]}
                  onChange={handleMinPriceInput}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                Máximo
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  id="max-price"
                  type="number"
                  min={priceRange[0]}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={handleMaxPriceInput}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Airlines */}
      {airlines.length > 0 && (
        <div className="space-y-3">
          <Label>Companhias Aéreas</Label>
          <div className="space-y-2">
            {airlines.map((airline) => (
              <div key={airline} className="flex items-center space-x-2">
                <Checkbox
                  id={`airline-${airline}`}
                  checked={selectedAirlines.includes(airline)}
                  onCheckedChange={() => handleAirlineToggle(airline)}
                />
                <label
                  htmlFor={`airline-${airline}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {airline}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stops */}
      <div className="space-y-3">
        <Label>Paradas</Label>
        <div className="space-y-2">
          <Button
            variant={maxStops === 0 ? "default" : "outline"}
            size="sm"
            className="w-full justify-start"
            onClick={() => handleStopsChange(0)}
          >
            Direto
          </Button>
          <Button
            variant={maxStops === 1 ? "default" : "outline"}
            size="sm"
            className="w-full justify-start"
            onClick={() => handleStopsChange(1)}
          >
            Até 1 parada
          </Button>
          <Button
            variant={maxStops === null ? "default" : "outline"}
            size="sm"
            className="w-full justify-start"
            onClick={() => handleStopsChange(null)}
          >
            Todas as paradas
          </Button>
        </div>
      </div>

      {/* Departure Time */}
      <div className="space-y-3">
        <Label>Horário de Partida</Label>
        <div className="space-y-2">
          {timeRanges.map((range) => (
            <div key={range.value} className="flex items-center space-x-2">
              <Checkbox
                id={`time-${range.value}`}
                checked={departureTimeRange.includes(range.value)}
                onCheckedChange={() => handleTimeRangeToggle(range.value)}
              />
              <label
                htmlFor={`time-${range.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Filtros ativos:</p>
          <div className="flex flex-wrap gap-2">
            {selectedAirlines.map((airline) => (
              <Badge key={airline} variant="secondary">
                {airline}
              </Badge>
            ))}
            {maxStops !== null && (
              <Badge variant="secondary">
                {maxStops === 0 ? "Direto" : `Até ${maxStops} parada`}
              </Badge>
            )}
            {departureTimeRange.map((range) => (
              <Badge key={range} variant="secondary">
                {timeRanges.find((r) => r.value === range)?.label}
              </Badge>
            ))}
            {(priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
              <Badge variant="secondary">
                R$ {priceRange[0]} - R$ {priceRange[1]}
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default FlightFilters;
