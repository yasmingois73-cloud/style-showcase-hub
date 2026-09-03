import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fileToCompressedDataUrl } from "@/lib/image-upload";
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

const emptyForm = {
  id: "",
  name: "",
  price: "",
  image: "",
  images: "",
  category: "",
  description: "",
  sizes: "",
  colors: "",
};

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
      images: (p.images ?? []).join("\n"),
      category: p.category,
      description: p.description,
      sizes: p.sizes.join(", "),
      colors: (p.colors ?? []).join(", "),
    });

  const save = () => {
    if (form.name.trim().length < 2) {
      toast.error("Informe o nome da peça");
      return;
    }
    const price = Number(form.price.replace(",", "."));
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Informe um preço válido");
      return;
    }

    try {
      saveProduct({
      id: form.id || crypto.randomUUID(),
      name: form.name.trim().slice(0, 80),
      price,
      image: form.image.trim() || "https://placehold.co/900x1100?text=Sem+foto",
      images: form.images
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10),
      category: form.category.trim().slice(0, 40) || "Geral",
      description: form.description.trim().slice(0, 300),
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8) || ["Único"],
      colors: form.colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .slice(0, 12),
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
                <Label htmlFor="image">Foto principal</Label>
                <Input
                  id="image"
                  placeholder="Cole um link https://... ou envie a foto abaixo"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
                <div className="mt-2 flex items-center gap-3">
                  <label className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs text-foreground hover:border-foreground">
                    Enviar foto do celular
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        try {
                          const url = await fileToCompressedDataUrl(file);
                          setForm((f) => ({ ...f, image: url }));
                          toast.success("Foto principal carregada");
                        } catch {
                          toast.error("Não consegui carregar essa foto");
                        }
                      }}
                    />
                  </label>
                  {form.image && (
                    <img src={form.image} alt="Prévia" className="h-14 w-12 rounded object-cover" />
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="images">Mais fotos (galeria)</Label>
                <Textarea
                  id="images"
                  rows={3}
                  placeholder={"https://foto2.jpg\nhttps://foto3.jpg"}
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                />
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs text-foreground hover:border-foreground">
                    Enviar mais fotos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files ?? []);
                        e.target.value = "";
                        if (files.length === 0) return;
                        try {
                          const urls = await Promise.all(files.map((f) => fileToCompressedDataUrl(f)));
                          setForm((f) => ({
                            ...f,
                            images: [f.images.trim(), ...urls].filter(Boolean).join("\n"),
                          }));
                          toast.success(`${urls.length} foto(s) adicionada(s)`);
                        } catch {
                          toast.error("Não consegui carregar essas fotos");
                        }
                      }}
                    />
                  </label>
                  {form.images
                    .split(/[\n,]/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((src, i) => (
                      <img key={i} src={src} alt="" className="h-14 w-12 rounded object-cover" />
                    ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Aparecem como galeria na vitrine, estilo Instagram. Você pode enviar fotos direto do
                  celular ou colar links.
                </p>
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
                <Label htmlFor="colors">Cores disponíveis (separadas por vírgula)</Label>
                <Input
                  id="colors"
                  placeholder="Preto, Bordô, Cru"
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
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
