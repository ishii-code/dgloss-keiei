/** 改善リクエスト。データはサーバーで getDashboardData 経由。 */
import { getDashboardData } from "@/lib/repository/finance";
import { RequestsView } from "@/components/RequestsView";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getDashboardData();
  return <RequestsView requests={data.requests} />;
}
