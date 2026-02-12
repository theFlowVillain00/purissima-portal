import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Droplet, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "Staff", path: "/staff" },
  ];

  const navLinks = publicLinks;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Droplet className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Purissima™</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Button asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="mr-1 h-4 w-4" /> Esci
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link to="/accedi">Accedi</Link>
                </Button>
              )}
            </div>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
          </button>
        </div>

        {isOpen && (
          <div className="border-t border-border pb-4 md:hidden">
            <div className="flex flex-col gap-2 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                    isActive(link.path) ? "bg-accent text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-2 px-4">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => { logout(); setIsOpen(false); }}>
                      <LogOut className="mr-1 h-4 w-4" /> Esci
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full">
                    <Link to="/accedi" onClick={() => setIsOpen(false)}>Accedi</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
