-- 상품 마스터 + 픽업 장소별 가용 재고

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  unit_label TEXT NOT NULL DEFAULT '박스',
  unit_price_krw BIGINT NOT NULL DEFAULT 0 CHECK (unit_price_krw >= 0),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_active_sort ON public.products (is_active, sort_order);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.pickup_product_stock (
  pickup_location_id UUID NOT NULL REFERENCES public.pickup_locations (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  quantity_available INT NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pickup_location_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_pickup_product_stock_product ON public.pickup_product_stock (product_id);

CREATE TRIGGER pickup_product_stock_updated_at
  BEFORE UPDATE ON public.pickup_product_stock
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products (id) ON DELETE SET NULL;

ALTER TABLE public.inventory_alerts
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products (id) ON DELETE SET NULL;

ALTER TABLE public.inventory_alerts
  ADD COLUMN IF NOT EXISTS pickup_location_id UUID REFERENCES public.pickup_locations (id) ON DELETE SET NULL;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_product_stock ENABLE ROW LEVEL SECURITY;

-- 상품: 스태프 전체 / 공개는 판매중만
CREATE POLICY "products_staff_all"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "products_select_public_active"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- 픽업별 재고: 스태프 전체 / 공개는 활성 상품·장소만
CREATE POLICY "pickup_product_stock_staff_all"
  ON public.pickup_product_stock FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "pickup_product_stock_public_read"
  ON public.pickup_product_stock FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = pickup_product_stock.product_id AND p.is_active
    )
    AND EXISTS (
      SELECT 1 FROM public.pickup_locations pl
      WHERE pl.id = pickup_product_stock.pickup_location_id AND pl.is_active
    )
  );

GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;

GRANT SELECT ON public.pickup_product_stock TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pickup_product_stock TO authenticated;

COMMENT ON TABLE public.products IS '판매 상품 마스터';
COMMENT ON TABLE public.pickup_product_stock IS '픽업 장소별 가용 수량';
