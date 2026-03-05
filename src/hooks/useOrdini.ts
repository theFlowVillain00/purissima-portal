import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { OrdineConDettagli, VoceOrdine } from "@/lib/types";

// ─── The main select string — always use ordini_con_totale ──────────────────
// Profile names are flat columns on the view (creato_da_nome, etc.) — no FK
// traversal to profili needed, which avoids PostgREST disambiguation issues
// with multiple FKs from ordini to the same table.
const ORDINE_SELECT = `
  *,
  voci_ordine (
    id,
    ordine_id,
    articolo_id,
    quantita,
    prezzo_applicato,
    articoli ( id, nome )
  )
` as const;

async function fetchOrdini(): Promise<OrdineConDettagli[]> {
  const { data, error } = await supabase
    .from("ordini_con_totale")
    .select(ORDINE_SELECT)
    .order("numero_ordine", { ascending: false });
  if (error) throw new Error(error.message);
  return data as OrdineConDettagli[];
}

export function useOrdini() {
  return useQuery({
    queryKey: ["ordini"],
    queryFn: fetchOrdini,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/** Staff: update order header fields */
export function useUpdateOrdine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        gestito_da?: string | null;
        consegnatario?: string | null;
        data_consegna?: string | null;
        is_consegnato?: boolean;
        is_pagato?: boolean;
        notes?: string | null;
      };
    }) => {
      const { error } = await supabase
        .from("ordini")
        .update(updates)
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ordini"] }),
  });
}

/** Client: append text to notes (while gestito_da IS NULL) */
export function useAppendNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      currentNotes,
      newNote,
    }: {
      id: string;
      currentNotes: string | null;
      newNote: string;
    }) => {
      const merged = currentNotes ? `${currentNotes}\n${newNote}` : newNote;
      const { error } = await supabase
        .from("ordini")
        .update({ notes: merged })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ordini"] }),
  });
}

/** Client: update a single voci_ordine row quantity (while gestito_da IS NULL) */
export function useUpdateVoce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantita }: Pick<VoceOrdine, "id" | "quantita">) => {
      const { error } = await supabase
        .from("voci_ordine")
        .update({ quantita })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ordini"] }),
  });
}

/** Staff: delete an order (CASCADE removes voci_ordine) */
export function useDeleteOrdine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ordini")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ordini"] }),
  });
}

/** Create a new order (two-step: header then line items) */
export function useCreateOrdine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      creatoDa,
      cart,
    }: {
      creatoDa: string;
      cart: Array<{ articolo_id: string; quantita: number }>;
    }) => {
      // Step 1 — order header
      const { data: ordine, error: ordineErr } = await supabase
        .from("ordini")
        .insert({ creato_da: creatoDa })
        .select("id")
        .single();
      if (ordineErr || !ordine) throw new Error(ordineErr?.message ?? "Errore creazione ordine");

      // Step 2 — line items (prezzo_applicato = 0, trigger overwrites it)
      const voci = cart.map((item) => ({
        ordine_id: ordine.id,
        articolo_id: item.articolo_id,
        quantita: item.quantita,
        prezzo_applicato: 0,
      }));
      const { error: vociErr } = await supabase.from("voci_ordine").insert(voci);
      if (vociErr) throw new Error(vociErr.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ordini"] }),
  });
}
