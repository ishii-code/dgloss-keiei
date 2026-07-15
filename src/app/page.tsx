/** 予実モニター（メイン）。財務データはサーバーで getDashboardData（DB→モック）から取得。 */
import { getDashboardData } from "@/lib/repository/finance";
import { YojitsuMonitor } from "@/components/YojitsuMonitor";

// DB接続時に実データを反映するため動的レンダリング（モック時も同様に動作）。
export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getDashboardData();
  return <YojitsuMonitor y={data.yojitsu} cgKpi={data.cgKpi} />;
}
