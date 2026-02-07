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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Pencil, Trash2, Plus, StickyNote } from "lucide-react";
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
}

const initialOrders: Order[] = [
  {
    id_ordine: "ORD-001",
    cliente: "Steve",
    contatto: "@steve_tg",
    azienda: "DiamondCorp",
    data: "2026-02-01",
    dipendente: "",
    data_consegna: "",
    autore_consegna: "",
    preso_in_carico_da: "",
    stato: "In attesa",
    ddt_consegnato: false,
    note: "",
  },
  {
    id_ordine: "ORD-002",
    cliente: "Alex",
    contatto: "@alex_tg",
    azienda: "NetheriteInc",
    data: "2026-02-03",
    dipendente: "Marco",
    data_consegna: "2026-02-10",
    autore_consegna: "Luca",
    preso_in_carico_da: "Admin",
    stato: "Completato",
    ddt_consegnato: true,
    note: "Consegnato in tempo",
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [noteOrder, setNoteOrder] = useState<Order | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    cliente: "", contatto: "", azienda: "", dipendente: "",
    data_consegna: "", autore_consegna: "", preso_in_carico_da: "",
    stato: "In attesa", ddt_consegnato: false, note: "",
  });

  if (!user) return <Navigate to="/accedi" replace />;

  const isLocked = (order: Order) => !!order.preso_in_carico_da;

  const handleCreate = () => {
    const order: Order = {
      id_ordine: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      cliente: newOrder.cliente || "",
      contatto: newOrder.contatto || "",
      azienda: newOrder.azienda || "",
      data: new Date().toISOString().split("T")[0],
      dipendente: newOrder.dipendente || "",
      data_consegna: newOrder.data_consegna || "",
      autore_consegna: newOrder.autore_consegna || "",
      preso_in_carico_da: newOrder.preso_in_carico_da || "",
      stato: newOrder.stato || "In attesa",
      ddt_consegnato: newOrder.ddt_consegnato || false,
      note: newOrder.note || "",
    };
    setOrders((prev) => [...prev, order]);
    setIsCreateOpen(false);
    setNewOrder({
      cliente: "", contatto: "", azienda: "", dipendente: "",
      data_consegna: "", autore_consegna: "", preso_in_carico_da: "",
      stato: "In attesa", ddt_consegnato: false, note: "",
    });
    toast.success("Ordine creato!");
  };

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

  const OrderFormFields = ({
    data,
    onChange,
  }: {
    data: Partial<Order>;
    onChange: (field: string, value: string | boolean) => void;
  }) => (
    <div className="grid gap-3 sm:grid-cols-2">
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
            value={(data as Record<string, unknown>)[key] as string || ""}
            onChange={(e) => onChange(key, e.target.value)}
          />
        </div>
      ))}
      <div className="col-span-full flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!data.ddt_consegnato}
          onChange={(e) => onChange("ddt_consegnato", e.target.checked)}
          className="h-4 w-4"
        />
        <Label>DDT Consegnato</Label>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          Ciao, {user.username}
        </h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuovo Ordine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Crea Ordine</DialogTitle>
            </DialogHeader>
            <OrderFormFields
              data={newOrder}
              onChange={(k, v) => setNewOrder((p) => ({ ...p, [k]: v }))}
            />
            <Button onClick={handleCreate} className="mt-4 w-full">Crea</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Ordini</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Contatto</TableHead>
                <TableHead>Azienda</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Dipendente</TableHead>
                <TableHead>Consegna</TableHead>
                <TableHead>Autore</TableHead>
                <TableHead>Preso da</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>DDT</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id_ordine}>
                  <TableCell className="font-mono text-xs">{order.id_ordine}</TableCell>
                  <TableCell>{order.cliente}</TableCell>
                  <TableCell>{order.contatto}</TableCell>
                  <TableCell>{order.azienda}</TableCell>
                  <TableCell>{order.data}</TableCell>
                  <TableCell>{order.dipendente}</TableCell>
                  <TableCell>{order.data_consegna || "-"}</TableCell>
                  <TableCell>{order.autore_consegna || "-"}</TableCell>
                  <TableCell>{order.preso_in_carico_da || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(order.stato) as "default" | "secondary" | "outline"}>
                      {order.stato}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.ddt_consegnato ? "✅" : "❌"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {!isLocked(order) && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingOrder({ ...order })}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Modifica Ordine</DialogTitle>
                              </DialogHeader>
                              {editingOrder && (
                                <>
                                  <OrderFormFields
                                    data={editingOrder}
                                    onChange={(k, v) =>
                                      setEditingOrder((p) => (p ? { ...p, [k]: v } : p))
                                    }
                                  />
                                  <Button onClick={handleUpdate} className="mt-4 w-full">
                                    Salva
                                  </Button>
                                </>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(order.id_ordine)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setNoteOrder(order);
                              setNoteText("");
                            }}
                          >
                            <StickyNote className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Note - {order.id_ordine}</DialogTitle>
                          </DialogHeader>
                          {order.note && (
                            <div className="mb-3 whitespace-pre-wrap rounded-md bg-accent p-3 text-sm text-muted-foreground">
                              {order.note}
                            </div>
                          )}
                          <Textarea
                            placeholder="Aggiungi una nota..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                          />
                          <Button onClick={handleAddNote} className="mt-2 w-full">
                            Aggiungi Nota
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
