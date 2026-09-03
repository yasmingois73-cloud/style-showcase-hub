import { useCallback, useEffect, useState } from "react";

import conjuntoShortAsset from "@/assets/conjunto-short.jpg.asset.json";
import conjuntoCalcaAsset from "@/assets/conjunto-calca.jpg.asset.json";
import blusaDomAsset from "@/assets/blusa-dom.jpg.asset.json";
import shortDomAsset from "@/assets/short-dom.jpg.asset.json";
import calcaDomAsset from "@/assets/calca-dom.jpg.asset.json";
import blusaNathyAsset from "@/assets/blusa-nathy.jpg.asset.json";
import shortAnaAsset from "@/assets/short-ana.jpg.asset.json";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  sizes: string[];
};

export type CartItem = { id: string; size: string; qty: number };

export const WHATSAPP_NUMBER = "5511999999999"; // troque pelo seu número
export const ADMIN_PASSWORD = "anadom2026"; // senha simples de demonstração

const PRODUCTS_KEY = "uad:products:v2";
const CART_KEY = "uad:cart";
const ADMIN_KEY = "uad:admin";

export const defaultProducts: Product[] = [
  {
    id: "conjunto-dom-short",
    name: "Conjunto Dom — Blusa + Short",
    price: 109.9,
    image: conjuntoShortAsset.url,
    category: "Conjuntos",
    description: "Combinação moderna e chique: blusa peplum com decote V e short de cintura alta.",
    sizes: ["P", "M"],
  },
  {
    id: "conjunto-dom-calca",
    name: "Conjunto Dom — Blusa + Calça",
    price: 119.9,
    image: conjuntoCalcaAsset.url,
    category: "Conjuntos",
    description: "Elegância do dia à noite: blusa peplum com calça de alfaiataria no mesmo tecido.",
    sizes: ["P", "M"],
  },
  {
    id: "blusa-dom",
    name: "Blusa Dom",
    price: 59.9,
    image: blusaDomAsset.url,
    category: "Blusas",
    description: "Peplum com decote transpassado e amarração. Disponível em preto, bordô, cru e marinho.",
    sizes: ["P", "M"],
  },
  {
    id: "short-dom",
    name: "Short Dom",
    price: 59.9,
    image: shortDomAsset.url,
    category: "Shorts",
    description: "Cintura alta e caimento confortável — combina perfeito com a Blusa Dom.",
    sizes: ["P", "M"],
  },
  {
    id: "calca-dom",
    name: "Calça Dom",
    price: 69.9,
    image: calcaDomAsset.url,
    category: "Calças",
    description: "Alfaiataria leve com amarração. Nas cores marinho, bordô e cru.",
    sizes: ["P", "M"],
  },
  {
    id: "blusa-nathy",
    name: "Blusa Nathy",
    price: 44.9,
    image: blusaNathyAsset.url,
    category: "Blusas",
    description: "A mais querida: estilo e conforto em alcinha canelada. Vários tons disponíveis.",
    sizes: ["P", "M"],
  },
  {
    id: "short-ana",
    name: "Short Ana",
    price: 59.9,
    image: shortAnaAsset.url,
    category: "Shorts",
    description: "Cintura alta com passantes para cinto. Nas cores marrom, branco e preto.",
    sizes: ["PP", "P", "M"],
  },
];

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
  localStorage.setItem(key, JSON.stringify(value));
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

export function useProducts() {
  const [products, setProducts] = useStored<Product[]>(PRODUCTS_KEY, defaultProducts);

  useEffect(() => {
    if (!localStorage.getItem(PRODUCTS_KEY)) write(PRODUCTS_KEY, defaultProducts);
  }, []);

  const saveProduct = (product: Product) => {
    const exists = products.some((p) => p.id === product.id);
    setProducts(exists ? products.map((p) => (p.id === product.id ? product : p)) : [product, ...products]);
  };

  const removeProduct = (id: string) => setProducts(products.filter((p) => p.id !== id));

  const resetProducts = () => setProducts(defaultProducts);

  return { products, saveProduct, removeProduct, resetProducts };
}

export function useCart() {
  const [items, setItems] = useStored<CartItem[]>(CART_KEY, []);

  const add = (id: string, size: string, qty = 1) => {
    const found = items.find((i) => i.id === id && i.size === size);
    setItems(
      found
        ? items.map((i) => (i.id === id && i.size === size ? { ...i, qty: i.qty + qty } : i))
        : [...items, { id, size, qty }],
    );
  };

  const setQty = (id: string, size: string, qty: number) =>
    setItems(
      qty <= 0
        ? items.filter((i) => !(i.id === id && i.size === size))
        : items.map((i) => (i.id === id && i.size === size ? { ...i, qty } : i)),
    );

  const remove = (id: string, size: string) => setItems(items.filter((i) => !(i.id === id && i.size === size)));

  const clear = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return { items, add, setQty, remove, clear, count };
}

export function useAdminSession() {
  const [token, setToken] = useStored<string>(ADMIN_KEY, "");
  return {
    isAdmin: token === ADMIN_PASSWORD,
    login: (password: string) => {
      if (password !== ADMIN_PASSWORD) return false;
      setToken(password);
      return true;
    },
    logout: () => setToken(""),
  };
}

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
