import { useCallback, useEffect, useState } from "react";

import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";

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

const PRODUCTS_KEY = "uad:products";
const CART_KEY = "uad:cart";
const ADMIN_KEY = "uad:admin";

export const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Blusa Canelada Oliva",
    price: 89.9,
    image: p1,
    category: "Tops",
    description: "Canelado macio de caimento perfeito, para usar em todas as versões de você.",
    sizes: ["P", "M", "G"],
  },
  {
    id: "2",
    name: "Calça Pantalona Caramelo",
    price: 179.9,
    image: p2,
    category: "Calças",
    description: "Linho leve, cintura alta e pernas amplas — conforto com atitude.",
    sizes: ["36", "38", "40", "42"],
  },
  {
    id: "3",
    name: "Body Maiô Preto",
    price: 149.9,
    image: p3,
    category: "Praia",
    description: "Clássico atemporal em tecido de alta compressão.",
    sizes: ["P", "M", "G"],
  },
  {
    id: "4",
    name: "Camisa Oversized Cru",
    price: 199.9,
    image: p4,
    category: "Camisas",
    description: "Alfaiataria relaxada em linho misto, para o dia inteiro.",
    sizes: ["Único"],
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
