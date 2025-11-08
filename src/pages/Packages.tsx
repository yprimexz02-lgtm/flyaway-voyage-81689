import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, Users, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import parisImage from "@/assets/dest-paris.jpg";
import maldivesImage from "@/assets/dest-maldives.jpg";
import nycImage from "@/assets/dest-nyc.jpg";
import tokyoImage from "@/assets/dest-tokyo.jpg";
import greeceImage from "@/assets/dest-greece.jpg";
import dubaiImage from "@/assets/dest-dubai.jpg";
import londonImage from "@/assets/dest-london.jpg";
import barcelonaImage from "@/assets/dest-barcelona.jpg";
import sydneyImage from "@/assets/dest-sydney.jpg";

const Packages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const packagesSection = useScrollReveal<HTMLDivElement>();
  const navigate = useNavigate();

  const packages = [
    {
      id: 1,
      name: "Pacote Paris Romântico",
      image: parisImage,
      duration: "7 dias / 6 noites",
      price: 6999,
      destination: "Paris, França",
      includes: "Passagem aérea + Hotel 4★ + City Tour",
      category: "romance",
    },
    {
      id: 2,
      name: "Maldivas All Inclusive",
      image: maldivesImage,
      duration: "5 dias / 4 noites",
      price: 12999,
      destination: "Maldivas",
      includes: "Passagem + Resort 5★ All Inclusive + Transfer",
      category: "praia",
    },
    {
      id: 3,
      name: "Nova York Clássica",
      image: nycImage,
      duration: "6 dias / 5 noites",
      price: 5499,
      destination: "Nova York, EUA",
      includes: "Passagem + Hotel em Manhattan + Tour",
      category: "cidade",
    },
    {
      id: 4,
      name: "Tóquio Cultural",
      image: tokyoImage,
      duration: "8 dias / 7 noites",
      price: 8999,
      destination: "Tóquio, Japão",
      includes: "Passagem + Hotel + JR Pass + Guia",
      category: "cultura",
    },
    {
      id: 5,
      name: "Grécia Inesquecível",
      image: greeceImage,
      duration: "10 dias / 9 noites",
      price: 9499,
      destination: "Santorini, Grécia",
      includes: "Passagem + Hotéis + Ferry + Passeios",
      category: "romance",
    },
    {
      id: 6,
      name: "Dubai Luxo",
      image: dubaiImage,
      duration: "5 dias / 4 noites",
      price: 7999,
      destination: "Dubai, EAU",
      includes: "Passagem + Hotel 5★ + Deserto Safari",
      category: "luxo",
    },
    {
      id: 7,
      name: "Londres Histórica",
      image: londonImage,
      duration: "6 dias / 5 noites",
      price: 6499,
      destination: "Londres, Inglaterra",
      includes: "Passagem + Hotel + City Tour + Musical",
      category: "cidade",
    },
    {
      id: 8,
      name: "Barcelona Modernista",
      image: barcelonaImage,
      duration: "5 dias / 4 noites",
      price: 5999,
      destination: "Barcelona, Espanha",
      includes: "Passagem + Hotel + Gaudi Tour",
      category: "cultura",
    },
    {
      id: 9,
      name: "Sydney Encantadora",
      image: sydneyImage,
      duration: "9 dias / 8 noites",
      price: 10999,
      destination: "Sydney, Austrália",
      includes: "Passagem + Hotel + Grande Barreira + Opera",
      category: "aventura",
    },
  ];

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = priceFilter === "all" ||
                        (priceFilter === "low" && pkg.price < 7000) ||
                        (priceFilter === "medium" && pkg.price >= 7000 && pkg.price <= 10000) ||
                        (priceFilter === "high" && pkg.price > 10000);

    return matchesSearch && matchesPrice;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
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
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Pacotes de Viagem</h1>
            <p className="text-lg text-muted-foreground">
              Encontre o pacote perfeito para sua próxima aventura
            </p>
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar destino ou pacote..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por preço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os preços</SelectItem>
                    <SelectItem value="low">Até R$ 7.000</SelectItem>
                    <SelectItem value="medium">R$ 7.000 - R$ 10.000</SelectItem>
                    <SelectItem value="high">Acima de R$ 10.000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Pacotes */}
          <div ref={packagesSection.elementRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg, index) => (
              <Card 
                key={pkg.id} 
                className={`overflow-hidden hover:shadow-hover group transition-all duration-700 ${
                  packagesSection.isVisible 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-10"
                }`}
                style={{ 
                  transitionDelay: packagesSection.isVisible ? `${index * 100}ms` : "0ms" 
                }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-primary-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">{pkg.destination}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-primary-foreground">{pkg.name}</h3>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{pkg.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{pkg.includes}</p>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">A partir de</p>
                      <p className="text-2xl font-bold text-primary">{formatPrice(pkg.price)}</p>
                    </div>
                    <Button className="bg-gradient-to-r from-primary to-secondary">
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPackages.length === 0 && (
            <div className="text-center py-20">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum pacote encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar seus filtros de busca</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Packages;