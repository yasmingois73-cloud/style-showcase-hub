CREATE TABLE public.produtos (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  image text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  sizes text[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.produtos TO anon, authenticated;
GRANT ALL ON public.produtos TO service_role;

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produtos visiveis para todos" ON public.produtos FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'novo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.pedidos TO service_role;

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON public.produtos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.produtos (id, name, price, image, images, category, description, sizes, colors, position) VALUES
('conjunto-dom-short', 'Conjunto Dom — Blusa + Short', 109.90, '', '{}', 'Conjuntos', 'Combinação moderna e chique: blusa peplum com decote V e short de cintura alta.', '{"P","M"}', '{"Preto","Bordô","Cru","Marinho"}', 1),
('conjunto-dom-calca', 'Conjunto Dom — Blusa + Calça', 119.90, '', '{}', 'Conjuntos', 'Elegância do dia à noite: blusa peplum com calça de alfaiataria no mesmo tecido.', '{"P","M"}', '{"Marinho","Bordô","Cru"}', 2),
('blusa-dom', 'Blusa Dom', 59.90, '', '{}', 'Blusas', 'Peplum com decote transpassado e amarração. Disponível em preto, bordô, cru e marinho.', '{"P","M"}', '{"Preto","Bordô","Cru","Marinho"}', 3),
('short-dom', 'Short Dom', 59.90, '', '{}', 'Shorts', 'Cintura alta e caimento confortável — combina perfeito com a Blusa Dom.', '{"P","M"}', '{"Preto","Bordô","Cru","Marinho"}', 4),
('calca-dom', 'Calça Dom', 69.90, '', '{}', 'Calças', 'Alfaiataria leve com amarração. Nas cores marinho, bordô e cru.', '{"P","M"}', '{"Marinho","Bordô","Cru"}', 5),
('blusa-nathy', 'Blusa Nathy', 44.90, '', '{}', 'Blusas', 'A mais querida: estilo e conforto em alcinha canelada. Vários tons disponíveis.', '{"P","M"}', '{"Preto","Branco","Bege","Marinho"}', 6),
('short-ana', 'Short Ana', 59.90, '', '{}', 'Shorts', 'Cintura alta com passantes para cinto. Nas cores marrom, branco e preto.', '{"PP","P","M"}', '{"Marrom","Branco","Preto"}', 7);