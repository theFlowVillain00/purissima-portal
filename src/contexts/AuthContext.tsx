import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Profilo } from "@/lib/types";

export type UserRole = "staff" | "cliente";

export interface AppUser {
  id: string;
  nome: string;
  role: UserRole;
  isPublic: boolean;
  azienda: string;
  contatto: string;
}

export interface LoginResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

function profiloToAppUser(profilo: Profilo): AppUser {
  return {
    id: profilo.id,
    nome: profilo.nome,
    role: profilo.ruolo,
    isPublic: profilo.is_public,
    azienda: profilo.azienda,
    contatto: profilo.contatto,
  };
}

// Fetch the profilo row using a raw fetch with the token we already have from
// the session object. This intentionally bypasses the supabase-js client so we
// never try to acquire the auth lock — the lock is already held/being contested
// inside onAuthStateChange, and calling supabase.from() there would immediately
// trigger an AbortError.
async function fetchProfiloWithToken(
  userId: string,
  accessToken: string
): Promise<Profilo | null> {
  const url =
    `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profili` +
    `?id=eq.${userId}&select=*&limit=1`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      console.error("fetchProfilo HTTP error:", res.status, await res.text());
      return null;
    }
    const rows = (await res.json()) as Profilo[];
    return rows[0] ?? null;
  } catch (err) {
    console.error("fetchProfilo network error:", err);
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setLoading(true);
          // Use the access_token directly from the session — no lock contention.
          const profilo = await fetchProfiloWithToken(
            session.user.id,
            session.access_token
          );
          setUser(profilo ? profiloToAppUser(profilo) : null);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    const email = `${username}@purissima.com`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      console.error("[auth] signInWithPassword error:", error?.message);
      return { ok: false, error: error?.message ?? "Errore sconosciuto" };
    }
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
