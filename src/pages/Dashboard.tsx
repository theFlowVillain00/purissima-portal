import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Trash2, MoreHorizontal, ExternalLink, LayoutGrid, List,
  ArrowUpDown, RefreshCw, Copy, FileText, Pencil, Check, ChevronsUpDown, UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useOrdini, useUpdateOrdine, useAppendNote, useUpdateVoce, useDeleteOrdine } from "@/hooks/useOrdini";
import { useStaff, type StaffMember } from "@/hooks/useStaff";
import {
  computeStato, formatNumeroOrdine,
  type OrdineConDettagli,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── Sorting ─────────────────────────────────────────────────────────────────

type SortOption = "numero_desc" | "numero_asc" | "stato" | "data_desc" | "data_asc" | "cliente";

const sortLabels: Record<SortOption, string> = {
  numero_desc: "Numero (più recente)",
  numero_asc: "Numero (meno recente)",
  stato: "Stato",
  data_desc: "Data (più recente)",
  data_asc: "Data (meno recente)",
  cliente: "Cliente",
};

function sortOrdini(ordini: OrdineConDettagli[], sort: SortOption): OrdineConDettagli[] {
  const s = [...ordini];
  switch (sort) {
    case "numero_desc": return s.sort((a, b) => b.numero_ordine - a.numero_ordine);
    case "numero_asc":  return s.sort((a, b) => a.numero_ordine - b.numero_ordine);
    case "stato":       return s.sort((a, b) => computeStato(a).localeCompare(computeStato(b)));
    case "data_desc":   return s.sort((a, b) => b.data.localeCompare(a.data));
    case "data_asc":    return s.sort((a, b) => a.data.localeCompare(b.data));
    case "cliente":     return s.sort((a, b) => (a.creato_da_nome ?? "").localeCompare(b.creato_da_nome ?? ""));
    default: return s;
  }
}

function filterOrdini(ordini: OrdineConDettagli[], q: string): OrdineConDettagli[] {
  if (!q.trim()) return ordini;
  const lower = q.toLowerCase();
  return ordini.filter((o) => {
    const stato = computeStato(o).toLowerCase();
    return (
      String(o.numero_ordine).includes(lower) ||
      (o.creato_da_nome ?? "").toLowerCase().includes(lower) ||
      (o.creato_da_azienda ?? "").toLowerCase().includes(lower) ||
      (o.gestito_da_nome ?? "").toLowerCase().includes(lower) ||
      (o.consegnatario_nome ?? "").toLowerCase().includes(lower) ||
      (o.notes ?? "").toLowerCase().includes(lower) ||
      stato.includes(lower) ||
      o.data.slice(0, 10).includes(lower)
    );
  });
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusColor(stato: string): string {
  if (stato === "Completato")     return "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30";
  if (stato === "Consegnato")     return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
  if (stato === "In lavorazione") return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
  return "bg-muted text-muted-foreground border-border";
}

// ─── CSV copy ─────────────────────────────────────────────────────────────────

function copyOrderCsv(ordine: OrdineConDettagli) {
  const prodotti = ordine.voci_ordine
    .map((v) => `${v.articoli?.nome ?? v.articolo_id}×${v.quantita}`)
    .join("; ");
  const fields = [
    formatNumeroOrdine(ordine.numero_ordine),
    ordine.data.slice(0, 10),
    ordine.creato_da_nome ?? "",
    ordine.creato_da_azienda ?? "",
    computeStato(ordine),
    ordine.totale > 0 ? `€${ordine.totale}` : "",
    ordine.gestito_da_nome ?? "",
    ordine.consegnatario_nome ?? "",
    ordine.data_consegna?.slice(0, 10) ?? "",
    prodotti,
    (ordine.notes ?? "").replace(/\n/g, " "),
  ];
  navigator.clipboard.writeText(fields.join("\t"));
  toast.success("Ordine copiato negli appunti");
}

// ─── Staff Combobox ───────────────────────────────────────────────────────────

interface StaffComboboxProps {
  value: string;
  onChange: (id: string) => void;
  staff: StaffMember[];
  placeholder?: string;
}

function StaffCombobox({ value, onChange, staff, placeholder = "Seleziona..." }: StaffComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = staff.find((s) => s.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
          <span className="truncate">{selected ? `${selected.nome} (${selected.azienda})` : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Cerca..." />
          <CommandList>
            <CommandEmpty>Nessun risultato.</CommandEmpty>
            <CommandGroup>
              {/* Clear option */}
              <CommandItem value="__clear__" onSelect={() => { onChange(""); setOpen(false); }}>
                <span className="text-muted-foreground italic">— Nessuno —</span>
              </CommandItem>
              {staff.map((s) => (
                <CommandItem
                  key={s.id}
                  value={`${s.nome} ${s.azienda}`}
                  onSelect={() => { onChange(s.id); setOpen(false); }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === s.id ? "opacity-100" : "opacity-0")} />
                  {s.nome}
                  <span className="ml-1 text-xs text-muted-foreground">({s.azienda})</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Action menu (shared between card + compact) ───────────────────────────────

interface ActionMenuProps {
  ordine: OrdineConDettagli;
  isStaff: boolean;
  onDetails: (o: OrdineConDettagli) => void;
  onEdit: (o: OrdineConDettagli) => void;
  onDelete: (o: OrdineConDettagli) => void;
  onCopy: (o: OrdineConDettagli) => void;
}

function ActionMenu({ ordine, isStaff, onDetails, onEdit, onDelete, onCopy }: ActionMenuProps) {
  const stato = computeStato(ordine);
  const clientCanEdit = !isStaff && stato === "In attesa";
  const clientCannotEditReason = stato !== "In attesa" ? `Ordine ${stato.toLowerCase()}` : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-full bg-muted/70 hover:bg-muted"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onDetails(ordine)}>
          <FileText className="mr-2 h-4 w-4" />
          Dettagli
        </DropdownMenuItem>

        {isStaff ? (
          <DropdownMenuItem onClick={() => onEdit(ordine)}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifica
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => clientCanEdit && onEdit(ordine)}
            disabled={!clientCanEdit}
            className={!clientCanEdit ? "opacity-50" : ""}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Modifica
            {clientCannotEditReason && (
              <span className="ml-2 text-xs text-muted-foreground">({clientCannotEditReason})</span>
            )}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => onCopy(ordine)}>
          <Copy className="mr-2 h-4 w-4" />
          Copia CSV
        </DropdownMenuItem>

        {isStaff && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(ordine)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Elimina
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── OrderCard (extended view) ────────────────────────────────────────────────

interface CardProps extends ActionMenuProps {}

const OrderCard = (props: CardProps) => {
  const { ordine } = props;
  const stato = computeStato(ordine);

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-bold text-foreground">
            {formatNumeroOrdine(ordine.numero_ordine)}
          </span>
          <div className="flex items-center gap-1">
            <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", statusColor(stato))}>
              {stato}
            </span>
            <ActionMenu {...props} />
          </div>
        </div>

        {/* Cliente */}
        <div className="mb-3">
          <p className="font-semibold text-sm text-foreground">{ordine.creato_da_nome ?? "—"}</p>
          {ordine.creato_da_contatto && (
            <p className="mt-0.5 text-xs text-muted-foreground">{ordine.creato_da_contatto}</p>
          )}
          {ordine.creato_da_azienda && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              <strong className="text-foreground">Azienda:</strong> {ordine.creato_da_azienda}
            </p>
          )}
        </div>

        {/* Grid info */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span><strong className="text-foreground">Data:</strong> {ordine.data.slice(0, 10)}</span>
          <span><strong className="text-foreground">Consegna:</strong> {ordine.data_consegna?.slice(0, 10) ?? "—"}</span>
          <span><strong className="text-foreground">Gestito da:</strong> {ordine.gestito_da_nome ?? "—"}</span>
          <span><strong className="text-foreground">Consegnatario:</strong> {ordine.consegnatario_nome ?? "—"}</span>
        </div>

        {/* Note — always visible, truncated to one line */}
        <p className="mt-1.5 truncate text-xs text-muted-foreground">
          <strong className="text-foreground">Note:</strong>{" "}
          {ordine.notes ? ordine.notes.replace(/\n/g, " ") : "—"}
        </p>

        
        {/* Totale */}
        {ordine.totale > 0 && (
          <p className="mt-2 text-sm font-bold text-primary">Totale: €{ordine.totale}</p>
        )}


      </CardContent>
    </Card>
  );
};

// ─── OrderCompact (list view) ─────────────────────────────────────────────────

const OrderCompact = (props: CardProps) => {
  const { ordine } = props;
  const stato = computeStato(ordine);
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex items-center gap-2 p-2">
        <span className="shrink-0 font-mono text-xs font-bold text-foreground w-12">
          {formatNumeroOrdine(ordine.numero_ordine)}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground w-20">{ordine.data.slice(0, 10)}</span>
        <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium", statusColor(stato))}>
          {stato}
        </span>
        <div className="flex-1" />
        <ActionMenu {...props} />
      </CardContent>
    </Card>
  );
};

// ─── Staff edit form state ────────────────────────────────────────────────────

interface StaffEdits {
  gestito_da: string;
  consegnatario: string;
  data_consegna: string;
  is_pagato: boolean;
  notes: string;
}

function ordineToStaffEdits(o: OrdineConDettagli): StaffEdits {
  return {
    gestito_da:   o.gestito_da ?? "",
    consegnatario: o.consegnatario ?? "",
    data_consegna: o.data_consegna?.slice(0, 10) ?? "",
    is_pagato:    o.is_pagato,
    notes:        o.notes ?? "",
  };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const REFRESH_COOLDOWN_MS = 15_000;

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: ordini = [], isLoading, isError } = useOrdini();
  const { data: staffList = [] } = useStaff();
  const updateOrdine = useUpdateOrdine();
  const appendNote = useAppendNote();
  const updateVoce = useUpdateVoce();
  const deleteOrdine = useDeleteOrdine();

  const [viewMode, setViewMode] = useState<string>("cards");
  const [sortBy, setSortBy] = useState<SortOption>("numero_desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Refresh cooldown
  const lastRefresh = useRef<number>(0);
  const [refreshCooldown, setRefreshCooldown] = useState(false);

  const handleRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefresh.current < REFRESH_COOLDOWN_MS) return;
    lastRefresh.current = now;
    setRefreshCooldown(true);
    qc.invalidateQueries({ queryKey: ["ordini"] });
    setTimeout(() => setRefreshCooldown(false), REFRESH_COOLDOWN_MS);
  }, [qc]);

  // Dialog state
  const [detailOrdine, setDetailOrdine] = useState<OrdineConDettagli | null>(null);

  // Staff edit
  const [editingOrdine, setEditingOrdine] = useState<OrdineConDettagli | null>(null);
  const [staffEdits, setStaffEdits] = useState<StaffEdits | null>(null);

  // Client edit
  const [clientEditOrdine, setClientEditOrdine] = useState<OrdineConDettagli | null>(null);
  const [clientQuantities, setClientQuantities] = useState<Record<string, number>>({});
  const [clientNotes, setClientNotes] = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<OrdineConDettagli | null>(null);

  if (authLoading) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">Caricamento...</p>
    </div>
  );
  if (!user) return <Navigate to="/accedi" replace />;

  const isStaff = user.role === "staff";

  const sorted = sortOrdini(ordini, sortBy);
  const filtered = filterOrdini(sorted, searchQuery);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteOrdine.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("Ordine eliminato!");
    } catch {
      toast.error("Errore nell'eliminazione");
    }
  };

  const handleStaffSave = async () => {
    if (!editingOrdine || !staffEdits) return;
    try {
      await updateOrdine.mutateAsync({
        id: editingOrdine.id,
        updates: {
          gestito_da:    staffEdits.gestito_da || null,
          consegnatario: staffEdits.consegnatario || null,
          data_consegna: staffEdits.data_consegna || null,
          is_pagato:     staffEdits.is_pagato,
          notes:         staffEdits.notes || null,
        },
      });
      setEditingOrdine(null);
      setStaffEdits(null);
      toast.success("Ordine aggiornato!");
    } catch {
      toast.error("Errore nell'aggiornamento");
    }
  };

  const handleClientSave = async () => {
    if (!clientEditOrdine) return;
    try {
      await Promise.all([
        ...Object.entries(clientQuantities).map(([voceId, quantita]) =>
          updateVoce.mutateAsync({ id: voceId, quantita })
        ),
        ...(clientNotes.trim()
          ? [appendNote.mutateAsync({
              id: clientEditOrdine.id,
              currentNotes: clientEditOrdine.notes,
              newNote: clientNotes.trim(),
            })]
          : []),
      ]);
      setClientEditOrdine(null);
      setClientQuantities({});
      setClientNotes("");
      toast.success("Ordine aggiornato!");
    } catch {
      toast.error("Errore nell'aggiornamento");
    }
  };

  const openEdit = (o: OrdineConDettagli) => {
    if (isStaff) {
      setEditingOrdine(o);
      setStaffEdits(ordineToStaffEdits(o));
    } else {
      setClientEditOrdine(o);
      setClientQuantities(
        Object.fromEntries(o.voci_ordine.map((v) => [v.id, v.quantita]))
      );
      setClientNotes("");
    }
  };

  const actionProps = (o: OrdineConDettagli): ActionMenuProps => ({
    ordine: o,
    isStaff,
    onDetails: setDetailOrdine,
    onEdit: openEdit,
    onDelete: setDeleteTarget,
    onCopy: copyOrderCsv,
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto flex h-full flex-col px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Ciao, {user.nome}
        </h1>
        <Button onClick={() => navigate("/ordini")}>
          <ExternalLink className="mr-2 h-4 w-4" /> Nuovo Ordine
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Title + count */}
          <h2 className="text-xl font-semibold text-foreground">Ordini</h2>
          <Badge variant="outline" className="font-mono text-xs">
            {searchQuery ? `${filtered.length} / ${ordini.length}` : ordini.length}
          </Badge>

          {/* Search */}
          <Input
            placeholder="Cerca ordini..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full text-xs sm:w-48"
          />

          <div className="ml-auto flex items-center gap-2">
            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sortLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View toggle */}
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList className="h-8">
                <TabsTrigger value="cards" className="h-6 px-2">
                  <LayoutGrid className="h-3.5 w-3.5" />
                </TabsTrigger>
                <TabsTrigger value="compact" className="h-6 px-2">
                  <List className="h-3.5 w-3.5" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Refresh */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={refreshCooldown}
              title={refreshCooldown ? "Attendi 15 secondi" : "Aggiorna"}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshCooldown && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* List */}
        {isLoading && (
          <p className="py-8 text-center text-muted-foreground">Caricamento ordini…</p>
        )}
        {isError && (
          <p className="py-8 text-center text-destructive">Errore nel caricamento degli ordini.</p>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            {searchQuery ? "Nessun ordine corrisponde alla ricerca." : "Nessun ordine trovato."}
          </p>
        )}

        {!isLoading && !isError && viewMode === "cards" ? (
          <div className="grid gap-3 overflow-auto sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((o) => <OrderCard key={o.id} {...actionProps(o)} />)}
          </div>
        ) : (
          <div className="grid gap-1.5 overflow-auto sm:grid-cols-2">
            {filtered.map((o) => <OrderCompact key={o.id} {...actionProps(o)} />)}
          </div>
        )}
      </div>

      {/* ── Details dialog ────────────────────────────────────────────────── */}
      <Dialog open={!!detailOrdine} onOpenChange={(open) => !open && setDetailOrdine(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Dettagli Ordine — {detailOrdine && formatNumeroOrdine(detailOrdine.numero_ordine)}
            </DialogTitle>
          </DialogHeader>
          {detailOrdine && (() => {
            const stato = computeStato(detailOrdine);
            return (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground">{detailOrdine.creato_da_nome ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">{detailOrdine.creato_da_azienda ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">{detailOrdine.creato_da_contatto ?? "—"}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium", statusColor(stato))}>
                    {stato}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-md border border-border p-3 text-sm">
                  <div><span className="text-muted-foreground">Data:</span> <span>{detailOrdine.data.slice(0, 10)}</span></div>
                  <div><span className="text-muted-foreground">Consegna:</span> <span>{detailOrdine.data_consegna?.slice(0, 10) ?? "—"}</span></div>
                  <div><span className="text-muted-foreground">Gestito da:</span> <span>{detailOrdine.gestito_da_nome ?? "—"}</span></div>
                  <div><span className="text-muted-foreground">Consegnatario:</span> <span>{detailOrdine.consegnatario_nome ?? "—"}</span></div>
                  <div><span className="text-muted-foreground">Pagato:</span> <span>{detailOrdine.is_pagato ? "✅" : "❌"}</span></div>
                  {detailOrdine.totale > 0 && (
                    <div><span className="text-muted-foreground">Totale:</span> <span className="font-bold text-primary">€{detailOrdine.totale}</span></div>
                  )}
                </div>
                {detailOrdine.voci_ordine.length > 0 && (
                  <div className="rounded-md border border-border p-3">
                    <p className="mb-2 text-sm font-semibold text-foreground">Prodotti</p>
                    {detailOrdine.voci_ordine.map((v) => (
                      <div key={v.id} className={cn("flex justify-between text-sm", v.quantita === 0 && "line-through opacity-50")}>
                        <span className="text-muted-foreground">
                          {v.articoli?.nome ?? v.articolo_id} ×{v.quantita}
                        </span>
                        {v.quantita > 0 && <span>€{v.prezzo_applicato * v.quantita}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {detailOrdine.notes && (
                  <div className="whitespace-pre-wrap rounded-md bg-accent p-3 text-sm text-muted-foreground">
                    <p className="mb-1 text-xs font-semibold text-foreground">Note</p>
                    {detailOrdine.notes}
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Staff edit dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={isStaff && !!editingOrdine}
        onOpenChange={(open) => { if (!open) { setEditingOrdine(null); setStaffEdits(null); } }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Modifica Ordine — {editingOrdine && formatNumeroOrdine(editingOrdine.numero_ordine)}
            </DialogTitle>
          </DialogHeader>
          {staffEdits && (
            <div className="grid gap-4">
              {/* Gestito da */}
              <div className="space-y-1">
                <Label>Gestito da</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <StaffCombobox
                      value={staffEdits.gestito_da}
                      onChange={(id) => setStaffEdits((p) => p ? { ...p, gestito_da: id } : p)}
                      staff={staffList}
                      placeholder="Seleziona membro staff..."
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Inserisci me"
                    onClick={() => setStaffEdits((p) => p ? { ...p, gestito_da: user.id } : p)}
                  >
                    <UserCheck className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Consegnatario */}
              <div className="space-y-1">
                <Label>Consegnatario</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <StaffCombobox
                      value={staffEdits.consegnatario}
                      onChange={(id) => setStaffEdits((p) => p ? { ...p, consegnatario: id } : p)}
                      staff={staffList}
                      placeholder="Seleziona consegnatario..."
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Inserisci me"
                    onClick={() => setStaffEdits((p) => p ? { ...p, consegnatario: user.id } : p)}
                  >
                    <UserCheck className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Data consegna */}
              <div className="space-y-1">
                <Label>Data di consegna</Label>
                <Input
                  type="date"
                  value={staffEdits.data_consegna}
                  onChange={(e) => setStaffEdits((p) => p ? { ...p, data_consegna: e.target.value } : p)}
                />
              </div>

              {/* is_pagato */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_pagato"
                  checked={staffEdits.is_pagato}
                  onCheckedChange={(v) => setStaffEdits((p) => p ? { ...p, is_pagato: !!v } : p)}
                />
                <Label htmlFor="is_pagato">Pagato</Label>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <Label>Note</Label>
                <Textarea
                  rows={3}
                  value={staffEdits.notes}
                  onChange={(e) => setStaffEdits((p) => p ? { ...p, notes: e.target.value } : p)}
                />
              </div>

              <Button onClick={handleStaffSave} disabled={updateOrdine.isPending} className="w-full">
                {updateOrdine.isPending ? "Salvataggio…" : "Salva"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Client edit dialog ────────────────────────────────────────────── */}
      <Dialog
        open={!isStaff && !!clientEditOrdine}
        onOpenChange={(open) => { if (!open) { setClientEditOrdine(null); setClientQuantities({}); setClientNotes(""); } }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Modifica Ordine — {clientEditOrdine && formatNumeroOrdine(clientEditOrdine.numero_ordine)}
            </DialogTitle>
          </DialogHeader>
          {clientEditOrdine && (
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Prodotti</Label>
                {clientEditOrdine.voci_ordine.map((v) => {
                  const qty = clientQuantities[v.id] ?? v.quantita;
                  return (
                    <div key={v.id} className="mb-2 flex items-center gap-2">
                      <span className={cn("flex-1 text-sm text-muted-foreground", qty === 0 && "line-through")}>
                        {v.articoli?.nome ?? v.articolo_id}
                        {v.prezzo_applicato > 0 && ` (€${v.prezzo_applicato})`}
                      </span>
                      <Input
                        type="number"
                        min={0}
                        className="w-20"
                        value={qty}
                        onChange={(e) => setClientQuantities((p) => ({
                          ...p,
                          [v.id]: Math.max(0, parseInt(e.target.value) || 0),
                        }))}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="space-y-1">
                <Label>Aggiungi nota</Label>
                <Textarea
                  rows={2}
                  placeholder="Scrivi una nota..."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                />
              </div>
              <Button
                onClick={handleClientSave}
                disabled={updateVoce.isPending || appendNote.isPending}
                className="w-full"
              >
                {(updateVoce.isPending || appendNote.isPending) ? "Salvataggio…" : "Salva"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm dialog ─────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare l&apos;ordine?</AlertDialogTitle>
            <AlertDialogDescription>
              Stai per eliminare l&apos;ordine{" "}
              <strong>{deleteTarget && formatNumeroOrdine(deleteTarget.numero_ordine)}</strong>.
              Questa azione è irreversibile e rimuoverà anche tutti i prodotti associati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteOrdine.isPending ? "Eliminazione…" : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
