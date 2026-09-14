"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Kind = "length" | "area" | "volume";

const PRESETS: { label: string; kind: Kind; meters: number }[] = [
  { label: "٢ م", kind: "length", meters: 2 },
  { label: "٣ م²", kind: "area", meters: 3 },
  { label: "٠٫٥ م", kind: "length", meters: 0.5 },
  { label: "٠٫٢ م²", kind: "area", meters: 0.2 },
  { label: "٠٫٠١ م³", kind: "volume", meters: 0.01 },
];

export function UnitsMeasureLab({ onInteract, compact }: Props) {
  const [kind, setKind] = useState<Kind>("length");
  const [meters, setMeters] = useState(2);
  const [showTrap, setShowTrap] = useState(false);
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const factor = kind === "length" ? 100 : kind === "area" ? 10000 : 1000000;
  const cmValue = meters * factor;
  const wrongLengthFactor = meters * 100;

  const unitFrom = kind === "length" ? "م" : kind === "area" ? "م²" : "م³";
  const unitTo = kind === "length" ? "سم" : kind === "area" ? "سم²" : "سم³";

  const bump = () => {
    const steps = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];
    const index = steps.findIndex((v) => Math.abs(v - meters) < 0.001);
    setMeters(steps[(index + 1) % steps.length] ?? 1);
    fire();
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#FFF7ED] to-white ring-1 ring-orange-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-orange-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اختر نوع الكمية واضغط القيمة للزيادة.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          لاحظ اختلاف معامل التحويل بين الطول والمساحة والحجم.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {(
          [
            { id: "length" as const, label: "طول" },
            { id: "area" as const, label: "مساحة" },
            { id: "volume" as const, label: "حجم" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setKind(item.id);
              fire();
            }}
            className={`min-h-11 rounded-full px-4 text-xs font-bold ${
              kind === item.id
                ? "bg-orange-700 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={bump}
        className="mt-5 flex min-h-24 w-full flex-col items-center justify-center rounded-3xl bg-white ring-1 ring-orange-100"
      >
        <p className="text-[11px] font-bold text-slate-500">القيمة بالمتر · اضغط للزيادة</p>
        <p className="text-3xl font-black tabular-nums text-ink" dir="ltr">
          {meters} {unitFrom}
        </p>
      </button>

      <div className="mt-3 rounded-2xl bg-orange-700 px-3 py-4 text-center text-white">
        <p className="text-[11px] font-bold text-orange-100">
          معامل التحويل ×{factor.toLocaleString("en-US")}
        </p>
        <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
          {meters} {unitFrom} = {cmValue.toLocaleString("en-US")} {unitTo}
        </p>
      </div>

      {showTrap && kind !== "length" && (
        <div className="mt-2 rounded-2xl bg-rose-50 px-3 py-2 text-center ring-1 ring-rose-200">
          <p className="text-[11px] font-bold text-rose-800">مصيدة عامل الطول</p>
          <p className="text-sm font-bold tabular-nums text-rose-950" dir="ltr">
            خطأ شائع: {meters} × 100 = {wrongLengthFactor}
          </p>
          <p className="text-[11px] text-rose-700">لا تستخدم ١٠٠ لتحويل المساحة أو الحجم</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setKind(preset.kind);
              setMeters(preset.meters);
              fire();
            }}
            className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setShowTrap((v) => !v);
            fire();
          }}
          className="min-h-11 rounded-full bg-rose-100 px-3 text-xs font-bold text-rose-900 ring-1 ring-rose-200"
        >
          {showTrap ? "إخفاء المصيدة" : "أظهر المصيدة"}
        </button>
      </div>
    </div>
  );
}
