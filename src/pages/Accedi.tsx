import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

const Accedi = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error("Per favore compila tutti i campi");
      return;
    }
    toast.success("Accesso effettuato con successo!");
    setFormData({ username: "", password: "" });
  };

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-16">
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
              <Input
                id="username"
                type="text"
                placeholder="Il tuo nome utente"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="La tua password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <Button type="submit" className="w-full">
              Accedi
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Accedi;
