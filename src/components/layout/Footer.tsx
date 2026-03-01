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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplet className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-secondary-foreground">Purissima™ - dal 2024</span>
            <span className="hidden text-xs text-secondary-foreground/60 sm:inline">—</span>
            <span className="hidden text-xs text-secondary-foreground/70 sm:inline">
              Qualità garantita dal 2024
            </span>
          </div>
          <div className="text-sm text-secondary-foreground/70 italic">
            fatto con 💖 da{" "}
            <a
              href="https://t.me/mordicchio00"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary transition-colors hover:text-primary/80">

              -uli
            </a>
          </div>
          <div className="hidden items-center gap-1 font-mono text-xs text-secondary-foreground/60 sm:flex">
            <span className="text-secondary-foreground/40">coord.</span>
            <span className="text-sm">X:{coordinates.x}</span>
            <span className="text-sm">Y:{coordinates.y}</span>
            <span className="text-sm">Z:{coordinates.z}</span>
          </div>
        </div>




      </div>
    </footer>);

};

export default Footer;