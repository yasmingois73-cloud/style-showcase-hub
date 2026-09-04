import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { checkAdminPassword, deleteProductFn, listProducts, saveProductFn } from "@/lib/shop.functions";


export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  sizes: string[];
  colors: string[];
  position?: number;
};

export function productImages(product: Product) {
  const extra = (product.images ?? []).map((s) => s.trim()).filter(Boolean);
  return [product.image, ...extra.filter((u) => u !== product.image)].filter(Boolean);
}

export type CartItem = { id: string; size: string; color: string; qty: number };

export const WHATSAPP_NUMBER = "5585994514478"; // +55 85 99451-4478

const CART_KEY = "uad:cart:v2";
const ADMIN_KEY = "uad:admin";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error("As fotos ficaram muito pesadas para o navegador. Remova algumas fotos ou envie imagens menores.");
  }
  window.dispatchEvent(new CustomEvent("uad:store"));
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    setValue(read(key, fallback));
    const sync = () => setValue(read(key, fallback));
    window.addEventListener("uad:store", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("uad:store", sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T) => {
      write(key, next);
      setValue(next);
    },
    [key],
  );

  return [value, update] as const;
}

export function productsQueryOptions() {
  return {
    queryKey: ["produtos"],
    queryFn: () => listProducts(),
  };
}

export function useProducts() {
  const queryClient = useQueryClient();
  const { data } = useQuery(productsQueryOptions());
  const products = (data ?? []) as Product[];

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["produtos"] });

  const saveProduct = async (product: Product, password: string) => {
    const position =
      products.find((p) => p.id === product.id)?.position ?? (products.at(-1)?.position ?? 0) + 1;
    await saveProductFn({ data: { password, product: { ...product, images: product.images ?? [], position } } });
    await refresh();
  };

  const removeProduct = async (id: string, password: string) => {
    await deleteProductFn({ data: { password, id } });
    await refresh();
  };

  return { products, saveProduct, removeProduct, refresh };
}

export function useCart() {
  const [items, setItems] = useStored<CartItem[]>(CART_KEY, []);

  const same = (i: CartItem, id: string, size: string, color: string) =>
    i.id === id && i.size === size && i.color === color;

  const add = (id: string, size: string, color: string, qty = 1) => {
    const found = items.find((i) => same(i, id, size, color));
    setItems(
      found
        ? items.map((i) => (same(i, id, size, color) ? { ...i, qty: i.qty + qty } : i))
        : [...items, { id, size, color, qty }],
    );
  };

  const setQty = (id: string, size: string, color: string, qty: number) =>
    setItems(
      qty <= 0
        ? items.filter((i) => !same(i, id, size, color))
        : items.map((i) => (same(i, id, size, color) ? { ...i, qty } : i)),
    );

  const remove = (id: string, size: string, color: string) => setItems(items.filter((i) => !same(i, id, size, color)));

  const clear = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return { items, add, setQty, remove, clear, count };
}

export function useAdminSession() {
  const [token, setToken] = useStored<string>(ADMIN_KEY, "");
  return {
    password: token,
    isAdmin: token.length > 0,
    login: async (password: string) => {
      const { ok } = await checkAdminPassword({ data: { password } });
      if (!ok) return false;
      setToken(password);
      return true;
    },
    logout: () => setToken(""),
  };
}

export const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const COLOR_HEX: Record<string, string> = {
  preto: "#1c1c1c",
  branco: "#f5f3ee",
  cru: "#e8dfcf",
  bege: "#d8c3a5",
  marinho: "#1f2c4c",
  bordô: "#5d1a2b",
  marrom: "#6b4a34",
};

export function colorSwatch(name: string) {
  return COLOR_HEX[name.trim().toLowerCase()] ?? "#c9c9c9";
}
