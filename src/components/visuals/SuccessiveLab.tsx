"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
  autoDemo?: boolean;
};

export function SuccessiveLab({ onInteract, compact, autoDemo }: Props) {
  const start = 100;
  const [up, setUp] = useState(20);
  const [down, setDown] = useState(20);
  const [step, setStep] = useState<0 | 1 | 2>(2);
  const userTouched = useRef(false);

  const mid = Math.round(start * (1 + up / 100) * 100) / 100;
  const end = Math.round(mid * (1 - down / 100) * 100) / 100;
  const net = Math.round(((end - start) / start) * 1000) / 10;
  const sameRates = up === down && net !== 0;

  const fire = useCallback(() => onInteract?.(), [onInteract]);

  useEffect(() => {
    if (!autoDemo) return;
    const frames = [
      { up: 20, down: 20 },
      { up: 30, down: 10 },
      { up: 10, down: 25 },
      { up: 40, down: 20 },
      { up: 20, down: 20 },
    ];
    let i = 0;
    const id = window.setInterval(() => {
      if (userTouched.current) return;
      i = (i + 1) % frames.length;
      const f = frames[i]!;
      setUp(f.up);
      setDown(f.down);
      setStep(0);
      window.setTimeout(() => {
        if (!userTouched.current) setStep(1);
      }, 350);
      window.setTimeout(() => {
        if (!userTouched.current) setStep(2);
      }, 700);
    }, 1600);
    return () => window.clearInterval(id);
  }, [autoDemo]);

  const cycle = (which: "up" | "down") => {
    userTouched.current = true;
    const opts = [10, 20, 25, 30, 40, 50];
    if (which === "up") {
      setUp(opts[(opts.indexOf(up) + 1) % opts.length]!);
    } else {
      setDown(opts[(opts.indexOf(down) + 1) % opts.length]!);
    }
    setStep(2);
    fire();
  };

  const play = () => {
    userTouched.current = true;
    setStep(0);
    fire();
    window.setTimeout(() => setStep(1), 400);
    window.setTimeout(() => setStep(2), 800);
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#FFFBEB] to-white ring-1 ring-amber-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-amber-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط الآلة الخضراء أو الحمراء لتغيير نسبتها، ثم اضغط «شغّل».
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب الرقم وهو يمرّ من آلة إلى أخرى.
        </p>
      </div>

      <div className="mt-5 flex flex-col items-stretch gap-2">
        <ValueCard label="البداية" value={start} dim={false} />

        <button
          type="button"
          onClick={() => cycle("up")}
          className="rounded-2xl bg-teal-600 px-4 py-3 text-center text-white active:scale-[0.99]"
        >
          <p className="text-[11px] font-semibold text-teal-100">
            اضغط لتغيير الزيادة
          </p>
          <p className="text-2xl font-black">+{up}٪</p>
        </button>

        <ValueCard
          label="بعد الزيادة"
          value={step >= 1 ? mid : "—"}
          dim={step < 1}
          tone="teal"
        />

        <button
          type="button"
          onClick={() => cycle("down")}
          className="rounded-2xl bg-rose-500 px-4 py-3 text-center text-white active:scale-[0.99]"
        >
          <p className="text-[11px] font-semibold text-rose-100">
            اضغط لتغيير النقص
          </p>
          <p className="text-2xl font-black">−{down}٪</p>
        </button>

        <ValueCard
          label="النهاية"
          value={step >= 2 ? end : "—"}
          dim={step < 2}
          tone="ink"
        />
      </div>

      <button
        type="button"
        onClick={play}
        className="mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl bg-ink font-bold text-white"
      >
        شغّل المرور
      </button>

      {step >= 2 && (
        <div className="mt-4 rounded-2xl bg-white p-4 text-center ring-1 ring-slate-100">
          <p className="text-sm text-slate-600">
            من {start} إلى {end}
          </p>
          <p
            className={`mt-1 text-2xl font-black tabular-nums ${
              net < 0 ? "text-rose-600" : net > 0 ? "text-teal-700" : "text-ink"
            }`}
            dir="ltr"
          >
            صافي {net > 0 ? "+" : ""}
            {net}%
          </p>
          {sameRates && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[13px] font-bold leading-relaxed text-amber-950 ring-1 ring-amber-200">
              +{up}% ثم −{down}% لا يلغيان: الثانية تُحسب من الرقم بعد الزيادة.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ValueCard({
  label,
  value,
  dim,
  tone = "slate",
}: {
  label: string;
  value: number | string;
  dim: boolean;
  tone?: "slate" | "teal" | "ink";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-800",
    teal: "bg-teal-50 text-teal-900",
    ink: "bg-slate-900 text-white",
  };
  return (
    <div
      className={`rounded-2xl px-4 py-3 text-center transition-opacity ${tones[tone]} ${
        dim ? "opacity-40" : "opacity-100"
      }`}
    >
      <p className="text-[11px] font-semibold opacity-70">{label}</p>
      <p className="text-2xl font-black tabular-nums" dir="ltr">
        {value}
      </p>
    </div>
  );
}
