import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plane, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FlightData {
  outbound: any;
  return: any;
  totalPrice: string;
  currency: string;
}

const BookingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const flightData = location.state?.flightData as FlightData;

  const [formData, setFormData] = useState({
    // Dados do passageiro
    firstName: "",
    lastName: "",
    cpf: "",
    birthDate: "",
    gender: "",
    
    // Dados de contato
    email: "",
    phone: "",
    
    // Endereço
    zipCode: "",
    address: "",
    city: "",
    state: "",
    
    // Documento de viagem
    passportNumber: "",
    passportExpiry: "",
  });

  const validateCPF = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Valida primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(9))) return false;
    
    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  };

  const formatCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
    if (match) {
      return [match[1], match[2], match[3], match[4]]
        .filter(group => group)
        .join('.')
        .replace(/\.(\d{2})$/, '-$1');
    }
    return value;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Aplica máscara de CPF
    if (name === 'cpf') {
      const formatted = formatCPF(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.cpf) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validação de CPF
    if (!validateCPF(formData.cpf)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, digite um CPF válido.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Reserva enviada!",
      description: "Entraremos em contato em breve para confirmar sua reserva.",
    });

    // Aqui você pode enviar os dados para o backend
    console.log("Form data:", formData);
    console.log("Flight data:", flightData);
  };

  if (!flightData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-20 container mx-auto px-4">
          <p className="text-center">Nenhum voo selecionado. Por favor, volte e selecione um voo.</p>
          <Button onClick={() => navigate("/")} className="mx-auto mt-4 block">
            Voltar para o início
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Calcula o preço final correto com desconto GFC Travel
  const calculateTotalPrice = () => {
    // API retorna preços base, adicionamos taxa de serviço de 3% para igualar ao Google Flights
    const outboundBasePrice = parseFloat(flightData.outbound.price.total);
    const returnBasePrice = flightData.return ? parseFloat(flightData.return.price.total) : 0;
    
    // Adiciona taxa de serviço de 3%
    const outboundPrice = outboundBasePrice * 1.03;
    const returnPrice = returnBasePrice * 1.03;
    
    // Soma dos preços sem desconto
    const totalBeforeDiscount = outboundPrice + returnPrice;
    
    // Aplica desconto de 12% da GFC Travel
    const discount = totalBeforeDiscount * 0.12;
    const finalPrice = totalBeforeDiscount - discount;
    
    console.log('📊 Conferência de Preços:', {
      'Voo de Ida (base API)': `R$ ${outboundBasePrice.toFixed(2)}`,
      'Voo de Ida (+ taxa 3%)': `R$ ${outboundPrice.toFixed(2)}`,
      'Voo de Volta (base API)': flightData.return ? `R$ ${returnBasePrice.toFixed(2)}` : 'N/A',
      'Voo de Volta (+ taxa 3%)': flightData.return ? `R$ ${returnPrice.toFixed(2)}` : 'N/A',
      'Total CIA (sem desconto)': `R$ ${totalBeforeDiscount.toFixed(2)}`,
      'Desconto GFC (12%)': `R$ ${discount.toFixed(2)}`,
      'Preço Final GFC': `R$ ${finalPrice.toFixed(2)}`
    });
    
    return { totalBeforeDiscount, discount, finalPrice, outboundPrice, returnPrice };
  };

  const { finalPrice } = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-20 md:pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">Finalizar Reserva</h1>
          <p className="text-muted-foreground mb-8">Preencha os dados para confirmar sua reserva</p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados do Passageiro */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dados do Passageiro</CardTitle>
                    <CardDescription>Informações conforme documento de identidade</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nome *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Seu primeiro nome"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Sobrenome *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Seu sobrenome"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF *</Label>
                        <Input
                          id="cpf"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Data de Nascimento *</Label>
                        <Input
                          id="birthDate"
                          name="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gênero *</Label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="O">Outro</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Dados de Contato */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dados de Contato</CardTitle>
                    <CardDescription>Como podemos entrar em contato</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Endereço */}
                <Card>
                  <CardHeader>
                    <CardTitle>Endereço</CardTitle>
                    <CardDescription>Endereço residencial</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Rua, número, complemento"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Sua cidade"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="UF"
                          maxLength={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documento de Viagem */}
                <Card>
                  <CardHeader>
                    <CardTitle>Documento de Viagem</CardTitle>
                    <CardDescription>Para viagens internacionais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="passportNumber">Número do Passaporte</Label>
                        <Input
                          id="passportNumber"
                          name="passportNumber"
                          value={formData.passportNumber}
                          onChange={handleInputChange}
                          placeholder="BR000000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passportExpiry">Validade do Passaporte</Label>
                        <Input
                          id="passportExpiry"
                          name="passportExpiry"
                          type="date"
                          value={formData.passportExpiry}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full">
                  Confirmar Reserva
                </Button>
              </form>
            </div>

            {/* Resumo do Voo */}
            <div className="lg:col-span-1">
              <Card className="sticky top-32">
                <CardHeader>
                  <CardTitle>Resumo da Viagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Voo de Ida */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Plane className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">Voo de Ida</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatDateTime(flightData.outbound.itineraries[0].segments[0].departure.at)}
                        </span>
                      </div>
                      <p>
                        <span className="font-medium">{flightData.outbound.itineraries[0].segments[0].departure.iataCode}</span>
                        {" → "}
                        <span className="font-medium">
                          {flightData.outbound.itineraries[0].segments[flightData.outbound.itineraries[0].segments.length - 1].arrival.iataCode}
                        </span>
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Voo de Volta */}
                  {flightData.return && (
                    <>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Plane className="w-4 h-4 text-primary rotate-180" />
                          <h3 className="font-semibold">Voo de Volta</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {formatDateTime(flightData.return.itineraries[0].segments[0].departure.at)}
                            </span>
                          </div>
                          <p>
                            <span className="font-medium">{flightData.return.itineraries[0].segments[0].departure.iataCode}</span>
                            {" → "}
                            <span className="font-medium">
                              {flightData.return.itineraries[0].segments[flightData.return.itineraries[0].segments.length - 1].arrival.iataCode}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Preço Total */}
                  <div className="pt-2 space-y-3">
                    {/* Preço Original da CIA */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs font-semibold mb-2 uppercase text-center text-muted-foreground">
                        Valor Companhia Aérea (Google Flights)
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Voo de Ida:</span>
                          <span className="font-medium">
                            R$ {calculateTotalPrice().outboundPrice.toFixed(2)}
                          </span>
                        </div>
                        {flightData.return && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Voo de Volta:</span>
                            <span className="font-medium">
                              R$ {calculateTotalPrice().returnPrice.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span>Total CIA:</span>
                          <span>R$ {calculateTotalPrice().totalBeforeDiscount.toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center italic">
                        * Preços ajustados para corresponder ao Google Flights
                      </p>
                    </div>

                    {/* Preço GFC Travel com Desconto */}
                    <div className="bg-primary/10 rounded-lg p-4">
                      <p className="text-xs text-primary font-semibold mb-2 uppercase text-center">
                        IDA E VOLTA PELA GFC
                      </p>
                      <div className="space-y-1 mb-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Desconto GFC Travel (12%):</span>
                          <span className="text-green-600 font-medium">
                            -R$ {calculateTotalPrice().discount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-primary text-center">
                        R$ {finalPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        ou até 12x de R$ {(finalPrice / 12).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium mb-1">Importante:</p>
                        <p>Após o envio, nossa equipe entrará em contato para confirmar sua reserva e fornecer instruções de pagamento.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingForm;
