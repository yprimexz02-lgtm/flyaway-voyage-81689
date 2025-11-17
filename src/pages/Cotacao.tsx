import { useState, useRef, useEffect } from "react";
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
import { CalendarIcon, Loader2, Send, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  telefone: z.string().trim().regex(/^55\d{10,11}$/, { message: "Número inválido. Use o formato 55DDD9XXXXXXXX" }),
  origem: z.string().trim().length(3, { message: "Selecione uma cidade da lista" }),
  destino: z.string().trim().length(3, { message: "Selecione uma cidade da lista" }),
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

const popularCities = [
    { name: "São Paulo", code: "GRU" }, { name: "Rio de Janeiro", code: "GIG" }, { name: "Brasília", code: "BSB" },
    { name: "Salvador", code: "SSA" }, { name: "Fortaleza", code: "FOR" }, { name: "Belo Horizonte", code: "CNF" },
    { name: "Manaus", code: "MAO" }, { name: "Curitiba", code: "CWB" }, { name: "Recife", code: "REC" },
    { name: "Porto Alegre", code: "POA" }, { name: "Lisboa", code: "LIS" }, { name: "Paris", code: "CDG" },
    { name: "Londres", code: "LHR" }, { name: "Nova York", code: "JFK" }, { name: "Miami", code: "MIA" },
    { name: "Orlando", code: "MCO" }, { name: "Buenos Aires", code: "EZE" }, { name: "Santiago", code: "SCL" },
    { name: "Madri", code: "MAD" }, { name: "Roma", code: "FCO" }, { name: "Tóquio", code: "NRT" },
    { name: "Dubai", code: "DXB" }, { name: "Cancún", code: "CUN" }, { name: "Amsterdã", code: "AMS" },
];

const Cotacao = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      telefone: "",
      origem: "",
      destino: "",
      somente_ida: false,
      quantidade_pessoas: 1,
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) setShowOriginSuggestions(false);
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) setShowDestinationSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOriginCities = popularCities.filter(c => c.name.toLowerCase().includes(originSearch.toLowerCase()) || c.code.toLowerCase().includes(originSearch.toLowerCase())).slice(0, 5);
  const filteredDestinationCities = popularCities.filter(c => c.name.toLowerCase().includes(destinationSearch.toLowerCase()) || c.code.toLowerCase().includes(destinationSearch.toLowerCase())).slice(0, 5);

  const selectOrigin = (city: { name: string; code: string }) => {
    form.setValue('origem', city.code, { shouldValidate: true });
    setOriginSearch(`${city.name} (${city.code})`);
    setShowOriginSuggestions(false);
  };

  const selectDestination = (city: { name: string; code: string }) => {
    form.setValue('destino', city.code, { shouldValidate: true });
    setDestinationSearch(`${city.name} (${city.code})`);
    setShowDestinationSuggestions(false);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        telefone: data.telefone,
        origem: data.origem,
        destino: data.destino,
        data_partida: format(data.data_partida, "yyyy-MM-dd"),
        data_retorno: data.somente_ida || !data.data_retorno ? null : format(data.data_retorno, "yyyy-MM-dd"),
        somente_ida: data.somente_ida,
        quantidade_pessoas: data.quantidade_pessoas,
      };

      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        "https://rsrkdrdkqpdoxlymvgwi.supabase.co/functions/v1/request-flight-quote",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        try {
          const errorBody = await response.json();
          throw new Error(errorBody.message || `Erro na requisição: ${response.statusText}`);
        } catch (e) {
          throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
      }

      const functionData = await response.json();

      if (functionData && !functionData.success) {
        throw new Error(functionData.message || "A função de cotação retornou um erro.");
      }
      
      toast({
        title: "Solicitação Enviada com Sucesso!",
        description: "Recebemos seu pedido. Você receberá uma mensagem no WhatsApp em instantes com sua cotação.",
      });
      form.reset();
      setOriginSearch("");
      setDestinationSearch("");
    } catch (error) {
      console.error("Erro ao processar cotação:", error);
      
      let userFriendlyMessage = "Ocorreu um erro desconhecido. Por favor, tente novamente mais tarde.";
      let errorTitle = "Erro ao Enviar Solicitação";

      if (error instanceof Error) {
        if (error.message.includes("This number is not found on WhatsApp")) {
          errorTitle = "WhatsApp não encontrado";
          userFriendlyMessage = "O número de telefone informado não foi encontrado no WhatsApp. Por favor, verifique e tente novamente.";
          form.setError("telefone", { type: "manual", message: "Este número não foi encontrado no WhatsApp." });
        } else {
          userFriendlyMessage = `Detalhe: ${error.message}`;
        }
      }
      
      toast({
        title: errorTitle,
        description: userFriendlyMessage,
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
                Preencha o formulário e receba as melhores opções no seu WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="telefone" render={({ field }) => (<FormItem><FormLabel>WhatsApp *</FormLabel><FormControl><Input type="tel" placeholder="5531999999999" {...field} maxLength={13} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="origem" render={() => (<FormItem ref={originRef}><FormLabel>Cidade de Origem *</FormLabel><FormControl><div className="relative"><Input placeholder="Digite a cidade de origem" value={originSearch} onChange={e => { setOriginSearch(e.target.value); setShowOriginSuggestions(true); form.setValue('origem', ''); }} onFocus={() => setShowOriginSuggestions(true)} /><div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-60 overflow-auto">{showOriginSuggestions && originSearch && filteredOriginCities.map(c => (<button key={c.code} type="button" onClick={() => selectOrigin(c)} className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-2"><Plane className="w-4 h-4 text-muted-foreground" /><span className="font-medium">{c.name}</span><span className="text-sm text-muted-foreground">({c.code})</span></button>))}</div></div></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="destino" render={() => (<FormItem ref={destinationRef}><FormLabel>Cidade de Destino *</FormLabel><FormControl><div className="relative"><Input placeholder="Digite a cidade de destino" value={destinationSearch} onChange={e => { setDestinationSearch(e.target.value); setShowDestinationSuggestions(true); form.setValue('destino', ''); }} onFocus={() => setShowDestinationSuggestions(true)} /><div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-60 overflow-auto">{showDestinationSuggestions && destinationSearch && filteredDestinationCities.map(c => (<button key={c.code} type="button" onClick={() => selectDestination(c)} className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-2"><Plane className="w-4 h-4 text-muted-foreground" /><span className="font-medium">{c.name}</span><span className="text-sm text-muted-foreground">({c.code})</span></button>))}</div></div></FormControl><FormMessage /></FormItem>)} />
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