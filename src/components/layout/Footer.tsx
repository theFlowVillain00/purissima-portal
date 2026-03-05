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
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-secondary">
      <div className="container mx-auto px-6 py-3">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <Droplet className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-secondary-foreground">Purissima™</span>
            <span className="hidden font-mono text-xs text-secondary-foreground/60 md:inline">
              · X:{coordinates.x} Y:{coordinates.y} Z:{coordinates.z}
            </span>
          </div>
          <span className="text-sm text-secondary-foreground/70 italic">
            fatto con il 💖 da{" "}
            <a href="https://t.me/mordicchio00" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              uli
            </a>
          </span>
        </div>




      </div>
    </footer>);

};

export default Footer;