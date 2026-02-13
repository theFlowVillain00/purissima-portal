import { Link } from "react-router-dom";
import { Droplet } from "lucide-react";

const Footer = () => {
  const coordinates = {
    x: 1024,
    y: 64,
    z: -512
  };

  const footerLinks = [
  { name: "Home", path: "/" },
  { name: "Staff", path: "/staff" },
  { name: "Ordini", path: "/ordini" },
  { name: "Accedi", path: "/accedi" }];


  return (
    <footer className="border-t border-border bg-secondary">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <Droplet className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-secondary-foreground">Purissima™</span>
            <span className="hidden text-xs text-secondary-foreground/60 sm:inline">—</span>
            <span className="hidden text-xs text-secondary-foreground/70 sm:inline">
              Qualità garantita dal 2024
            </span>
            <span className="hidden font-mono text-xs text-secondary-foreground/60 md:inline">
              · X:{coordinates.x} Y:{coordinates.y} Z:{coordinates.z}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-xs text-secondary-foreground/70 transition-colors hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>




      </div>
    </footer>);

};

export default Footer;