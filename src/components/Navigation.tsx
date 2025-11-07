import { Link } from "react-router-dom";
import logo from "@/assets/logo-gfchaves.png";

const Navigation = () => {
  const navLinks = [
    { path: "/buscar-voos", label: "Buscar Voos" },
    { path: "/pacotes", label: "Pacotes" },
    { path: "/contato", label: "Contato" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center transition-transform duration-300 hover:scale-110">
            <img src={logo} alt="GFCHAVES Travel Experience" className="h-16 brightness-0 invert" />
          </Link>
          
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-white transition-transform duration-200 hover:scale-125"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
