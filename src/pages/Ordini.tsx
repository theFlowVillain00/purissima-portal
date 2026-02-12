import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Send, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const products: Product[] = [
  { id: "1", name: "Diamanti x64", price: 500, category: "Minerali" },
  { id: "2", name: "Netherite Ingot x16", price: 800, category: "Minerali" },
  { id: "3", name: "Enchanted Pickaxe", price: 350, category: "Strumenti" },
  { id: "4", name: "Enchanted Sword", price: 400, category: "Armi" },
  { id: "5", name: "Elytra", price: 1200, category: "Equipaggiamento" },
  { id: "6", name: "Shulker Box", price: 200, category: "Storage" },
  { id: "7", name: "Beacon", price: 750, category: "Blocchi" },
  { id: "8", name: "Golden Apple x16", price: 300, category: "Cibo" },
];

const Ordini = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);

  if (!user) {
    navigate("/accedi", { replace: true });
    return null;
  }

  const getQuantity = (id: string) => cart.find((i) => i.id === id)?.quantity || 0;

  const updateQuantity = (product: Product, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (!existing) {
        if (delta > 0) return [...prev, { ...product, quantity: 1 }];
        return prev;
      }
      const newQty = existing.quantity + delta;
      if (newQty <= 0) return prev.filter((i) => i.id !== product.id);
      return prev.map((i) => (i.id === product.id ? { ...i, quantity: newQty } : i));
    });
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = () => {
    if (cart.length === 0) {
      toast.error("Il carrello è vuoto");
      return;
    }
    toast.success("Ordine inviato con successo! Ti contatteremo su Telegram.");
    setCart([]);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 font-serif text-4xl font-bold text-foreground">Ordini</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Seleziona i prodotti che desideri acquistare.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Prodotti Disponibili ({products.length})
              </h2>
              <span className="text-sm text-muted-foreground">Prezzo per stack da 64</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {products.map((product) => {
                const qty = getQuantity(product.id);
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-card-foreground">{product.name}</p>
                      <p className="text-sm text-primary font-bold">€{product.price}</p>
                    </div>
                    <div className="flex items-center gap-0 rounded-md border border-border overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product, -1)}
                        className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="flex h-9 w-10 items-center justify-center text-sm font-medium text-foreground border-x border-border">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(product, 1)}
                        className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
                    <div key={item.id} className="flex items-center justify-between rounded-md border border-border bg-accent/50 p-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity}x €{item.price}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="rounded p-1 text-destructive transition-colors hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3">
                    <div className="mb-4 flex justify-between text-lg font-bold">
                      <span className="text-card-foreground">Totale:</span>
                      <span className="text-primary">€{totalPrice}</span>
                    </div>
                    <Button onClick={handleSubmit} className="w-full">
                      <Send className="mr-2 h-4 w-4" /> Invia Ordine
                    </Button>
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
