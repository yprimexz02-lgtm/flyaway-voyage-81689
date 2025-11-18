import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, FileText, Calendar as CalendarIcon, CreditCard, Shield, CheckCircle } from "lucide-react";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import parisImage from "@/assets/discover-landmark.jpg";
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

const destinations = [
  { id: "rio", name: "Rio de Janeiro, Brasil", image: rioImage, price: "R$ 1.299", description: "Cidade Maravilhosa com praias paradisíacas" },
  { id: "paris", name: "Paris, França", image: parisImage, price: "R$ 3.499", description: "A cidade luz e do romance" },
  { id: "maldives", name: "Maldivas", image: maldivesImage, price: "R$ 8.999", description: "Paraíso tropical" },
  { id: "nyc", name: "Nova York, EUA", image: nycImage, price: "R$ 4.299", description: "A cidade que nunca dorme" },
  { id: "tokyo", name: "Tóquio, Japão", image: tokyoImage, price: "R$ 5.799", description: "Modernidade e tradição" },
  { id: "greece", name: "Santorini, Grécia", image: greeceImage, price: "R$ 6.499", description: "Ilhas gregas de tirar o fôlego" },
];

const bookingSchema = z.object({
  fullName: z.string().trim().min(3, "Nome completo deve ter no mínimo 3 caracteres").max(100, "Nome muito longo"),
  cpf: z.string().trim().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido. Use o formato: 000.000.000-00"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  phone: z.string().trim().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone inválido. Use o formato: (00) 00000-0000"),
  adults: z.number().min(1, "Mínimo 1 adulto").max(10, "Máximo 10 adultos"),
  children: z.number().min(0, "Mínimo 0 crianças").max(10, "Máximo 10 crianças"),
  departureDate: z.string().trim().min(1, "Data de ida é obrigatória"),
  returnDate: z.string().trim().optional(),
});

const Reserva = () => {
  const { destinationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const destination = destinations.find(d => d.id === destinationId);
  
  const [formData, setFormData] = useState({
    fullName: "",
    cpf: "",
    email: "",
    phone: "",
    adults: 1,
    children: 0,
  });

  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!destination) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Destino não encontrado</h1>
          <Button onClick={() => navigate("/")}>Voltar para Home</Button>
        </div>
      </div>
    );
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleInputChange = (field: string, value: string | number) => {
    let formattedValue = value;
    
    if (field === "cpf" && typeof value === "string") {
      formattedValue = formatCPF(value);
    } else if (field === "phone" && typeof value === "string") {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submissionData = {
        ...formData,
        departureDate: departureDate ? format(departureDate, "yyyy-MM-dd") : "",
        returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : "",
      };
      
      const validatedData = bookingSchema.parse(submissionData);
      
      // Save to database
      const { error: dbError } = await supabase
        .from('bookings')
        .insert({
          destination_id: destination.id,
          destination_name: destination.name,
          full_name: validatedData.fullName,
          cpf: validatedData.cpf,
          email: validatedData.email,
          phone: validatedData.phone,
          adults: validatedData.adults,
          children: validatedData.children,
          departure_date: validatedData.departureDate,
          return_date: validatedData.returnDate || null,
          total_price: totalPrice,
        });

      if (dbError) {
        console.error("Database error:", dbError);
        toast({
          title: "Erro ao salvar reserva",
          description: "Ocorreu um erro ao processar sua reserva. Tente novamente.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Reserva enviada com sucesso!",
        description: "Entraremos em contato em breve para confirmar sua viagem.",
      });
      
      // Redirecionar após alguns segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        
        toast({
          title: "Erro no formulário",
          description: "Por favor, corrija os campos destacados.",
          variant: "destructive",
        });
      }
    }
  };

  const totalPassengers = formData.adults + formData.children;
  const basePrice = parseFloat(destination.price.replace("R$ ", "").replace(".", "").replace(",", "."));
  const totalPrice = basePrice * totalPassengers;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero com imagem do destino */}
      <section className="relative h-[30vh] md:h-[40vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${destination.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-primary-dark/60 to-background" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">{destination.name}</h1>
          <p className="text-xl text-white/90">{destination.description}</p>
        </div>
      </section>

      {/* Formulário de reserva */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-primary/20 shadow-premium bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    Complete sua Reserva
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Preencha os dados abaixo para garantir sua viagem
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Dados Pessoais */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-accent" />
                        Dados Pessoais
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Nome Completo *</Label>
                          <Input
                            id="fullName"
                            placeholder="João da Silva"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                            className={errors.fullName ? "border-destructive" : ""}
                          />
                          {errors.fullName && (
                            <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="cpf">CPF *</Label>
                          <Input
                            id="cpf"
                            placeholder="000.000.000-00"
                            value={formData.cpf}
                            onChange={(e) => handleInputChange("cpf", e.target.value)}
                            maxLength={14}
                            className={errors.cpf ? "border-destructive" : ""}
                          />
                          {errors.cpf && (
                            <p className="text-sm text-destructive mt-1">{errors.cpf}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="joao@email.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={errors.email ? "border-destructive" : ""}
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive mt-1">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="phone">Telefone *</Label>
                          <Input
                            id="phone"
                            placeholder="(00) 00000-0000"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            maxLength={15}
                            className={errors.phone ? "border-destructive" : ""}
                          />
                          {errors.phone && (
                            <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Passageiros */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-accent" />
                        Passageiros
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="adults">Adultos (12+ anos) *</Label>
                          <Input
                            id="adults"
                            type="number"
                            min="1"
                            max="10"
                            value={formData.adults}
                            onChange={(e) => handleInputChange("adults", parseInt(e.target.value) || 1)}
                            className={errors.adults ? "border-destructive" : ""}
                          />
                          {errors.adults && (
                            <p className="text-sm text-destructive mt-1">{errors.adults}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="children">Crianças (0-11 anos)</Label>
                          <Input
                            id="children"
                            type="number"
                            min="0"
                            max="10"
                            value={formData.children}
                            onChange={(e) => handleInputChange("children", parseInt(e.target.value) || 0)}
                            className={errors.children ? "border-destructive" : ""}
                          />
                          {errors.children && (
                            <p className="text-sm text-destructive mt-1">{errors.children}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Datas */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-accent" />
                        Datas da Viagem
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Data de Ida *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !departureDate && "text-muted-foreground",
                                  errors.departureDate && "border-destructive"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {departureDate ? format(departureDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={departureDate}
                                onSelect={(date) => {
                                  setDepartureDate(date);
                                  if (errors.departureDate) {
                                    setErrors(prev => {
                                      const newErrors = { ...prev };
                                      delete newErrors.departureDate;
                                      return newErrors;
                                    });
                                  }
                                }}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          {errors.departureDate && (
                            <p className="text-sm text-destructive mt-1">{errors.departureDate}</p>
                          )}
                        </div>

                        <div>
                          <Label>Data de Volta</Label>
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
                                {returnDate ? format(returnDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={returnDate}
                                onSelect={setReturnDate}
                                disabled={(date) => date < (departureDate || new Date())}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full text-lg bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirmar Reserva
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Resumo da Reserva */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-2 border-primary/30 shadow-premium bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Resumo da Reserva</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Destino:</span>
                      <span className="font-semibold">{destination.name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adultos:</span>
                      <span className="font-semibold">{formData.adults}</span>
                    </div>
                    
                    {formData.children > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Crianças:</span>
                        <span className="font-semibold">{formData.children}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total de passageiros:</span>
                      <span className="font-semibold">{totalPassengers}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Preço por pessoa:</span>
                      <span className="font-semibold">{destination.price}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Valor Total:</span>
                      <span className="text-3xl font-bold text-gradient">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Selos de Confiança */}
                  <div className="border-t border-border pt-6 space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5 text-accent" />
                      Garantias
                    </h4>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span>Pagamento 100% seguro</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span>Atendimento 24h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span>Cancelamento flexível</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-accent" />
                        <span>Parcelamento em até 12x</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Reserva;