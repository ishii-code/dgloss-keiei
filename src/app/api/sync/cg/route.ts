import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { DB_ENABLED, prisma } from "@/lib/db";
import { CG_ENABLED, fetchCgKpi } from "@/lib/sources/cg";

/**
 * カスタマーグロース部（dgloss-cg）の活動KPIを取り込み、CgKpiSnapshot に1件追記する。
 * ダッシュボードは最新スナップショット（fetchedAt 最大）を表示する。
 * DB と CG_KPI_URL の両方が有効なときのみ動作。定期実行は Vercel Cron 想定。
 */
export async function POST() {
  if (!DB_ENABLED || !prisma) {
    return NextResponse.json({ error: "DATABASE_URL 未設定（DBオフ）" }, { status: 503 });
  }
  if (!CG_ENABLED) {
    return NextResponse.json({ error: "CG_KPI_URL 未設定（cg連携オフ）" }, { status: 503 });
  }

  let kpi;
  try {
    kpi = await fetchCgKpi();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "cg KPI 取得失敗" }, { status: 502 });
  }

  const snap = await prisma.cgKpiSnapshot.create({
    data: {
      note: kpi.note,
      metrics: kpi.metrics as unknown as Prisma.InputJsonValue,
      source: "cg-api",
    },
  });

  return NextResponse.json({ id: snap.id, metrics: kpi.metrics.length, fetchedAt: snap.fetchedAt });
}
