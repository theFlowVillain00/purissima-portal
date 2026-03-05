// ─── Raw DB row types ───────────────────────────────────────────────────────

export interface Profilo {
  id: string;
  nome: string;
  azienda: string;
  is_public: boolean;
  contatto: string;
  ruolo: "cliente" | "staff";
  created_at: string;
}

export interface Articolo {
  id: string;
  nome: string;
  descrizione: string | null;
  attivo: boolean;
  prezzo_pubblico: number | null;
  prezzo_privato: number | null;
}

export interface Ordine {
  id: string;
  numero_ordine: number;
  data: string;
  creato_da: string;
  gestito_da: string | null;
  is_consegnato: boolean;
  consegnatario: string | null;
  data_consegna: string | null;
  is_pagato: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoceOrdine {
  id: string;
  ordine_id: string;
  articolo_id: string;
  quantita: number;
  prezzo_applicato: number;
}

// ─── Joined types used by the UI ────────────────────────────────────────────

/** Line item with the article name joined in */
export interface VoceConArticolo extends VoceOrdine {
  articoli: Pick<Articolo, "id" | "nome"> | null;
}

/**
 * The shape returned by the `ordini_con_totale` view with all useful joins.
 * Profile names are flat columns in the view — no PostgREST FK traversal needed.
 * Always fetch from this view, never from `ordini` directly.
 * creato_da_* fields are nullable because old orders may reference deleted users.
 */
export interface OrdineConDettagli extends Ordine {
  totale: number;
  creato_da_nome: string | null;
  creato_da_azienda: string | null;
  creato_da_contatto: string | null;
  gestito_da_profilo_id: string | null;
  gestito_da_nome: string | null;
  consegnatario_profilo_id: string | null;
  consegnatario_nome: string | null;
  voci_ordine: VoceConArticolo[];
}

// ─── Supabase Database helper type ──────────────────────────────────────────
// Typed enough for createClient<Database> to give us autocomplete on .from().

export type Database = {
  public: {
    Tables: {
      profili: { Row: Profilo; Insert: Omit<Profilo, "created_at">; Update: Partial<Omit<Profilo, "id" | "created_at">> };
      articoli: { Row: Articolo; Insert: Omit<Articolo, "id">; Update: Partial<Omit<Articolo, "id">> };
      ordini: { Row: Ordine; Insert: Omit<Ordine, "id" | "numero_ordine" | "created_at" | "updated_at">; Update: Partial<Omit<Ordine, "id" | "numero_ordine" | "created_at" | "updated_at">> };
      voci_ordine: { Row: VoceOrdine; Insert: Omit<VoceOrdine, "id">; Update: Partial<Omit<VoceOrdine, "id">> };
    };
    Views: {
      ordini_con_totale: { Row: OrdineConDettagli };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// ─── Derived helpers used across the UI ─────────────────────────────────────

/** Status string derived from DB fields. 4-state: In attesa → In lavorazione → Consegnato → Completato */
export function computeStato(
  ordine: Pick<Ordine, "gestito_da" | "is_pagato" | "consegnatario">
): string {
  if (ordine.is_pagato) return "Completato";
  if (ordine.consegnatario !== null) return "Consegnato";
  if (ordine.gestito_da !== null) return "In lavorazione";
  return "In attesa";
}

/** Returns true if the order can still be edited by the client. */
export function isEditableByClient(ordine: Pick<Ordine, "gestito_da">): boolean {
  return ordine.gestito_da === null;
}

/** Formats the display ID shown to users: "#42" from numero_ordine. */
export function formatNumeroOrdine(n: number): string {
  return `#${String(n).padStart(3, "0")}`;
}
