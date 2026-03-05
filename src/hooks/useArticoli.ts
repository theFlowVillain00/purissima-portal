import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Articolo } from "@/lib/types";

async function fetchArticoli(): Promise<Articolo[]> {
  const { data, error } = await supabase
    .from("articoli")
    .select("*")
    .eq("attivo", true)
    .order("nome");
  if (error) throw new Error(error.message);
  return data as Articolo[];
}

export function useArticoli() {
  return useQuery({
    queryKey: ["articoli"],
    queryFn: fetchArticoli,
  });
}
