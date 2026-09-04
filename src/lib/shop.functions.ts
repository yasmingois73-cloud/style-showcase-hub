import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_PASSWORD = "anadom2026"; // senha simples da área de admin

const productSchema = z.object({
  id: z.string().trim().min(1).max(60),
  name: z.string().trim().min(2).max(80),
  price: z.number().positive().max(100000),
  image: z.string().trim().max(3_000_000),
  images: z.array(z.string().trim().max(3_000_000)).max(10).default([]),
  category: z.string().trim().max(40).default("Geral"),
  description: z.string().trim().max(300).default(""),
  sizes: z.array(z.string().trim().max(10)).max(8).default([]),
  colors: z.array(z.string().trim().max(20)).max(12).default([]),
  position: z.number().int().min(0).max(100000).default(0),
});

export type ProductRow = z.infer<typeof productSchema>;

function requireAdmin(password: string) {
  if (password !== ADMIN_PASSWORD) throw new Error("Senha incorreta");
}

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("produtos")
    .select("id, name, price, image, images, category, description, sizes, colors, position")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((p) => ({ ...p, price: Number(p.price) }));
});

export const saveProductFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ password: z.string(), product: productSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("produtos").upsert({ ...data.product });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ password: z.string(), id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("produtos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkAdminPassword = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ password: z.string() }).parse(input))
  .handler(async ({ data }) => ({ ok: data.password === ADMIN_PASSWORD }));

const orderSchema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(20),
  address: z.string().trim().max(200).default(""),
  notes: z.string().trim().max(300).default(""),
  total: z.number().nonnegative(),
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        size: z.string(),
        color: z.string(),
        qty: z.number().int().positive(),
        price: z.number().nonnegative(),
      }),
    )
    .max(50),
});

export const createOrderFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("pedidos").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listOrdersFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ password: z.string() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("pedidos")
      .select("id, customer_name, phone, address, notes, items, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
