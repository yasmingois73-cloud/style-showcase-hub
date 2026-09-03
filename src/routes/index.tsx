import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import heroImg from "@/assets/hero.jpg";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { brl, useCart, useProducts, type Product } from "@/lib/shop";

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

  return (
    <article className="group">
      <div className="overflow-hidden rounded-lg bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="aspect-[9/11] w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
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

        <Button
          variant="soft"
          className="mt-3 w-full"
          onClick={() => {
            add(product.id, size);
            toast.success(`${product.name} (${size}) adicionado à sacola`);
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
            src={heroImg}
            alt="Modelo usando blusa canelada oliva e calça caramelo"
            width={1400}
            height={1600}
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
