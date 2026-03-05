import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Trash2, Send, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useArticoli } from "@/hooks/useArticoli";
import { useCreateOrdine } from "@/hooks/useOrdini";
import type { Articolo } from "@/lib/types";

interface CartItem {
  articolo: Articolo;
  quantita: number;
}

const Ordini = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: articoli = [], isLoading, isError } = useArticoli();
  const createOrdine = useCreateOrdine();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNote, setOrderNote] = useState("");
  const [staffViewPublic, setStaffViewPublic] = useState(true);

  if (!user) {
    navigate("/accedi", { replace: true });
    return null;
  }

  const isStaff = user.role === "staff";
  // Staff can toggle between public/private pricing; clients always use their own tier
  const viewAsPublic = isStaff ? staffViewPublic : user.isPublic;

  // Pick the right price for this user's company type
  const getPrice = (a: Articolo): number =>
    viewAsPublic ? (a.prezzo_pubblico ?? 0) : (a.prezzo_privato ?? 0);

  const nomeAzienda = isStaff ? "Purissima" : user.azienda;
  const categoriaAzienda = viewAsPublic
    ? "Prodotti per aziende pubbliche"
    : "Prodotti per aziende private";

  const getQuantita = (id: string) =>
    cart.find((i) => i.articolo.id === id)?.quantita ?? 0;

  const updateQuantita = (articolo: Articolo, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.articolo.id === articolo.id);
      if (!existing) {
        if (delta > 0) return [...prev, { articolo, quantita: 1 }];
        return prev;
      }
      const newQty = existing.quantita + delta;
      if (newQty <= 0) return prev.filter((i) => i.articolo.id !== articolo.id);
      return prev.map((i) =>
        i.articolo.id === articolo.id ? { ...i, quantita: newQty } : i
      );
    });
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.articolo.id !== id));

  const totalPrice = cart.reduce(
    (sum, item) => sum + getPrice(item.articolo) * item.quantita,
    0
  );

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error("Il carrello è vuoto");
      return;
    }
    try {
      await createOrdine.mutateAsync({
        creatoDa: user.id,
        cart: cart.map((item) => ({
          articolo_id: item.articolo.id,
          quantita: item.quantita,
        })),
        notes: orderNote.trim() || undefined,
      });
      toast.success("Ordine inviato! Ti contatteremo presto.");
      setCart([]);
      setOrderNote("");
    } catch (err) {
      console.error(err);
      toast.error("Errore nell'invio dell'ordine. Riprova.");
    }
  };

  return (
    <div className="container mx-auto flex h-full flex-col px-4 py-6">
      <div className="mb-4 text-center">
        <h1 className="mb-1 font-serif text-2xl font-bold text-foreground">Ordini</h1>
        <p className="text-sm text-muted-foreground">
          Seleziona i prodotti che desideri acquistare.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Product list */}
        <div className="lg:col-span-2">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Prodotti Disponibili
                {!isLoading && ` (${articoli.length})`}
              </h2>
              <p className="text-sm text-muted-foreground">
                {nomeAzienda}
                <span className="mx-2 text-border">·</span>
                {categoriaAzienda}
              </p>
            </div>
          </div>

          {isStaff && (
            <div className="mb-4 flex items-center gap-2">
              <Label htmlFor="pricing-switch" className="text-xs text-muted-foreground">
                {staffViewPublic ? "Prezzi pubblici" : "Prezzi privati"}
              </Label>
              <Switch
                id="pricing-switch"
                checked={staffViewPublic}
                onCheckedChange={setStaffViewPublic}
              />
            </div>
          )}

          {isLoading && (
            <p className="py-8 text-center text-muted-foreground">Caricamento prodotti…</p>
          )}

          {isError && (
            <p className="py-8 text-center text-destructive">
              Errore nel caricamento dei prodotti.
            </p>
          )}

          {!isLoading && !isError && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {articoli.map((articolo) => {
                const qty = getQuantita(articolo.id);
                const price = getPrice(articolo);
                return (
                  <div
                    key={articolo.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-card-foreground">{articolo.nome}</p>
                      {articolo.descrizione && (
                        <p className="text-xs text-muted-foreground">{articolo.descrizione}</p>
                      )}
                      <p className="text-sm font-bold text-primary">€{price}</p>
                    </div>
                    <div className="flex items-center gap-0 overflow-hidden rounded-md border border-border">
                      <button
                        onClick={() => updateQuantita(articolo, -1)}
                        className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="flex h-9 w-10 items-center justify-center border-x border-border text-sm font-medium text-foreground">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantita(articolo, 1)}
                        className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Carrello
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">Il carrello è vuoto</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.articolo.id}
                      className="flex items-center justify-between rounded-md border border-border bg-accent/50 p-2"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">
                          {item.articolo.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantita}x €{getPrice(item.articolo)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.articolo.id)}
                        className="rounded p-1 text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <div className="border-t border-border pt-3">
                    <div className="mb-4 flex justify-between text-lg font-bold">
                      <span className="text-card-foreground">Totale:</span>
                      <span className="text-primary">€{totalPrice}</span>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      className="w-full"
                      disabled={createOrdine.isPending}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {createOrdine.isPending ? "Invio in corso…" : "Invia Ordine"}
                    </Button>
                    <Textarea
                      className="mt-3 text-sm"
                      placeholder="Note sull'ordine (opzionale)"
                      rows={3}
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Ordini;
