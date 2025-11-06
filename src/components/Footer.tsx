import { Link } from "react-router-dom";
import { Plane, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-secondary rounded-lg">
                <Plane className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">TravelExpert</span>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Sua agência de viagens de confiança. Realizamos sonhos e criamos memórias inesquecíveis.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/buscar-voos" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  Buscar Voos
                </Link>
              </li>
              <li>
                <Link to="/pacotes" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  Pacotes
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Destinos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Destinos Populares</h3>
            <ul className="space-y-2">
              <li className="text-primary-foreground/80 text-sm">Paris, França</li>
              <li className="text-primary-foreground/80 text-sm">Maldivas</li>
              <li className="text-primary-foreground/80 text-sm">Nova York, EUA</li>
              <li className="text-primary-foreground/80 text-sm">Dubai, EAU</li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">(11) 3456-7890</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">contato@travelexpert.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  Av. Paulista, 1000<br />São Paulo - SP
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2025 TravelExpert. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
