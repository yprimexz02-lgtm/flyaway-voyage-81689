import { Plane, Loader2 } from "lucide-react";

interface FlightSearchLoadingProps {
  origin: string;
  destination: string;
}

const FlightSearchLoading = ({ origin, destination }: FlightSearchLoadingProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md animate-fade-in">
      <div className="text-center space-y-8 animate-scale-in">
        {/* Animated Plane */}
        <div className="relative w-full h-32 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-0.5 w-64 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
          </div>
          <Plane className="w-16 h-16 text-primary animate-[slide-in-right_2s_ease-in-out_infinite] relative z-10" />
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground animate-fade-in">
            Procurando os melhores voos
          </h2>
          <div className="flex items-center justify-center gap-3 text-lg text-muted-foreground animate-fade-in delay-100">
            <span className="font-semibold">{origin}</span>
            <Plane className="w-5 h-5 rotate-90 text-primary" />
            <span className="font-semibold">{destination}</span>
          </div>
        </div>

        {/* Animated Dots */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Aguarde alguns instantes...</span>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-3 max-w-md mx-auto animate-fade-in delay-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Verificando disponibilidade</span>
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary animate-[slide-in-right_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSearchLoading;
