import { Link } from "@tanstack/react-router";
import { ShoppingBag, Lock } from "lucide-react";
import { useCart } from "@/lib/shop";

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="font-display text-2xl tracking-[0.18em] text-foreground lowercase">
          useanadom
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          <Link to="/" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block">
            Loja
          </Link>
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Lock className="h-3.5 w-3.5" />
            Admin
          </Link>
          <Link to="/carrinho" className="relative flex items-center gap-2 text-foreground">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 py-10 text-center text-sm text-muted-foreground">
      <p className="font-display text-lg tracking-[0.2em] lowercase text-foreground">useanadom</p>
      <p className="mt-2">clothing &amp; lifestyle — peças que acompanham o seu ritmo.</p>
    </footer>
  );
}
