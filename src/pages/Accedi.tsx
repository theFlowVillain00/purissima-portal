import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Accedi = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Navigate only once the user state is actually populated —
  // doing it inside handleSubmit is too early (user is still null at that point).
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Per favore compila tutti i campi");
      return;
    }
    setSubmitting(true);
    const result = await login(username.trim(), password);
    if (result.ok) {
      toast.success("Accesso effettuato!");
      // keep submitting=true as a visual "loading" indicator;
      // the useEffect above will navigate when onAuthStateChange sets the user
    } else {
      setSubmitting(false);
      toast.error(result.error ?? "Credenziali non valide");
    }
  };

  return (
    <div className="container mx-auto flex h-full items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-card-foreground">
            <LogIn className="h-6 w-6 text-primary" />
            Accedi
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Inserisci le tue credenziali per accedere
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome Utente</Label>
              {/* Input + @purissima.com suffix shown inline */}
              <div className="flex items-center overflow-hidden rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <Input
                  id="username"
                  type="text"
                  placeholder="..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <span className="select-none whitespace-nowrap pr-3 text-sm text-muted-foreground">
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Accesso in corso…" : "Accedi"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Accedi;
