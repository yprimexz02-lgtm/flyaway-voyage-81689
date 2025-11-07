import { Link } from "react-router-dom";

const Navigation = () => {
  const navLinks = [
    { path: "/buscar-voos", label: "Buscar Voos" },
    { path: "/pacotes", label: "Pacotes" },
    { path: "/contato", label: "Contato" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-end items-center h-16 gap-8">
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
    </nav>
  );
};

export default Navigation;
