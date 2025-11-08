import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  nome: z.string().trim().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }).max(100),
  origem: z.string().trim().min(2, { message: "Origem é obrigatória" }).max(100),
  destino: z.string().trim().min(2, { message: "Destino é obrigatório" }).max(100),
  data_partida: z.date({ required_error: "Data de partida é obrigatória" }),
  data_retorno: z.date().optional(),
  somente_ida: z.boolean().default(false),
  telefone: z.string().trim().min(14, { message: "Telefone inválido" }).max(20),
  quantidade_pessoas: z.number().min(1, { message: "Mínimo 1 pessoa" }).max(50),
}).refine((data) => {
  if (!data.somente_ida && data.data_retorno) {
    return data.data_retorno > data.data_partida;
  }
  return true;
}, {
  message: "Data de retorno deve ser após a data de partida",
  path: ["data_retorno"],
});

type FormData = z.infer<typeof formSchema>;

const Cotacao = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      origem: "",
      destino: "",
      telefone: "",
      somente_ida: false,
      quantidade_pessoas: 1,
    },
  });

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    }
    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    console.log("Enviando cotação:", data);

    try {
      const payload = {
        nome: data.nome,
        origem: data.origem,
        destino: data.destino,
        data_partida: format(data.data_partida, "yyyy-MM-dd"),
        data_retorno: data.somente_ida ? null : (data.data_retorno ? format(data.data_retorno, "yyyy-MM-dd") : null),
        somente_ida: data.somente_ida,
        numero_whatsapp: data.telefone,
        quantidade_pessoas: data.quantidade_pessoas,
        mensagem: `Olá! Recebemos seu pedido de cotação de ${data.origem} para ${data.destino}${data.somente_ida ? ' (somente ida)' : ''}. Nossa equipe entrará em contato pelo WhatsApp em breve. 🌎✈️`,
      };

      // URL de teste - trocar para produção depois: https://yprimezx.app.n8n.cloud/webhook/cotacao-viagem
      const response = await fetch("https://yprimezx.app.n8n.cloud/webhook-test/cotacao-viagem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar cotação");
      }

      toast({
        title: "Cotação enviada com sucesso! ✈️",
        description: "Nossa equipe entrará em contato pelo WhatsApp em breve.",
      });

      form.reset();
    } catch (error) {
      console.error("Erro ao enviar cotação:", error);
      toast({
        title: "Erro ao enviar cotação",
        description: "Por favor, tente novamente ou entre em contato pelo WhatsApp (31) 98267-2334.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="backdrop-blur-sm bg-card/95 border-primary/20 shadow-xl">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Solicite sua Cotação
              </CardTitle>
              <CardDescription className="text-lg">
                Preencha o formulário abaixo e entraremos em contato pelo WhatsApp com as melhores opções para sua viagem
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="origem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origem *</FormLabel>
                          <FormControl>
                            <LocationAutocomplete
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="De onde você vai partir?"
                              icon="plane"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="destino"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destino *</FormLabel>
                          <FormControl>
                            <LocationAutocomplete
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Para onde você quer ir?"
                              icon="mappin"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="somente_ida"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Somente Ida</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Deseja apenas passagem de ida?
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="data_partida"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Partida *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: ptBR })
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                locale={ptBR}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!form.watch("somente_ida") && (
                      <FormField
                        control={form.control}
                        name="data_retorno"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data de Retorno *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: ptBR })
                                    ) : (
                                      <span>Selecione a data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  locale={ptBR}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(31) 98267-2334" 
                              {...field}
                              onChange={(e) => {
                                const formatted = formatPhoneNumber(e.target.value);
                                field.onChange(formatted);
                              }}
                              maxLength={15}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantidade_pessoas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade de Pessoas *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1" 
                              min="1"
                              max="50"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:shadow-2xl text-lg py-6 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar Cotação
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cotacao;
