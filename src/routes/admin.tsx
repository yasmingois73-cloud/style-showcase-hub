import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brl, useAdminSession, useProducts, type Product } from "@/lib/shop";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Área do administrador | use ana dom" },
      { name: "description", content: "Cadastre, edite e remova as peças da loja use ana dom." },
      { property: "og:title", content: "Área do administrador | use ana dom" },
      { property: "og:description", content: "Gerencie o catálogo da loja." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const emptyForm = { id: "", name: "", price: "", image: "", category: "", description: "", sizes: "" };

function AdminPage() {
  const { isAdmin, login, logout } = useAdminSession();
  const { products, saveProduct, removeProduct, resetProducts } = useProducts();
  const [password, setPassword] = useState("");
  const [form, setForm] = useState(emptyForm);

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-sm px-5 py-24">
          <h1 className="font-display text-3xl text-foreground">Área do administrador</h1>
          <p className="mt-2 text-sm text-muted-foreground">Entre com a senha para gerenciar as peças.</p>
          <div className="mt-6 space-y-3">
            <Label htmlFor="pw">Senha</Label>
            <Input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (login(password) || toast.error("Senha incorreta"))}
            />
            <Button
              variant="hero"
              className="w-full"
              onClick={() => (login(password) ? toast.success("Bem-vinda!") : toast.error("Senha incorreta"))}
            >
              Entrar
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const edit = (p: Product) =>
    setForm({
      id: p.id,
      name: p.name,
      price: String(p.price),
      image: p.image,
      category: p.category,
      description: p.description,
      sizes: p.sizes.join(", "),
    });

  const save = () => {
    if (form.name.trim().length < 2) return toast.error("Informe o nome da peça");
    const price = Number(form.price.replace(",", "."));
    if (!Number.isFinite(price) || price <= 0) return toast.error("Informe um preço válido");

    saveProduct({
      id: form.id || crypto.randomUUID(),
      name: form.name.trim().slice(0, 80),
      price,
      image: form.image.trim() || "https://placehold.co/900x1100?text=Sem+foto",
      category: form.category.trim().slice(0, 40) || "Geral",
      description: form.description.trim().slice(0, 300),
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8) || ["Único"],
    });
    setForm(emptyForm);
    toast.success("Peça salva!");
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-5 py-12">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl text-foreground">Painel de peças</h1>
          <Button variant="ghost" onClick={logout}>
            Sair
          </Button>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl text-foreground">
              {form.id ? "Editar peça" : "Nova peça"}
            </h2>
            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="image">Link da foto</Label>
                <Input
                  id="image"
                  placeholder="https://..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sizes">Tamanhos (separados por vírgula)</Label>
                <Input
                  id="sizes"
                  placeholder="P, M, G"
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="hero" className="flex-1" onClick={save}>
                  Salvar peça
                </Button>
                {form.id && (
                  <Button variant="outline" onClick={() => setForm(emptyForm)}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-foreground">Peças cadastradas</h2>
              <button className="text-xs text-muted-foreground hover:text-foreground" onClick={resetProducts}>
                Restaurar exemplo
              </button>
            </div>
            <ul className="mt-5 space-y-3">
              {products.map((p) => (
                <li key={p.id} className="flex items-center gap-4 rounded-lg border border-border p-3">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-16 w-14 rounded object-cover" />
                  <div className="flex-1">
                    <p className="font-display text-lg text-foreground">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.category} · {brl(p.price)}
                    </p>
                  </div>
                  <button className="p-2 text-muted-foreground hover:text-foreground" onClick={() => edit(p)}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      removeProduct(p.id);
                      toast.success("Peça removida");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
