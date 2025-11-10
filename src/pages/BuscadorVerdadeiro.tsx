import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const BuscadorVerdadeiro = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-20" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">Buscador Verdadeiro</h1>
          <div id="tpwl-search"></div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BuscadorVerdadeiro;