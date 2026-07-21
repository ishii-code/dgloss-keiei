import { describe, expect, it } from "vitest";
import { resolveUnit } from "@/lib/config/clientUnitMap";

describe("resolveUnit（請求先コード→事業部）", () => {
  it("DG… はパートナー(partner)へ", () => {
    expect(resolveUnit("DG001")).toBe("partner");
  });

  it("CRM… はCRM(crm)へ", () => {
    expect(resolveUnit("CRM123")).toBe("crm");
  });

  it("AT… はAIテレアポ(tel)へ", () => {
    expect(resolveUnit("AT55")).toBe("tel");
  });

  it("C2…（C25/C26 取込由来）はAIテレアポ(tel)へ", () => {
    expect(resolveUnit("C2599")).toBe("tel");
    expect(resolveUnit("C2601")).toBe("tel");
  });

  it("前後の空白は無視する", () => {
    expect(resolveUnit("  DG001  ")).toBe("partner");
  });

  it("どの規則にもマッチしなければ null（黙って誤配賦しない）", () => {
    expect(resolveUnit("XYZ999")).toBeNull();
    expect(resolveUnit("")).toBeNull();
    // cg は請求先コードを持たない（請求は tel に内包）→ 未マッチ扱い
    expect(resolveUnit("CG100")).toBeNull();
  });
});
