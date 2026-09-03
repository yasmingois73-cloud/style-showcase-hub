import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

import heroAsset from "@/assets/hero-catalogo.jpg.asset.json";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { brl, colorSwatch, productImages, useCart, useProducts, type Product } from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "use ana dom | Loja de roupas femininas" },
      {
        name: "description",
        content:
          "Peças que acompanham o seu ritmo: tops, calças, camisas e praia. Monte seu carrinho e finalize pelo WhatsApp.",
      },
      { property: "og:title", content: "use ana dom | Loja de roupas femininas" },
      {
        property: "og:description",
        content: "Clothing & lifestyle — peças que acompanham o seu ritmo, em todas as versões de você.",
      },
    ],
  }),
  component: Home,
});

function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState(product.sizes[0] ?? "Único");
  const colors = product.colors ?? [];
  const [color, setColor] = useState(colors[0] ?? "Única");
  const gallery = productImages(product);
  const [photo, setPhoto] = useState(0);
  const current = Math.min(photo, gallery.length - 1);
  const go = (dir: number) => setPhoto((i) => (i + dir + gallery.length) % gallery.length);

  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-lg bg-secondary">
        <img
          src={gallery[current]}
          alt={`${product.name} — foto ${current + 1}`}
          loading="lazy"
          className="aspect-[9/11] w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {gallery.length > 1 && (
          <>
            <button
              aria-label="Foto anterior"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Próxima foto"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  aria-label={`Ver foto ${i + 1}`}
                  onClick={() => setPhoto(i)}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === current ? "bg-foreground" : "bg-foreground/30"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {gallery.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setPhoto(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`h-14 w-12 shrink-0 overflow-hidden rounded border transition-colors ${
                i === current ? "border-foreground" : "border-border"
              }`}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="mt-4 space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{product.category}</p>
        <h3 className="font-display text-xl text-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.description}</p>
        <p className="text-base text-foreground">{brl(product.price)}</p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {product.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                size === s
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {colors.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`Cor ${c}`}
                title={c}
                className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs transition-colors ${
                  color === c ? "border-foreground text-foreground" : "border-border text-muted-foreground hover:border-foreground"
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-border"
                  style={{ backgroundColor: colorSwatch(c) }}
                />
                {c}
              </button>
            ))}
          </div>
        )}

        <Button
          variant="soft"
          className="mt-3 w-full"
          onClick={() => {
            add(product.id, size, color);
            toast.success(`${product.name} (${size} · ${color}) adicionado à sacola`);
          }}
        >
          Adicionar à sacola
        </Button>
      </div>
    </article>
  );
}

function Home() {
  const { products } = useProducts();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">clothing &amp; lifestyle</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] text-foreground md:text-6xl">
            Peças que acompanham o seu ritmo
          </h1>
          <p className="mt-5 max-w-md text-muted-foreground">
            Em todas as versões de você. Escolha suas favoritas, monte a sacola e finalize o pedido direto no
            WhatsApp.
          </p>
          <Button asChild variant="hero" size="lg" className="mt-8">
            <a href="#colecao">Ver coleção</a>
          </Button>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-2xl bg-[image:var(--gradient-sun)] opacity-70 blur-xl" />
          <img
            src={heroAsset.url}
            alt="Modelos usando o Conjunto Dom em bordô da use ana dom"
            width={941}
            height={1672}
            className="relative aspect-[7/8] w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section id="colecao" className="mx-auto max-w-6xl px-5 pt-6">
        <h2 className="font-display text-3xl text-foreground">Coleção</h2>
        <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {products.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">Nenhuma peça cadastrada ainda.</p>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
