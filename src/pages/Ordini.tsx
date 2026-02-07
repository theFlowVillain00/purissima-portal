import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Trash2, Send } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const Ordini = () => {
  const [formData, setFormData] = useState({
    nomeAzienda: "",
    nicknameMinecraft: "",
    nicknameTelegram: "",
  });

  const [cart, setCart] = useState<CartItem[]>([]);

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

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} aggiunto al carrello!`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomeAzienda || !formData.nicknameMinecraft || !formData.nicknameTelegram) {
      toast.error("Per favore compila tutti i campi del modulo");
      return;
    }
    if (cart.length === 0) {
      toast.error("Il carrello è vuoto");
      return;
    }
    toast.success("Ordine inviato con successo! Ti contatteremo su Telegram.");
    setCart([]);
    setFormData({ nomeAzienda: "", nicknameMinecraft: "", nicknameTelegram: "" });
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 font-serif text-4xl font-bold text-foreground">Ordini</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Compila il modulo e seleziona i prodotti che desideri acquistare.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card className="mb-8 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Informazioni Ordine</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="nomeAzienda">Nome Azienda</Label>
                  <Input
                    id="nomeAzienda"
                    placeholder="La tua azienda"
                    value={formData.nomeAzienda}
                    onChange={(e) =>
                      setFormData({ ...formData, nomeAzienda: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nicknameMinecraft">Nickname Minecraft</Label>
                  <Input
                    id="nicknameMinecraft"
                    placeholder="Il tuo nickname"
                    value={formData.nicknameMinecraft}
                    onChange={(e) =>
                      setFormData({ ...formData, nicknameMinecraft: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nicknameTelegram">Nickname Telegram</Label>
                  <Input
                    id="nicknameTelegram"
                    placeholder="@username"
                    value={formData.nicknameTelegram}
                    onChange={(e) =>
                      setFormData({ ...formData, nicknameTelegram: e.target.value })
                    }
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-foreground">Prodotti Disponibili</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer border-border bg-card transition-all hover:border-primary hover:shadow-md"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="flex flex-col items-center gap-2 p-4">
                    <Package className="h-8 w-8 text-primary" />
                    <span className="text-center text-sm font-medium text-card-foreground">
                      {product.name}
                    </span>
                    <Badge variant="secondary">{product.category}</Badge>
                    <span className="text-lg font-bold text-primary">{product.price}€</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
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
                <p className="py-4 text-center text-muted-foreground">
                  Il carrello è vuoto
                </p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border border-border bg-accent/50 p-2"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity}x {item.price}€
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="rounded p-1 text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <div className="border-t border-border pt-3">
                    <div className="mb-4 flex justify-between text-lg font-bold">
                      <span className="text-card-foreground">Totale:</span>
                      <span className="text-primary">{totalPrice}€</span>
                    </div>

                    {/* Order Summary */}
                    {formData.nomeAzienda && (
                      <div className="mb-4 rounded-md bg-accent p-3 text-sm">
                        <p className="text-muted-foreground">
                          <strong>Azienda:</strong> {formData.nomeAzienda}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>MC:</strong> {formData.nicknameMinecraft || "-"}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>TG:</strong> {formData.nicknameTelegram || "-"}
                        </p>
                      </div>
                    )}

                    <Button onClick={handleSubmit} className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Invia Ordine
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
