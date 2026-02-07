import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Pencil, Trash2, StickyNote, MoreHorizontal, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
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
  // Fields from Ordini page
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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [noteOrder, setNoteOrder] = useState<Order | null>(null);
  const [noteText, setNoteText] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (!user) return <Navigate to="/accedi" replace />;

  const isAdmin = user.role === "admin";

  const handleUpdate = () => {
    if (!editingOrder) return;
    setOrders((prev) =>
      prev.map((o) => (o.id_ordine === editingOrder.id_ordine ? editingOrder : o))
    );
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

  const statusColor = (stato: string) => {
    switch (stato) {
      case "Completato": return "default";
      case "In lavorazione": return "secondary";
      case "In attesa": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Ciao, {user.username}
        </h1>
        <Button onClick={() => navigate("/ordini")}>
          <ExternalLink className="mr-2 h-4 w-4" /> Nuovo Ordine
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Ordini</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Consegna</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id_ordine}>
                    <TableCell className="font-mono text-xs">{order.id_ordine}</TableCell>
                    <TableCell>{order.data}</TableCell>
                    <TableCell>{order.data_consegna || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor(order.stato) as "default" | "secondary" | "outline"}>
                        {order.stato}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                              Cliente: {order.cliente}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                              Contatto: {order.contatto}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                              Azienda: {order.azienda}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                              Dipendente: {order.dipendente || "-"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                              Autore: {order.autore_consegna || "-"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                              Preso da: {order.preso_in_carico_da || "-"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                              DDT: {order.ddt_consegnato ? "✅" : "❌"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          variant="ghost" size="icon"
                          onClick={() => setEditingOrder({ ...order })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        {isAdmin && (
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => handleDelete(order.id_ordine)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}

                        <Button
                          variant="ghost" size="icon"
                          onClick={() => { setNoteOrder(order); setNoteText(""); }}
                        >
                          <StickyNote className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {orders.map((order) => (
              <div key={order.id_ordine} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs font-bold text-foreground">{order.id_ordine}</p>
                    <p className="text-xs text-muted-foreground">{order.data}</p>
                  </div>
                  <Badge variant={statusColor(order.stato) as "default" | "secondary" | "outline"}>
                    {order.stato}
                  </Badge>
                </div>

                <button
                  onClick={() => setExpandedRow(expandedRow === order.id_ordine ? null : order.id_ordine)}
                  className="mt-2 flex w-full items-center justify-center gap-1 text-xs text-muted-foreground"
                >
                  {expandedRow === order.id_ordine ? (
                    <><ChevronUp className="h-3 w-3" /> Nascondi dettagli</>
                  ) : (
                    <><ChevronDown className="h-3 w-3" /> Mostra dettagli</>
                  )}
                </button>

                {expandedRow === order.id_ordine && (
                  <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                    <p><strong>Cliente:</strong> {order.cliente}</p>
                    <p><strong>Contatto:</strong> {order.contatto}</p>
                    <p><strong>Azienda:</strong> {order.azienda}</p>
                    <p><strong>Dipendente:</strong> {order.dipendente || "-"}</p>
                    <p><strong>Consegna:</strong> {order.data_consegna || "-"}</p>
                    <p><strong>Autore:</strong> {order.autore_consegna || "-"}</p>
                    <p><strong>Preso da:</strong> {order.preso_in_carico_da || "-"}</p>
                    <p><strong>DDT:</strong> {order.ddt_consegnato ? "✅" : "❌"}</p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditingOrder({ ...order })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id_ordine)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => { setNoteOrder(order); setNoteText(""); }}>
                    <StickyNote className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
