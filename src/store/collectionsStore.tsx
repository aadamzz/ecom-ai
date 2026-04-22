"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode, type ReactElement } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/store/authStore";

export interface Collection {
  id: string;
  name: string;
  productIds: string[];
  createdAt: number;
}

interface CollectionsContextValue {
  collections: Collection[];
  saveCollection: (name: string, productIds: string[]) => Promise<void>;
  removeCollection: (id: string) => Promise<void>;
}

const CollectionsContext = createContext<CollectionsContextValue>({
  collections: [],
  saveCollection: async () => {},
  removeCollection: async () => {},
});

export function CollectionsProvider({ children }: { children: ReactNode }): ReactElement {
  const [collections, setCollections] = useState<Collection[]>([]);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setCollections([]);
      return;
    }
    supabase
      .from("collections")
      .select("id, name, product_ids, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setCollections(
            data.map((r) => ({
              id: r.id,
              name: r.name,
              productIds: r.product_ids ?? [],
              createdAt: new Date(r.created_at).getTime(),
            }))
          );
        }
      });
  }, [user]);

  const saveCollection = useCallback(
    async (name: string, productIds: string[]) => {
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }
      const { data, error } = await supabase
        .from("collections")
        .insert({ user_id: user.id, name, product_ids: productIds })
        .select("id, name, product_ids, created_at")
        .single();
      if (!error && data) {
        setCollections((prev) => [
          {
            id: data.id,
            name: data.name,
            productIds: data.product_ids ?? [],
            createdAt: new Date(data.created_at).getTime(),
          },
          ...prev,
        ]);
      }
    },
    [user]
  );

  const removeCollection = useCallback(
    async (id: string) => {
      if (!user) return;
      await supabase.from("collections").delete().eq("id", id).eq("user_id", user.id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
    },
    [user]
  );

  return (
    <CollectionsContext.Provider value={{ collections, saveCollection, removeCollection }}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  return useContext(CollectionsContext);
}
