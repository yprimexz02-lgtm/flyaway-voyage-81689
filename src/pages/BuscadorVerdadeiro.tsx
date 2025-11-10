import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const BuscadorVerdadeiro = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-20 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Buscador Verdadeiro</h1>
          <p className="text-lg text-muted-foreground">
            Esta é a sua nova página de teste.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BuscadorVerdadeiro;