import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Users, Globe, Heart } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const About = () => {
  const statsSection = useScrollReveal<HTMLDivElement>();
  const historySection = useScrollReveal<HTMLDivElement>();
  const valuesSection = useScrollReveal<HTMLDivElement>();

  const stats = [
    { icon: Users, value: "50K+", label: "Clientes Satisfeitos" },
    { icon: Globe, value: "150+", label: "Destinos" },
    { icon: Award, value: "25+", label: "Anos de Experiência" },
    { icon: Heart, value: "98%", label: "Satisfação" },
  ];

  const values = [
    {
      title: "Missão",
      description: "Proporcionar experiências de viagem inesquecíveis, conectando pessoas aos destinos dos seus sonhos com excelência e dedicação.",
    },
    {
      title: "Visão",
      description: "Ser a agência de viagens mais confiável e inovadora do Brasil, reconhecida pela qualidade do atendimento e serviços.",
    },
    {
      title: "Valores",
      description: "Integridade, Compromisso com o cliente, Inovação, Sustentabilidade, Excelência em tudo que fazemos.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Sobre a TravelExpert</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Há mais de 25 anos, transformamos sonhos de viagem em realidade. Nossa paixão é 
              conectar pessoas aos lugares mais incríveis do mundo, criando memórias que duram para sempre.
            </p>
          </div>

          {/* Stats */}
          <div ref={statsSection.elementRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className={`text-center hover:shadow-hover transition-all duration-700 ${
                  statsSection.isVisible 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-10"
                }`}
                style={{ 
                  transitionDelay: statsSection.isVisible ? `${index * 100}ms` : "0ms" 
                }}
              >
                <CardContent className="p-8">
                  <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-4">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-4xl font-bold mb-2">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Nossa História */}
          <div ref={historySection.elementRef} className="mb-20">
            <h2 
              className={`text-3xl font-bold mb-8 text-center transition-all duration-1000 ${
                historySection.isVisible 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-10"
              }`}
            >
              Nossa História
            </h2>
            <Card
              className={`transition-all duration-1000 ${
                historySection.isVisible 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: historySection.isVisible ? "200ms" : "0ms" }}
            >
              <CardContent className="p-8 md:p-12">
                <div className="prose prose-lg max-w-none">
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Fundada em 1999, a TravelExpert nasceu do sonho de tornar viagens internacionais 
                    acessíveis e memoráveis para todos os brasileiros. O que começou como uma pequena 
                    agência em São Paulo, hoje é uma das maiores redes de agências de viagem do país.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Nossa equipe é composta por apaixonados por viagens, com expertise em destinos ao 
                    redor do mundo. Oferecemos consultoria personalizada, sempre buscando entender os 
                    desejos e necessidades de cada cliente para criar experiências únicas.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Com parcerias estabelecidas com as principais companhias aéreas, hotéis e operadores 
                    turísticos globais, garantimos os melhores preços e condições para nossos clientes. 
                    Nosso compromisso é com a sua satisfação, do planejamento ao retorno da viagem.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Missão, Visão, Valores */}
          <div ref={valuesSection.elementRef}>
            <h2 
              className={`text-3xl font-bold mb-8 text-center transition-all duration-1000 ${
                valuesSection.isVisible 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-10"
              }`}
            >
              Missão, Visão e Valores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <Card 
                  key={index} 
                  className={`hover:shadow-hover transition-all duration-700 ${
                    valuesSection.isVisible 
                      ? "opacity-100 translate-y-0" 
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ 
                    transitionDelay: valuesSection.isVisible ? `${index * 150}ms` : "0ms" 
                  }}
                >
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-primary">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
