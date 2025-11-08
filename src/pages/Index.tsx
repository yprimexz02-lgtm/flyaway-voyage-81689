import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FlightSearchForm from "@/components/FlightSearchForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Award, Clock, HeadphonesIcon, MapPin, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import bgForest from "@/assets/bg-forest.png";
import heroImage from "@/assets/hero-deck.jpg";
import discoverBeach from "@/assets/discover-beach.jpg";
import parisImage from "@/assets/dest-paris.jpg";
import maldivesImage from "@/assets/dest-maldives.jpg";
import nycImage from "@/assets/dest-nyc.jpg";
import tokyoImage from "@/assets/dest-tokyo.jpg";
import greeceImage from "@/assets/dest-greece.jpg";
import dubaiImage from "@/assets/dest-dubai.jpg";
import londonImage from "@/assets/dest-london.jpg";
import barcelonaImage from "@/assets/dest-barcelona.jpg";
import sydneyImage from "@/assets/dest-sydney.jpg";
import rioImage from "@/assets/dest-rio.jpg";
import noronhaImage from "@/assets/dest-noronha.jpg";
import iguazuImage from "@/assets/dest-iguazu.jpg";
import amazoniaImage from "@/assets/dest-amazonia.jpg";

const Index = () => {
  const offersSection = useScrollReveal<HTMLElement>();
  const destinationsSection = useScrollReveal<HTMLElement>();
  const featuresSection = useScrollReveal<HTMLElement>();

  const destinations = [
    { id: "rio", name: "Rio de Janeiro, Brasil", image: rioImage, price: "R$ 1.299" },
    { id: "paris", name: "Paris, França", image: parisImage, price: "R$ 3.499" },
    { id: "maldives", name: "Maldivas", image: maldivesImage, price: "R$ 8.999" },
    { id: "nyc", name: "Nova York, EUA", image: nycImage, price: "R$ 4.299" },
    { id: "tokyo", name: "Tóquio, Japão", image: tokyoImage, price: "R$ 5.799" },
    { id: "greece", name: "Santorini, Grécia", image: greeceImage, price: "R$ 6.499" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Segurança Garantida",
      description: "Parceria com as melhores companhias aéreas e hotéis",
    },
    {
      icon: Award,
      title: "Melhor Preço",
      description: "Encontramos as melhores ofertas para você",
    },
    {
      icon: Clock,
      title: "Atendimento 24/7",
      description: "Suporte completo antes, durante e depois da viagem",
    },
    {
      icon: HeadphonesIcon,
      title: "Consultoria Especializada",
      description: "Equipe experiente para planejar sua viagem dos sonhos",
    },
  ];

  const offers = [
    {
      destination: "Pacote Paris Romântico",
      duration: "7 dias / 6 noites",
      price: "R$ 6.999",
      description: "Inclui passagem, hotel 4★ e city tour",
    },
    {
      destination: "Caribe All Inclusive",
      duration: "5 dias / 4 noites",
      price: "R$ 5.499",
      description: "Resort all inclusive + transfer",
    },
    {
      destination: "Europa Clássica",
      duration: "12 dias / 11 noites",
      price: "R$ 12.999",
      description: "Paris, Londres e Roma com guia",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Hero image background */}
        <div 
          className="absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        {/* Dark overlay with blue tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-primary-dark/50 to-background/90" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Viagens exclusivas,<br />
              experiências autênticas.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto">
              GFChaves Travel Experience — o mundo sob medida para você.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <Button size="lg" className="bg-primary hover:bg-primary-light hover:scale-105 hover:shadow-2xl text-lg px-8 py-6 rounded-full glow transition-all duration-300" asChild>
                <Link to="/buscar-voos">Fazer Cotação</Link>
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-lg mb-2">Entre em contato a qualquer momento.</p>
              <a href="tel:31982672334" className="text-2xl font-bold hover:underline">
                (31) 98267-2334
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Descubra o Mundo Conosco */}
      <section 
        ref={offersSection.elementRef}
        className="py-24 relative overflow-hidden"
      >
        {/* Background com blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgForest})` }}
        />
        <div className="absolute inset-0 backdrop-blur-3xl bg-background/90" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className={`transition-all duration-1000 ${
            offersSection.isVisible 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-10"
          }`}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Imagem */}
              <div className="order-2 lg:order-1">
                <img 
                  src={discoverBeach} 
                  alt="Praia paradisíaca" 
                  className="w-full h-[400px] object-cover rounded-3xl shadow-premium border border-primary/30"
                />
              </div>

              {/* Texto */}
              <div className="order-1 lg:order-2 space-y-6">
                <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Descubra o <span className="text-gradient">mundo conosco.</span>
                </h2>
                <p className="text-foreground/80 text-lg leading-relaxed">
                  De paisagens deslumbrantes a maravilhas culturais, como agente de viagens crio experiências que transformam destinos em realidade. Garanto que cada detalhe seja planejado com excelência.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-accent flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-foreground text-lg">Estadias Premium e Ofertas Exclusivas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-accent flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-foreground text-lg">Pacotes personalizados para cada viajante</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-accent flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-foreground text-lg">Suporte incomparável antes e durante as viagens</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinos Populares */}
      <section 
        ref={destinationsSection.elementRef}
        className="py-24 relative overflow-hidden"
      >
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div 
            className={`text-center mb-16 transition-all duration-1000 ${
              destinationsSection.isVisible 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-10"
            }`}
          >
            <span className="text-accent font-semibold text-sm uppercase tracking-wider mb-2 block">Explore o Mundo</span>
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Destinos</span> Populares
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Os lugares mais desejados do planeta estão esperando por você
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest, index) => (
              <Link 
                key={index}
                to={`/reserva/${dest.id}`}
                className={`group relative h-96 rounded-3xl overflow-hidden cursor-pointer hover-lift transition-all duration-700 block ${
                  destinationsSection.isVisible 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-10"
                }`}
                style={{ 
                  transitionDelay: destinationsSection.isVisible ? `${index * 100}ms` : "0ms" 
                }}
              >
                <img 
                  src={dest.image} 
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-primary-dark/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
                
                {/* Glass card effect on hover */}
                <div className="absolute inset-x-4 bottom-4 p-6 rounded-2xl glass-card opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 border border-primary/40 glow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" />
                      <h3 className="text-2xl font-bold text-foreground">{dest.name}</h3>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground mb-2">A partir de</p>
                  <p className="text-3xl font-bold text-gradient">{dest.price}</p>
                </div>
                
                {/* Default state */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white group-hover:opacity-0 transition-opacity">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5" />
                  <h3 className="text-2xl font-bold">{dest.name}</h3>
                </div>
                <p className="text-lg">A partir de <span className="font-bold">{dest.price}</span></p>
              </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Por que viajar conosco */}
      <section 
        ref={featuresSection.elementRef}
        className="py-24 relative overflow-hidden bg-muted/20"
      >
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div 
            className={`text-center mb-16 transition-all duration-1000 ${
              featuresSection.isVisible 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-10"
            }`}
          >
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider mb-2 block">Nossos Diferenciais</span>
            <h2 className="text-5xl font-bold mb-4">
              Por Que <span className="text-gradient">Viajar Conosco</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experiência, confiança e dedicação em cada detalhe da sua jornada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`group text-center border-2 border-primary/20 hover:border-primary/60 hover-lift bg-card/50 backdrop-blur-sm relative overflow-hidden transition-all duration-700 ${
                  featuresSection.isVisible 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-10"
                }`}
                style={{ 
                  transitionDelay: featuresSection.isVisible ? `${index * 150}ms` : "0ms" 
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-8 relative z-10">
                  <div className="inline-flex p-5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 border border-primary/30">
                    <feature.icon className="w-10 h-10 text-primary group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-gradient transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
