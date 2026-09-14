"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type Mode = "profit" | "discount";

const MIN_PRICE = 50;
const MAX_PRICE = 500;
const STEP = 10;

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function BuySellLab({ onInteract, compact }: Props) {
  const [mode, setMode] = useState<Mode>("profit");
  const [basePrice, setBasePrice] = useState(200);
  const [rate, setRate] = useState(20);
  const [showTrap, setShowTrap] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const fire = useCallback(() => onInteract?.(), [onInteract]);
  const amount = roundMoney(basePrice * (rate / 100));
  const result = roundMoney(
    mode === "profit" ? basePrice + amount : basePrice - amount,
  );
  const wrongProfitRate =
    mode === "profit" ? roundMoney((amount / result) * 100) : 0;

  const setPrice = useCallback(
    (value: number) => {
      const clamped = Math.max(MIN_PRICE, Math.min(MAX_PRICE, value));
      setBasePrice(Math.round(clamped / STEP) * STEP);
      fire();
    },
    [fire],
  );

  const setFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    setPrice(MIN_PRICE + ratio * (MAX_PRICE - MIN_PRICE));
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromClientX(event.clientX);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current) setFromClientX(event.clientX);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have ended.
    }
  };

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setShowTrap(false);
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
          اختر «ربح» أو «خصم»، ثم اسحب مقبض السعر.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب كيف تتغيّر قيمة الربح أو الخصم وسعر النتيجة.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
        {(
          [
            { value: "profit", label: "ربح" },
            { value: "discount", label: "خصم" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => changeMode(option.value)}
            className={`min-h-11 rounded-xl text-sm font-black transition-colors ${
              mode === option.value
                ? option.value === "profit"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-rose-500 text-white shadow-sm"
                : "bg-transparent text-slate-600"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-600">
            {mode === "profit" ? "تكلفة الشراء" : "السعر المعلن"}
          </p>
          <p
            className="text-xl font-black tabular-nums text-ink"
            dir="ltr"
          >
            {basePrice} ر.س
          </p>
        </div>

        <div
          ref={trackRef}
          className="relative mt-5 h-12 touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
              event.preventDefault();
              setPrice(basePrice - STEP);
            }
            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
              event.preventDefault();
              setPrice(basePrice + STEP);
            }
          }}
          role="slider"
          tabIndex={0}
          aria-label={
            mode === "profit" ? "تكلفة الشراء" : "السعر المعلن قبل الخصم"
          }
          aria-valuemin={MIN_PRICE}
          aria-valuemax={MAX_PRICE}
          aria-valuenow={basePrice}
        >
          <div className="absolute inset-x-0 top-5 h-2 rounded-full bg-slate-200" />
          <div
            className={`absolute left-0 top-5 h-2 rounded-full ${
              mode === "profit" ? "bg-teal-500" : "bg-rose-400"
            }`}
            style={{
              width: `${((basePrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
            }}
          />
          <div
            className="absolute top-1 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-ink text-white shadow-lg"
            style={{
              left: `${((basePrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
            }}
            aria-hidden
          >
            <span className="text-xs font-black">↔</span>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] text-slate-400">
          اختر النسبة
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {[10, 15, 20, 25, 30].map((value) => (
            <button
              key={value}
              type="button"
              dir="ltr"
              onClick={() => {
                setRate(value);
                fire();
              }}
              className={`min-h-11 min-w-12 rounded-full px-3 text-xs font-black tabular-nums ${
                rate === value
                  ? mode === "profit"
                    ? "bg-teal-600 text-white"
                    : "bg-rose-500 text-white"
                  : "bg-slate-50 text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {value}%
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <PriceCard
          label={mode === "profit" ? "التكلفة" : "السعر المعلن"}
          value={basePrice}
          tone="base"
        />
        <div
          className={`flex h-11 min-w-16 items-center justify-center rounded-full px-2 text-xs font-black text-white ${
            mode === "profit" ? "bg-teal-600" : "bg-rose-500"
          }`}
          dir="ltr"
        >
          {mode === "profit" ? "+" : "−"}
          {rate}%
        </div>
        <PriceCard
          label={mode === "profit" ? "سعر البيع" : "بعد الخصم"}
          value={result}
          tone={mode}
        />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 text-center ring-1 ring-slate-100">
        <p className="text-xs font-bold text-slate-500">
          {mode === "profit" ? "مقدار الربح" : "مقدار الخصم"}
        </p>
        <p className="mt-1 text-lg font-black tabular-nums text-ink" dir="ltr">
          {basePrice} × {rate}% = {amount} ر.س
        </p>
        <p
          className={`mt-3 rounded-xl px-3 py-3 text-xl font-black tabular-nums ${
            mode === "profit"
              ? "bg-teal-50 text-teal-900 ring-1 ring-teal-100"
              : "bg-rose-50 text-rose-900 ring-1 ring-rose-100"
          }`}
          dir="ltr"
        >
          {mode === "profit"
            ? `${basePrice} + ${amount} = ${result}`
            : `${basePrice} − ${amount} = ${result}`}
        </p>
      </div>

      {mode === "profit" && (
        <>
          <button
            type="button"
            onClick={() => {
              setShowTrap((current) => !current);
              fire();
            }}
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl bg-amber-50 text-sm font-bold text-amber-900 ring-1 ring-amber-200"
          >
            {showTrap ? "إخفاء المصيدة" : "أظهر مصيدة نسبة الربح"}
          </button>
          {showTrap && (
            <div className="mt-3 rounded-xl bg-rose-50 px-3 py-3 text-center ring-1 ring-rose-200">
              <p className="text-[11px] font-bold text-rose-700">غلط شائع</p>
              <p
                className="mt-1 text-lg font-black tabular-nums text-rose-900 line-through"
                dir="ltr"
              >
                {amount} ÷ {result} = {wrongProfitRate}%
              </p>
              <p className="mt-2 text-xs leading-relaxed text-rose-800">
                نسبة الربح تُقسم على تكلفة الشراء، لا على سعر البيع.
              </p>
            </div>
          )}
        </>
      )}

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {[
          { mode: "profit" as const, price: 100, rate: 20, label: "100 + 20%" },
          {
            mode: "profit" as const,
            price: 400,
            rate: 15,
            label: "400 + 15%",
          },
          {
            mode: "discount" as const,
            price: 250,
            rate: 20,
            label: "250 − 20%",
          },
        ].map((preset) => (
          <button
            key={preset.label}
            type="button"
            dir="ltr"
            onClick={() => {
              setMode(preset.mode);
              setBasePrice(preset.price);
              setRate(preset.rate);
              setShowTrap(false);
              fire();
            }}
            className="min-h-11 rounded-full bg-white px-3 text-xs font-bold tabular-nums text-slate-700 ring-1 ring-slate-200"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PriceCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "base" | Mode;
}) {
  const toneClass = {
    base: "bg-slate-100 text-slate-900",
    profit: "bg-teal-50 text-teal-900 ring-1 ring-teal-100",
    discount: "bg-rose-50 text-rose-900 ring-1 ring-rose-100",
  }[tone];

  return (
    <div className={`rounded-2xl px-2 py-3 text-center ${toneClass}`}>
      <p className="text-[11px] font-bold opacity-70">{label}</p>
      <p className="mt-1 text-lg font-black tabular-nums" dir="ltr">
        {value} ر.س
      </p>
    </div>
  );
}
