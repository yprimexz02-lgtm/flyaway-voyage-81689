import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
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
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  nome: z.string().trim().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }).max(100),
  telefone: z.string().trim().min(14, { message: "Telefone inválido. Use: (00) 00000-0000" }).max(15),
  origem: z.string().trim().length(3, { message: "Use o código IATA de 3 letras" }),
  destino: z.string().trim().length(3, { message: "Use o código IATA de 3 letras" }),
  data_partida: z.date({ required_error: "Data de partida é obrigatória" }),
  data_retorno: z.date().optional(),
  somente_ida: z.boolean().default(false),
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
      telefone: "",
      origem: "",
      destino: "",
      somente_ida: false,
      quantidade_pessoas: 1,
    },
  });

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const searchData = {
        origin: data.origem.toUpperCase(),
        destination: data.destino.toUpperCase(),
        departureDate: format(data.data_partida, "yyyy-MM-dd"),
        returnDate: data.somente_ida ? undefined : (data.data_retorno ? format(data.data_retorno, "yyyy-MM-dd") : undefined),
        adults: data.quantidade_pessoas,
        travelClass: "ECONOMY",
        max: 5,
      };

      const { data: flightData, error: flightError } = await supabase.functions.invoke("search-flights", { body: searchData });

      if (flightError) throw flightError;

      let cheapestPrice = 0;
      if (flightData?.data && flightData.data.length > 0) {
        const prices = flightData.data.map((f: { price: { total: string } }) => parseFloat(f.price.total));
        const minPriceEur = Math.min(...prices);
        cheapestPrice = minPriceEur * 6.15;
      }

      const { error: dbError } = await supabase.from('bookings').insert({
        destination_id: `${data.origem.toUpperCase()}-${data.destino.toUpperCase()}`,
        destination_name: `Cotação: ${data.origem.toUpperCase()} para ${data.destino.toUpperCase()}`,
        full_name: data.nome,
        cpf: '000.000.000-00', // Placeholder
        email: `${data.telefone.replace(/\D/g, '')}@placeholder.user`, // Placeholder
        phone: data.telefone,
        adults: data.quantidade_pessoas,
        children: 0,
        departure_date: format(data.data_partida, "yyyy-MM-dd"),
        return_date: data.somente_ida || !data.data_retorno ? null : format(data.data_retorno, "yyyy-MM-dd"),
        total_price: cheapestPrice,
      });

      if (dbError) throw dbError;

      toast({
        title: "Solicitação Enviada com Sucesso!",
        description: "Recebemos seu pedido. Entraremos em contato em breve pelo WhatsApp com as melhores cotações.",
      });
      form.reset();

    } catch (error) {
      console.error("Erro ao processar cotação:", error);
      toast({
        title: "Erro ao Enviar",
        description: "Não foi possível processar sua solicitação. Por favor, tente novamente mais tarde.",
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
                Preencha o formulário e entraremos em contato com as melhores opções.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="nome" render={({ field }) => (<FormItem><FormLabel>Nome Completo *</FormLabel><FormControl><Input placeholder="Seu nome" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="telefone" render={({ field }) => (<FormItem><FormLabel>WhatsApp *</FormLabel><FormControl><Input placeholder="(00) 00000-0000" {...field} onChange={e => field.onChange(formatPhone(e.target.value))} maxLength={15} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="origem" render={({ field }) => (<FormItem><FormLabel>Cidade de Origem (IATA) *</FormLabel><FormControl><Input placeholder="Ex: GRU" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} maxLength={3} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="destino" render={({ field }) => (<FormItem><FormLabel>Cidade de Destino (IATA) *</FormLabel><FormControl><Input placeholder="Ex: LIS" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} maxLength={3} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name="somente_ida" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-4"><FormLabel>Apenas Ida</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="data_partida" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Data de Partida *</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}<CalendarIcon className="ml-auto h-4 w-4" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                    {!form.watch("somente_ida") && <FormField control={form.control} name="data_retorno" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Data de Retorno</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}<CalendarIcon className="ml-auto h-4 w-4" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d < (form.getValues("data_partida") || new Date())} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />}
                  </div>
                  <FormField control={form.control} name="quantidade_pessoas" render={({ field }) => (<FormItem><FormLabel>Quantidade de Pessoas *</FormLabel><FormControl><Input type="number" min="1" max="50" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enviando...</> : <><Send className="w-5 h-5 mr-2" /> Enviar Solicitação</>}
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