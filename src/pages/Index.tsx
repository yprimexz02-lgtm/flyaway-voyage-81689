import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FlightSearchForm from "@/components/FlightSearchForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Award, Clock, HeadphonesIcon, MapPin, TrendingUp, Sparkles, Globe, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import bgForest from "@/assets/bg-forest.png";
import heroImage from "@/assets/hero-deck.jpg";
import parisImage from "@/assets/dest-paris.jpg";
import maldivesImage from "@/assets/dest-maldives.jpg";
import nycImage from "@/assets/dest-nyc.jpg";
import tokyoImage from "@/assets/dest-tokyo.jpg";
import greeceImage from "@/assets/dest-greece.jpg";
import dubaiImage from "@/assets/dest-dubai.jpg";
import londonImage from "@/assets/dest-london.jpg";
import barcelonaImage from "@/assets/dest-barcelona.jpg";
import sydneyImage from "@/assets/dest-sydney.jpg";

const Index = () => {
  const offersSection = useScrollReveal<HTMLElement>();
  const destinationsSection = useScrollReveal<HTMLElement>();
  const featuresSection = useScrollReveal<HTMLElement>();

  const destinations = [
    { name: "Paris, França", image: parisImage, price: "R$ 3.499", rating: 4.9 },
    { name: "Maldivas", image: maldivesImage, price: "R$ 8.999", rating: 5.0 },
    { name: "Nova York, EUA", image: nycImage, price: "R$ 4.299", rating: 4.8 },
    { name: "Tóquio, Japão", image: tokyoImage, price: "R$ 5.799", rating: 4.9 },
    { name: "Santorini, Grécia", image: greeceImage, price: "R$ 6.499", rating: 5.0 },
    { name: "Dubai, EAU", image: dubaiImage, price: "R$ 4.899", rating: 4.7 },
    { name: "Londres, Inglaterra", image: londonImage, price: "R$ 3.799", rating: 4.6 },
    { name: "Barcelona, Espanha", image: barcelonaImage, price: "R$ 3.299", rating: 4.8 },
    { name: "Sydney, Austrália", image: sydneyImage, price: "R$ 6.999", rating: 4.9 },
  ];

  const features = [
    {
      icon: Shield,
      title: "Segurança Garantida",
      description: "Parceria com as melhores companhias aéreas e hotéis",
      color: "from-primary/20 to-primary/5"
    },
    {
      icon: Award,
      title: "Melhor Preço",
      description: "Encontramos as melhores ofertas para você",
      color: "from-accent/20 to-accent/5"
    },
    {
      icon: Clock,
      title: "Atendimento 24/7",
      description: "Suporte completo antes, durante e depois da viagem",
      color: "from-secondary/20 to-secondary/5"
    },
    {
      icon: HeadphonesIcon,
      title: "Consultoria Especializada",
      description: "Equipe experiente para planejar sua viagem dos sonhos",
      color: "from-primary/20 to-accent/5"
    },
  ];

  return (
    <div className="min-h-screen bg-background mesh-gradient">
      <Navigation />

      {/* Hero Section - Dark & Modern */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 relative z-10 py-32">
          <div className="max-w-5xl mx-auto text-center animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Experiências de Viagem Premium</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              Descubra o <span className="text-gradient">mundo</span>,<br />
              uma viagem de cada vez.
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Viajar é mais do que conhecer lugares — é viver experiências únicas.
              Com a GFChaves Travel Experience, cada viagem é memorável do início ao fim.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Button size="lg" className="neon-border bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-7 rounded-full glow group">
                <span>Reserve Sua Aventura</span>
                <Globe className="w-5 h-5 ml-2 group-hover:rotate-180 transition-transform duration-700" />
              </Button>
              <Button size="lg" variant="outline" className="glass text-lg px-10 py-7 rounded-full border-2 hover:border-primary/50">
                Explore Destinos
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { label: "Destinos", value: "150+" },
                { label: "Clientes Satisfeitos", value: "50k+" },
                { label: "Avaliação", value: "4.9★" }
              ].map((stat, i) => (
                <div key={i} className="dark-card p-6">
                  <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Explore Section - With Forest Background */}
      <section 
        ref={offersSection.elementRef}
        className="py-32 relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${bgForest})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-20 transition-all duration-1000 ${
            offersSection.isVisible 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-10"
          }`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Experiências Exclusivas</span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Descubra o <span className="text-gradient">mundo conosco</span>
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              De paisagens deslumbrantes a maravilhas culturais, criamos viagens que transformam destinos em realidade.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Star, title: "Estadias Premium", desc: "Ofertas exclusivas em hotéis 5 estrelas" },
              { icon: Globe, title: "Pacotes Personalizados", desc: "Roteiros sob medida para cada viajante" },
              { icon: Shield, title: "Suporte Total", desc: "Assistência antes, durante e após a viagem" }
            ].map((item, index) => (
              <div key={index} className={`dark-card p-8 hover-lift group transition-all duration-700 ${
                offersSection.isVisible 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-10"
              }`}
              style={{ 
                transitionDelay: offersSection.isVisible ? `${index * 150}ms` : "0ms" 
              }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinos Populares - Dark Cards */}
      <section 
        ref={destinationsSection.elementRef}
        className="py-32 relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div 
            className={`text-center mb-20 transition-all duration-1000 ${
              destinationsSection.isVisible 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Destinos Exclusivos</span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              Destinos <span className="text-gradient">Populares</span>
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Os lugares mais desejados do planeta estão esperando por você
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest, index) => (
              <div 
                key={index} 
                className={`group relative h-[500px] rounded-3xl overflow-hidden cursor-pointer hover-lift transition-all duration-700 neon-border border-primary/0 hover:border-primary/50 ${
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
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="text-2xl font-bold">{dest.name}</h3>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(dest.rating) ? 'text-secondary fill-secondary' : 'text-muted-foreground'}`} />
                      ))}
                      <span className="text-sm ml-2">{dest.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">A partir de</p>
                      <p className="text-3xl font-bold text-gradient">{dest.price}</p>
                    </div>
                    <Button className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity neon-border bg-primary hover:bg-primary/90">
                      Ver Mais
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por que viajar conosco - Dark Cards */}
      <section 
        ref={featuresSection.elementRef}
        className="py-32 relative overflow-hidden"
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div 
            className={`text-center mb-20 transition-all duration-1000 ${
              featuresSection.isVisible 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Nossos Diferenciais</span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              Por Que <span className="text-gradient">Viajar Conosco</span>?
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Experiência, confiança e dedicação em cada detalhe da sua jornada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`dark-card hover-lift group relative overflow-hidden transition-all duration-700 ${
                  featuresSection.isVisible 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-10"
                }`}
                style={{ 
                  transitionDelay: featuresSection.isVisible ? `${index * 150}ms` : "0ms" 
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <CardContent className="p-8 relative z-10 text-center">
                  <div className="inline-flex p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <feature.icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center dark-card p-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Pronto para sua <span className="text-gradient">próxima aventura</span>?
            </h2>
            <p className="text-muted-foreground text-xl mb-10">
              Entre em contato conosco e comece a planejar a viagem dos seus sonhos hoje mesmo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
              <Button size="lg" className="neon-border bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-7 rounded-full glow">
                Falar com Consultor
              </Button>
              <Button size="lg" variant="outline" className="glass text-lg px-10 py-7 rounded-full border-2">
                Ver Pacotes
              </Button>
            </div>
            
            <div className="text-center pt-8 border-t border-primary/20">
              <p className="text-lg mb-2 text-muted-foreground">Atendimento 24/7</p>
              <a href="tel:3036667575" className="text-3xl font-bold text-gradient hover:underline">
                (303) 666-7575
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
