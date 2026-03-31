-- 비로그인 방문자도 활성 픽업 장소 목록을 볼 수 있도록 (고객용 /pickup 페이지)
DROP POLICY IF EXISTS "pickup_locations_select_anon_active" ON public.pickup_locations;

CREATE POLICY "pickup_locations_select_anon_active"
  ON public.pickup_locations FOR SELECT
  TO anon
  USING (is_active = true);
