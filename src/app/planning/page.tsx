/** 事業計画。計画データはサーバーで getDashboardData（DB→モック）から取得。 */
import { getDashboardData } from "@/lib/repository/finance";
import { PlanningView } from "@/components/PlanningView";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getDashboardData();
  return <PlanningView plan={data.plan} />;
}
