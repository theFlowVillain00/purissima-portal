import { Link } from "react-router-dom";
import { Droplet } from "lucide-react";

const Footer = () => {
  const coordinates = {
    x: 1024,
    y: 64,
    z: -512,
  };

  const footerLinks = [
    { name: "Home", path: "/" },
    { name: "Staff", path: "/staff" },
    { name: "Ordini", path: "/ordini" },
    { name: "Accedi", path: "/accedi" },
  ];

  return (
    <footer className="border-t border-border bg-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Disclaimer Section */}
          <div className="max-w-md">
            <div className="mb-3 flex items-center gap-2">
              <Droplet className="h-5 w-5 text-primary" />
              <span className="font-bold text-secondary-foreground">Purissima™</span>
            </div>
            <p className="text-sm text-secondary-foreground/80">
              La miglior azienda di prodotti artigianali nel mondo Minecraft. 
              Qualità garantita dal 2024.
            </p>
            <div className="mt-4 font-mono text-sm text-secondary-foreground/70">
              <span className="font-semibold">Coordinate:</span>{" "}
              X: {coordinates.x}, Y: {coordinates.y}, Z: {coordinates.z}
            </div>
          </div>

          {/* Links Section */}
          <div className="flex flex-col gap-2">
            <span className="mb-2 text-sm font-semibold text-secondary-foreground">
              Link Utili
            </span>
            {footerLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm text-secondary-foreground/80 transition-colors hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-secondary-foreground/20 pt-6 text-center">
          <p className="text-xs text-secondary-foreground/60">
            © {new Date().getFullYear()} Purissima™. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
