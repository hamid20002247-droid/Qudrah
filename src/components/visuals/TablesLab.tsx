"use client";

import { useCallback, useState } from "react";

type Props = {
  onInteract?: () => void;
  compact?: boolean;
};

type TablePreset = {
  label: string;
  rowLabels: string[];
  colLabels: string[];
  cells: number[][];
};

const PRESETS: TablePreset[] = [
  {
    label: "مبيعات",
    rowLabels: ["صباح", "مساء"],
    colLabels: ["كتب", "أقلام"],
    cells: [
      [12, 8],
      [9, 15],
    ],
  },
  {
    label: "مدرسة",
    rowLabels: ["أول", "ثاني"],
    colLabels: ["ذكور", "إناث"],
    cells: [
      [18, 22],
      [20, 16],
    ],
  },
  {
    label: "رياضة",
    rowLabels: ["فريق أ", "فريق ب"],
    colLabels: ["فوز", "خسارة"],
    cells: [
      [7, 3],
      [5, 5],
    ],
  },
];

export function TablesLab({ onInteract, compact }: Props) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>({
    r: 0,
    c: 0,
  });
  const [compare, setCompare] = useState<{ r: number; c: number } | null>(null);

  const preset = PRESETS[presetIndex];
  const fire = useCallback(() => onInteract?.(), [onInteract]);

  const rowSum = (r: number) =>
    preset.cells[r].reduce((a, b) => a + b, 0);
  const colSum = (c: number) =>
    preset.cells.reduce((a, row) => a + row[c], 0);

  const onCell = (r: number, c: number) => {
    if (!selected) {
      setSelected({ r, c });
      setCompare(null);
    } else if (selected.r === r && selected.c === c) {
      setSelected(null);
      setCompare(null);
    } else if (!compare) {
      setCompare({ r, c });
    } else {
      setSelected({ r, c });
      setCompare(null);
    }
    fire();
  };

  const a = selected ? preset.cells[selected.r][selected.c] : null;
  const b = compare ? preset.cells[compare.r][compare.c] : null;
  const diff = a !== null && b !== null ? Math.abs(a - b) : null;

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-b from-[#F0FDFA] to-white ring-1 ring-teal-100 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-3 py-2.5 ring-1 ring-teal-100">
        <p className="text-[13px] font-bold leading-snug text-ink">
          اضغط خلية لتحديدها، ثم اضغط خلية ثانية لمعرفة الفرق بينهما.
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          راقب مجموع الصف ومجموع العمود يتحدّثان فوراً.
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="mx-auto w-full min-w-[260px] border-collapse text-center text-sm">
          <thead>
            <tr>
              <th className="p-2 text-[11px] font-bold text-slate-400"> </th>
              {preset.colLabels.map((label) => (
                <th
                  key={label}
                  className="p-2 text-[12px] font-bold text-teal-800"
                >
                  {label}
                </th>
              ))}
              <th className="p-2 text-[11px] font-bold text-teal-600">مجموع</th>
            </tr>
          </thead>
          <tbody>
            {preset.cells.map((row, r) => (
              <tr key={preset.rowLabels[r]}>
                <th className="p-2 text-[12px] font-bold text-teal-800">
                  {preset.rowLabels[r]}
                </th>
                {row.map((value, c) => {
                  const isSel =
                    selected?.r === r && selected?.c === c;
                  const isCmp =
                    compare?.r === r && compare?.c === c;
                  return (
                    <td key={`${r}-${c}`} className="p-1">
                      <button
                        type="button"
                        onClick={() => onCell(r, c)}
                        className={`flex min-h-11 min-w-11 w-full items-center justify-center rounded-xl font-black tabular-nums transition ${
                          isSel
                            ? "bg-teal-600 text-white"
                            : isCmp
                              ? "bg-teal-200 text-teal-950"
                              : "bg-teal-50 text-teal-900 ring-1 ring-teal-100"
                        }`}
                        aria-label={`${preset.rowLabels[r]}، ${preset.colLabels[c]}: ${value}`}
                      >
                        <span dir="ltr">{value}</span>
                      </button>
                    </td>
                  );
                })}
                <td className="p-2">
                  <span
                    className="font-black tabular-nums text-teal-700"
                    dir="ltr"
                  >
                    {rowSum(r)}
                  </span>
                </td>
              </tr>
            ))}
            <tr>
              <th className="p-2 text-[11px] font-bold text-teal-600">مجموع</th>
              {preset.colLabels.map((_, c) => (
                <td key={`col-${c}`} className="p-2">
                  <span
                    className="font-black tabular-nums text-teal-700"
                    dir="ltr"
                  >
                    {colSum(c)}
                  </span>
                </td>
              ))}
              <td className="p-2">
                <span
                  className="font-black tabular-nums text-teal-900"
                  dir="ltr"
                >
                  {preset.cells.flat().reduce((s, n) => s + n, 0)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
          <p className="text-[11px] font-bold text-slate-500">مجموع الصف</p>
          <p className="text-2xl font-black tabular-nums text-ink" dir="ltr">
            {selected ? rowSum(selected.r) : "—"}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100">
          <p className="text-[11px] font-bold text-slate-500">مجموع العمود</p>
          <p className="text-2xl font-black tabular-nums text-ink" dir="ltr">
            {selected ? colSum(selected.c) : "—"}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-teal-600 px-3 py-4 text-center text-white shadow-sm">
        <p className="text-[11px] font-bold text-teal-100">فرق الخليتين</p>
        <p className="mt-1 text-xl font-black tabular-nums" dir="ltr">
          {diff !== null ? `${a} − ${b} → |فرق| = ${diff}` : "اختر خليتين"}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PRESETS.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setPresetIndex(index);
              setSelected({ r: 0, c: 0 });
              setCompare(null);
              fire();
            }}
            className={`min-h-11 rounded-full px-3 text-xs font-bold ${
              index === presetIndex
                ? "bg-teal-700 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
