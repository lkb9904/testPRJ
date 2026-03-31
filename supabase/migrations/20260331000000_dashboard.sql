-- 과일 쇼핑몰: 고객 CRM · 픽업/배송/공구 · 관리자(역할) · 주문
-- Supabase SQL Editor 또는 CLI로 실행

-- ---------------------------------------------------------------------------
-- 공통: updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 프로필 (로그인 사용자 ↔ 역할: 관리자/스태프/고객)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer'
    CHECK (role IN ('admin', 'staff', 'customer')),
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    'customer',
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 고객 CRM (비회원 전화 주문도 가능: user_id NULL)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  memo TEXT,
  user_id UUID UNIQUE REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers (user_id);

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 배송지
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  label TEXT,
  recipient_name TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  postal_code TEXT,
  phone TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer
  ON public.customer_addresses (customer_id);

CREATE TRIGGER customer_addresses_updated_at
  BEFORE UPDATE ON public.customer_addresses
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 픽업 장소 (매장·공구 수령지 등)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pickup_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  detail_note TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER pickup_locations_updated_at
  BEFORE UPDATE ON public.pickup_locations
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 공구(공동구매) 캠페인
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.group_buy_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  unit_price BIGINT NOT NULL CHECK (unit_price >= 0),
  unit_label TEXT NOT NULL DEFAULT '박스',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  pickup_location_id UUID REFERENCES public.pickup_locations (id) ON DELETE SET NULL,
  pickup_note TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'closed', 'cancelled')),
  min_quantity INT NOT NULL DEFAULT 1 CHECK (min_quantity >= 1),
  max_participants INT CHECK (max_participants IS NULL OR max_participants >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT group_buy_campaigns_time_check CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_group_buy_campaigns_status ON public.group_buy_campaigns (status);
CREATE INDEX IF NOT EXISTS idx_group_buy_campaigns_ends ON public.group_buy_campaigns (ends_at);

CREATE TRIGGER group_buy_campaigns_updated_at
  BEFORE UPDATE ON public.group_buy_campaigns
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 주문 (픽업 / 배송 / 공구)
-- ---------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE RESTRICT,
  order_type TEXT NOT NULL CHECK (order_type IN ('pickup', 'delivery', 'group_buy')),
  group_buy_campaign_id UUID REFERENCES public.group_buy_campaigns (id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT '주문접수'
    CHECK (status IN (
      '주문접수',
      '결제완료',
      '픽업대기',
      '배송준비',
      '배송중',
      '완료',
      '취소'
    )),
  pickup_location_id UUID REFERENCES public.pickup_locations (id) ON DELETE SET NULL,
  pickup_at TIMESTAMPTZ,
  delivery_address_id UUID REFERENCES public.customer_addresses (id) ON DELETE SET NULL,
  requested_delivery_date DATE,
  notes TEXT,
  total_amount BIGINT NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT orders_type_group_buy_check CHECK (
    (order_type = 'group_buy' AND group_buy_campaign_id IS NOT NULL)
    OR (order_type <> 'group_buy' AND group_buy_campaign_id IS NULL)
  ),
  CONSTRAINT orders_delivery_address_check CHECK (
    (order_type = 'delivery' AND delivery_address_id IS NOT NULL)
    OR order_type <> 'delivery'
  )
);

CREATE OR REPLACE FUNCTION public.assign_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL OR btrim(NEW.order_number) = '' THEN
    NEW.order_number := 'ORD-' || to_char((now() AT TIME ZONE 'Asia/Seoul'), 'YYYYMMDD')
      || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_assign_number ON public.orders;
CREATE TRIGGER orders_assign_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.assign_order_number();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_group_buy ON public.orders (group_buy_campaign_id);

-- ---------------------------------------------------------------------------
-- 주문 품목
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  product_name TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price BIGINT NOT NULL CHECK (unit_price >= 0),
  line_total BIGINT NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);

CREATE OR REPLACE FUNCTION public.recalc_order_total_from_items()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target UUID;
BEGIN
  target := COALESCE(NEW.order_id, OLD.order_id);
  UPDATE public.orders o
  SET
    total_amount = COALESCE((
      SELECT SUM(oi.line_total)::bigint FROM public.order_items oi WHERE oi.order_id = target
    ), 0),
    updated_at = now()
  WHERE o.id = target;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS order_items_recalc ON public.order_items;
CREATE TRIGGER order_items_recalc
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW EXECUTE PROCEDURE public.recalc_order_total_from_items();

-- ---------------------------------------------------------------------------
-- 대시보드용 뷰 (첫 번째 품목명 + 합계금액)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_dashboard_orders AS
SELECT
  o.order_number,
  COALESCE(
    (
      SELECT oi.product_name
      FROM public.order_items oi
      WHERE oi.order_id = o.id
      ORDER BY oi.sort_order, oi.created_at
      LIMIT 1
    ),
    '(상품 없음)'
  ) AS product_name,
  o.status,
  o.total_amount AS amount_krw,
  o.created_at
FROM public.orders o;

-- ---------------------------------------------------------------------------
-- 재고 알림 (대시보드 카드용)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_label TEXT NOT NULL,
  message TEXT,
  severity TEXT NOT NULL DEFAULT 'warning'
    CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_inventory_alerts_unresolved
  ON public.inventory_alerts (created_at DESC)
  WHERE resolved_at IS NULL;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_buy_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'staff')
  );
$$;

-- profiles
CREATE POLICY "profiles_select_own_or_staff"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_staff());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- customers
CREATE POLICY "customers_all_staff"
  ON public.customers FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "customers_select_linked_user"
  ON public.customers FOR SELECT
  USING (user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "customers_update_linked_user"
  ON public.customers FOR UPDATE
  USING (user_id IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

-- addresses: 소유 고객 또는 스태프
CREATE POLICY "customer_addresses_staff"
  ON public.customer_addresses FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "customer_addresses_select_own"
  ON public.customer_addresses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_addresses.customer_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "customer_addresses_modify_own"
  ON public.customer_addresses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_addresses.customer_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_addresses.customer_id
        AND c.user_id = auth.uid()
    )
  );

-- 픽업장·공구: 읽기는 로그인 사용자, 쓰기는 스태프
CREATE POLICY "pickup_locations_select_authenticated"
  ON public.pickup_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "pickup_locations_staff_write"
  ON public.pickup_locations FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "group_buy_select_authenticated"
  ON public.group_buy_campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "group_buy_staff_write"
  ON public.group_buy_campaigns FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- 주문: 스태프 전체 / 고객은 본인 고객 레코드에 연결된 주문만
CREATE POLICY "orders_staff_all"
  ON public.orders FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "orders_select_own_customer"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = orders.customer_id
        AND c.user_id IS NOT NULL
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "orders_insert_own_customer"
  ON public.orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = orders.customer_id
        AND c.user_id IS NOT NULL
        AND c.user_id = auth.uid()
    )
  );

-- order_items: 주문 접근과 동일
CREATE POLICY "order_items_staff_all"
  ON public.order_items FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "order_items_select_via_order"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_items.order_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_modify_via_order"
  ON public.order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_items.order_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_items.order_id
        AND c.user_id = auth.uid()
    )
  );

-- 재고 알림: 스태프만 (고객 UI에 안 써도 됨)
CREATE POLICY "inventory_alerts_staff"
  ON public.inventory_alerts FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ---------------------------------------------------------------------------
-- 뷰는 RLS 상위 테이블 따름 — Supabase에서 뷰 SELECT 시 orders 정책 적용
-- ---------------------------------------------------------------------------
GRANT SELECT ON public.v_dashboard_orders TO authenticated;

-- ---------------------------------------------------------------------------
-- 샘플 데이터 (테이블이 비어 있을 때만)
-- ---------------------------------------------------------------------------
INSERT INTO public.pickup_locations (name, address, detail_note, sort_order)
SELECT '본점', '서울시 예시구 예시로 1', '1층 카운터', 0
WHERE NOT EXISTS (SELECT 1 FROM public.pickup_locations WHERE name = '본점');

INSERT INTO public.pickup_locations (name, address, detail_note, sort_order)
SELECT '공구 수령장 B', '경기도 예시시 예시동 2', '주말 10~14시', 1
WHERE NOT EXISTS (SELECT 1 FROM public.pickup_locations WHERE name = '공구 수령장 B');

INSERT INTO public.customers (display_name, phone, memo)
SELECT '샘플 고객', '010-0000-0000', '테스트'
WHERE NOT EXISTS (SELECT 1 FROM public.customers LIMIT 1);

DO $$
DECLARE
  cust_id UUID;
  ord_id UUID;
  pl_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM public.orders LIMIT 1) THEN
    RETURN;
  END IF;
  SELECT id INTO cust_id FROM public.customers ORDER BY created_at LIMIT 1;
  IF cust_id IS NULL THEN
    RETURN;
  END IF;
  SELECT id INTO pl_id FROM public.pickup_locations ORDER BY sort_order LIMIT 1;
  INSERT INTO public.orders (
    customer_id,
    order_type,
    status,
    pickup_location_id,
    total_amount
  )
  VALUES (
    cust_id,
    'pickup',
    '픽업대기',
    pl_id,
    0
  )
  RETURNING id INTO ord_id;

  INSERT INTO public.order_items (order_id, product_name, quantity, unit_price, line_total)
  VALUES (ord_id, '샘플 사과 박스', 1, 25000, 25000);

  UPDATE public.orders SET status = '결제완료' WHERE id = ord_id;
END $$;

INSERT INTO public.inventory_alerts (product_label, message, severity)
SELECT '샘플 품목', '재고 확인이 필요합니다.', 'warning'
WHERE NOT EXISTS (
  SELECT 1 FROM public.inventory_alerts WHERE product_label = '샘플 품목'
);

-- 대시보드/관리자에서 전체 주문을 보려면 해당 사용자의 profiles.role 을 'admin' 또는 'staff' 로 설정하세요.
