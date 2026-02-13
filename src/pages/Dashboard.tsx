import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Pencil, Trash2, StickyNote, MoreHorizontal, ExternalLink, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id_ordine: string;
  cliente: string;
  contatto: string;
  azienda: string;
  data: string;
  dipendente: string;
  data_consegna: string;
  autore_consegna: string;
  preso_in_carico_da: string;
  stato: string;
  ddt_consegnato: boolean;
  note: string;
  nickname_minecraft: string;
  nickname_telegram: string;
  prodotti: { name: string; quantity: number; price: number }[];
}

const initialOrders: Order[] = [
  {
    id_ordine: "ORD-001", cliente: "Steve", contatto: "@steve_tg", azienda: "DiamondCorp",
    data: "2026-02-01", dipendente: "", data_consegna: "", autore_consegna: "",
    preso_in_carico_da: "", stato: "In attesa", ddt_consegnato: false, note: "",
    nickname_minecraft: "Steve", nickname_telegram: "@steve_tg",
    prodotti: [{ name: "Diamanti x64", quantity: 2, price: 500 }],
  },
  {
    id_ordine: "ORD-002", cliente: "Alex", contatto: "@alex_tg", azienda: "NetheriteInc",
    data: "2026-02-03", dipendente: "Marco", data_consegna: "2026-02-10", autore_consegna: "Luca",
    preso_in_carico_da: "Admin", stato: "Completato", ddt_consegnato: true, note: "Consegnato in tempo",
    nickname_minecraft: "Alex", nickname_telegram: "@alex_tg",
    prodotti: [{ name: "Netherite Ingot x16", quantity: 1, price: 800 }],
  },
];

const statusColor = (stato: string) => {
  switch (stato) {
    case "Completato": return "default";
    case "In lavorazione": return "secondary";
    case "In attesa": return "outline";
    default: return "outline";
  }
};

// --- Sub-components ---

interface OrderActionsProps {
  order: Order;
  isAdmin: boolean;
  onNote: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onDetails: (order: Order) => void;
}

const OrderActions = ({ order, isAdmin, onNote, onEdit, onDelete }: Omit<OrderActionsProps, 'onDetails'>) => (
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="sm" className="flex h-auto flex-col items-center gap-0.5 px-2 py-1"
      onClick={(e) => { e.stopPropagation(); onNote(order); }}>
      <StickyNote className="h-3.5 w-3.5" />
      <span className="text-[10px]">Note</span>
    </Button>
    <Button variant="ghost" size="sm" className="flex h-auto flex-col items-center gap-0.5 px-2 py-1"
      onClick={(e) => { e.stopPropagation(); onEdit(order); }}>
      <Pencil className="h-3.5 w-3.5" />
      <span className="text-[10px]">Modifica</span>
    </Button>
    {isAdmin && (
      <Button variant="ghost" size="sm" className="flex h-auto flex-col items-center gap-0.5 px-2 py-1"
        onClick={(e) => { e.stopPropagation(); onDelete(order.id_ordine); }}>
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
        <span className="text-[10px]">Elimina</span>
      </Button>
    )}
  </div>
);

const OrderCardView = ({ order, isAdmin, onNote, onEdit, onDelete, onDetails }: OrderActionsProps) => (
  <Card className="cursor-pointer border-border bg-card transition-colors hover:bg-accent/30" onClick={() => onDetails(order)}>
    <CardContent className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-foreground">{order.id_ordine}</span>
        <Badge variant={statusColor(order.stato) as "default" | "secondary" | "outline"}>{order.stato}</Badge>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <p><strong>Data:</strong> {order.data}</p>
        <p><strong>Consegna:</strong> {order.data_consegna || "-"}</p>
        <p><strong>Preso in carico da:</strong> {order.preso_in_carico_da || "-"}</p>
        <p><strong>Lavorazione:</strong> {order.dipendente || "-"}</p>
      </div>
      <div className="mt-3 flex items-center justify-center border-t border-border pt-3">
        <div className="flex items-center gap-3">
          <img
            src={`https://mc-heads.net/avatar/${order.nickname_minecraft || order.cliente}/32`}
            alt={order.cliente}
            className="h-8 w-8 rounded"
          />
          <OrderActions order={order} isAdmin={isAdmin} onNote={onNote} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const OrderCompactView = ({ order, isAdmin, onNote, onEdit, onDelete, onDetails }: OrderActionsProps) => (
  <Card className="cursor-pointer border-border bg-card transition-colors hover:bg-accent/30" onClick={() => onDetails(order)}>
    <CardContent className="flex items-center justify-between gap-3 p-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="shrink-0 font-mono text-xs font-bold text-foreground">{order.id_ordine}</span>
        <span className="text-xs text-muted-foreground">
          <span className="hidden text-muted-foreground/60 md:inline">Data: </span>{order.data}
        </span>
        <span className="hidden truncate text-xs text-muted-foreground md:inline">
          <span className="text-muted-foreground/60">Consegna: </span>{order.data_consegna || "-"}
        </span>
        <span className="hidden truncate text-xs text-muted-foreground md:inline">
          <span className="text-muted-foreground/60">Carico: </span>{order.preso_in_carico_da || "-"}
        </span>
        <span className="hidden truncate text-xs text-muted-foreground lg:inline">
          <span className="text-muted-foreground/60">Lavorazione: </span>{order.dipendente || "-"}
        </span>
        <Badge variant={statusColor(order.stato) as "default" | "secondary" | "outline"} className="shrink-0 text-[10px]">
          {order.stato}
        </Badge>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onNote(order); }}>
          <StickyNote className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onEdit(order); }}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        {isAdmin && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onDelete(order.id_ordine); }}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [noteOrder, setNoteOrder] = useState<Order | null>(null);
  const [noteText, setNoteText] = useState("");
  const [viewMode, setViewMode] = useState<string>("cards");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  if (!user) return <Navigate to="/accedi" replace />;

  const isAdmin = user.role === "admin";

  const handleUpdate = () => {
    if (!editingOrder) return;
    setOrders((prev) => prev.map((o) => (o.id_ordine === editingOrder.id_ordine ? editingOrder : o)));
    setEditingOrder(null);
    toast.success("Ordine aggiornato!");
  };

  const handleDelete = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id_ordine !== id));
    toast.success("Ordine eliminato!");
  };

  const handleAddNote = () => {
    if (!noteOrder || !noteText.trim()) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id_ordine === noteOrder.id_ordine
          ? { ...o, note: o.note ? `${o.note}\n${noteText}` : noteText }
          : o
      )
    );
    setNoteOrder(null);
    setNoteText("");
    toast.success("Nota aggiunta!");
  };

  const actionProps = (order: Order) => ({
    order,
    isAdmin,
    onNote: (o: Order) => { setNoteOrder(o); setNoteText(""); },
    onEdit: (o: Order) => setEditingOrder({ ...o }),
    onDelete: handleDelete,
    onDetails: (o: Order) => setDetailOrder(o),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Ciao, {user.username}</h1>
        <Button onClick={() => navigate("/ordini")}>
          <ExternalLink className="mr-2 h-4 w-4" /> Nuovo Ordine
        </Button>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Ordini</h2>
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList className="h-8">
              <TabsTrigger value="cards" className="h-6 px-2">
                <LayoutGrid className="mr-1 h-3.5 w-3.5" />
                <span className="text-xs">Card</span>
              </TabsTrigger>
              <TabsTrigger value="compact" className="h-6 px-2">
                <List className="mr-1 h-3.5 w-3.5" />
                <span className="text-xs">Compatta</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {viewMode === "cards" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCardView key={order.id_ordine} {...actionProps(order)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.map((order) => (
              <OrderCompactView key={order.id_ordine} {...actionProps(order)} />
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={!!detailOrder} onOpenChange={(open) => !open && setDetailOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dettagli Ordine - {detailOrder?.id_ordine}</DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={`https://mc-heads.net/avatar/${detailOrder.nickname_minecraft || detailOrder.cliente}/48`}
                  alt={detailOrder.cliente}
                  className="h-12 w-12 rounded"
                />
                <div>
                  <p className="font-bold text-foreground">{detailOrder.cliente}</p>
                  <p className="text-sm text-muted-foreground">{detailOrder.azienda}</p>
                </div>
                <Badge variant={statusColor(detailOrder.stato) as "default" | "secondary" | "outline"} className="ml-auto">
                  {detailOrder.stato}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-md border border-border p-3 text-sm">
                <div><span className="text-muted-foreground">Data:</span> <span className="text-foreground">{detailOrder.data}</span></div>
                <div><span className="text-muted-foreground">Consegna:</span> <span className="text-foreground">{detailOrder.data_consegna || "-"}</span></div>
                <div><span className="text-muted-foreground">Contatto:</span> <span className="text-foreground">{detailOrder.contatto}</span></div>
                <div><span className="text-muted-foreground">Autore consegna:</span> <span className="text-foreground">{detailOrder.autore_consegna || "-"}</span></div>
                <div><span className="text-muted-foreground">Preso in carico da:</span> <span className="text-foreground">{detailOrder.preso_in_carico_da || "-"}</span></div>
                <div><span className="text-muted-foreground">Lavorazione:</span> <span className="text-foreground">{detailOrder.dipendente || "-"}</span></div>
                <div><span className="text-muted-foreground">DDT:</span> <span className="text-foreground">{detailOrder.ddt_consegnato ? "✅" : "❌"}</span></div>
                <div><span className="text-muted-foreground">MC:</span> <span className="text-foreground">{detailOrder.nickname_minecraft}</span></div>
              </div>
              {detailOrder.prodotti.length > 0 && (
                <div className="rounded-md border border-border p-3">
                  <p className="mb-2 text-sm font-semibold text-foreground">Prodotti</p>
                  {detailOrder.prodotti.map((p, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{p.name} x{p.quantity}</span>
                      <span className="text-foreground">€{p.price * p.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
              {detailOrder.note && (
                <div className="whitespace-pre-wrap rounded-md bg-accent p-3 text-sm text-muted-foreground">
                  <p className="mb-1 text-xs font-semibold text-foreground">Note</p>
                  {detailOrder.note}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifica Ordine - {editingOrder?.id_ordine}</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <div className="grid gap-3 sm:grid-cols-2">
              {isAdmin ? (
                <>
                  {[
                    { key: "cliente", label: "Cliente" },
                    { key: "contatto", label: "Contatto" },
                    { key: "azienda", label: "Azienda" },
                    { key: "dipendente", label: "Dipendente" },
                    { key: "data_consegna", label: "Data di consegna", type: "date" },
                    { key: "autore_consegna", label: "Autore della consegna" },
                    { key: "preso_in_carico_da", label: "Preso in carico da" },
                    { key: "stato", label: "Stato" },
                  ].map(({ key, label, type }) => (
                    <div key={key} className="space-y-1">
                      <Label>{label}</Label>
                      <Input
                        type={type || "text"}
                        value={(editingOrder as unknown as Record<string, unknown>)[key] as string || ""}
                        onChange={(e) => setEditingOrder((p) => (p ? { ...p, [key]: e.target.value } : p))}
                      />
                    </div>
                  ))}
                  <div className="col-span-full flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!editingOrder.ddt_consegnato}
                      onChange={(e) => setEditingOrder((p) => (p ? { ...p, ddt_consegnato: e.target.checked } : p))}
                      className="h-4 w-4"
                    />
                    <Label>DDT Consegnato</Label>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <Label>Nickname Minecraft</Label>
                    <Input
                      value={editingOrder.nickname_minecraft}
                      onChange={(e) => setEditingOrder((p) => (p ? { ...p, nickname_minecraft: e.target.value } : p))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Nickname Telegram</Label>
                    <Input
                      value={editingOrder.nickname_telegram}
                      onChange={(e) => setEditingOrder((p) => (p ? { ...p, nickname_telegram: e.target.value } : p))}
                    />
                  </div>
                  <div className="col-span-full">
                    <Label className="mb-2 block">Prodotti</Label>
                    {editingOrder.prodotti.map((prod, i) => (
                      <div key={i} className="mb-2 flex items-center gap-2">
                        <span className="flex-1 text-sm text-muted-foreground">{prod.name} (€{prod.price})</span>
                        <Input
                          type="number"
                          min={0}
                          className="w-20"
                          value={prod.quantity}
                          onChange={(e) => {
                            const newProdotti = [...editingOrder.prodotti];
                            newProdotti[i] = { ...newProdotti[i], quantity: parseInt(e.target.value) || 0 };
                            setEditingOrder((p) => (p ? { ...p, prodotti: newProdotti } : p));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
              <Button onClick={handleUpdate} className="col-span-full mt-2 w-full">Salva</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={!!noteOrder} onOpenChange={(open) => !open && setNoteOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Note - {noteOrder?.id_ordine}</DialogTitle>
          </DialogHeader>
          {noteOrder?.note && (
            <div className="mb-3 whitespace-pre-wrap rounded-md bg-accent p-3 text-sm text-muted-foreground">
              {noteOrder.note}
            </div>
          )}
          <Textarea placeholder="Aggiungi una nota..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
          <Button onClick={handleAddNote} className="mt-2 w-full">Aggiungi Nota</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
