import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profilo } from "@/lib/types";

export type StaffMember = Pick<Profilo, "id" | "nome" | "azienda">;

export function useStaff() {
  return useQuery<StaffMember[]>({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profili")
        .select("id, nome, azienda")
        .eq("ruolo", "staff")
        .order("nome");
      if (error) throw new Error(error.message);
      return data as StaffMember[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
