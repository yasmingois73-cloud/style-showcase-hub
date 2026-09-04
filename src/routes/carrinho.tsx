import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brl, colorSwatch, useCart, useProducts, WHATSAPP_NUMBER } from "@/lib/shop";
import { createOrderFn } from "@/lib/shop.functions";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Sacola | use ana dom" },
      { name: "description", content: "Revise as peças escolhidas e finalize seu pedido pelo WhatsApp." },
      { property: "og:title", content: "Sacola | use ana dom" },
      { property: "og:description", content: "Revise suas peças e finalize o pedido pelo WhatsApp." },
    ],
  }),
  component: CartPage,
});

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(80),
  phone: z.string().trim().min(8, "Informe um telefone válido").max(20),
  address: z.string().trim().min(5, "Informe o endereço de entrega").max(200),
  notes: z.string().trim().max(300).optional(),
});

function CartPage() {
  const { items, setQty, remove, clear } = useCart();
  const { products } = useProducts();
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });

  const lines = items
    .map((i) => ({ ...i, product: products.find((p) => p.id === i.id) }))
    .filter((l) => l.product);

  const total = lines.reduce((sum, l) => sum + (l.product?.price ?? 0) * l.qty, 0);

  const submit = () => {
    if (lines.length === 0) {
      toast.error("Sua sacola está vazia.");
      return;
    }
    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Confira os dados.");
      return;
    }

    const d = parsed.data;
    const text = [
      "Olá! Quero fazer um pedido na use ana dom:",
      "",
      ...lines.map((l) => `• ${l.product!.name} — tam ${l.size}${l.color ? ` · cor ${l.color}` : ""} × ${l.qty} — ${brl(l.product!.price * l.qty)}`),
      "",
      `Total: ${brl(total)}`,
      "",
      `Nome: ${d.name}`,
      `Telefone: ${d.phone}`,
      `Endereço: ${d.address}`,
      d.notes ? `Observações: ${d.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    void createOrderFn({
      data: {
        customer_name: d.name,
        phone: d.phone,
        address: d.address,
        notes: d.notes ?? "",
        total,
        items: lines.map((l) => ({
          id: l.id,
          name: l.product!.name,
          size: l.size,
          color: l.color,
          qty: l.qty,
          price: l.product!.price,
        })),
      },
    }).catch(() => undefined);

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    toast.success("Pedido enviado para o WhatsApp!");
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="font-display text-4xl text-foreground">Sua sacola</h1>

        {lines.length === 0 ? (
          <div className="mt-10 rounded-lg border border-border p-10 text-center">
            <p className="text-muted-foreground">Sua sacola está vazia.</p>
            <Button asChild variant="soft" className="mt-5">
              <Link to="/">Ver coleção</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            <ul className="space-y-5">
              {lines.map((l) => (
                <li key={`${l.id}-${l.size}-${l.color}`} className="flex gap-4 border-b border-border pb-5">
                  <img
                    src={l.product!.image}
                    alt={l.product!.name}
                    loading="lazy"
                    className="h-28 w-24 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="font-display text-lg text-foreground">{l.product!.name}</h2>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      Tamanho {l.size}
                      {l.color && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="flex items-center gap-1.5">
                            <span
                              className="h-3 w-3 rounded-full border border-border"
                              style={{ backgroundColor: colorSwatch(l.color) }}
                            />
                            {l.color}
                          </span>
                        </>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-foreground">{brl(l.product!.price)}</p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-border">
                        <button className="px-2.5 py-1" onClick={() => setQty(l.id, l.size, l.color, l.qty - 1)}>
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm">{l.qty}</span>
                        <button className="px-2.5 py-1" onClick={() => setQty(l.id, l.size, l.color, l.qty + 1)}>
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        onClick={() => remove(l.id, l.size, l.color)}
                        aria-label="Remover item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              <li className="flex justify-between text-lg">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-2xl text-foreground">{brl(total)}</span>
              </li>
            </ul>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-2xl text-foreground">Seus dados</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    maxLength={80}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input
                    id="phone"
                    maxLength={20}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Endereço de entrega</Label>
                  <Input
                    id="address"
                    maxLength={200}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    maxLength={300}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
                <Button variant="hero" className="w-full" onClick={submit}>
                  Finalizar pelo WhatsApp
                </Button>
                <button className="w-full text-xs text-muted-foreground hover:text-foreground" onClick={clear}>
                  Esvaziar sacola
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
