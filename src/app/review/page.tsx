"use client";

import { useEffect, useState } from "react";
import { ALL_SKILLS } from "@/content/arithmetic";
import { MOCK_POOL } from "@/content/mock/pool";
import type { Question, Skill } from "@/lib/types";

type DraftItem =
  | { kind: "skill"; item: Skill }
  | { kind: "question"; item: Question; parent?: string };

export default function ReviewPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/review/session")
      .then((r) => r.json())
      .then((d: { ok: boolean }) => setAuthed(d.ok))
      .catch(() => setAuthed(false));
  }, []);

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/review/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        setError("الرمز غلط");
        setAuthed(false);
      } else {
        setAuthed(true);
      }
    } catch {
      setError("صار خطأ بالشبكة");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/review/logout", { method: "POST" });
    setAuthed(false);
  };

  if (authed === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-slate-500">
        ...
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-xl font-extrabold text-ink">مراجعة المحتوى</h1>
        <p className="mt-2 text-sm text-slate-600">
          أدخل رمز المراجعة لعرض المسودات.
        </p>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="mt-6 min-h-12 w-full rounded-xl border border-slate-200 px-4"
          placeholder="PIN"
          dir="ltr"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={login}
          disabled={loading}
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-ink font-bold text-white"
        >
          دخول
        </button>
      </div>
    );
  }

  const draftSkills = ALL_SKILLS.filter((s) => s.review_status === "draft");
  const draftQuestions: DraftItem[] = [];
  for (const s of ALL_SKILLS) {
    for (const q of s.drill) {
      if (q.review_status === "draft") {
        draftQuestions.push({ kind: "question", item: q, parent: s.id });
      }
    }
  }
  for (const q of MOCK_POOL) {
    if (
      q.review_status === "draft" &&
      !draftQuestions.some((d) => d.kind === "question" && d.item.id === q.id)
    ) {
      draftQuestions.push({ kind: "question", item: q });
    }
  }

  const allApproved =
    draftSkills.length === 0 && draftQuestions.length === 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-ink">لوحة المراجعة</h1>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-slate-500 underline"
        >
          خروج
        </button>
      </div>

      {allApproved ? (
        <div className="rounded-2xl bg-green-50 p-6 text-center ring-1 ring-green-100">
          <p className="font-bold text-green-800">كل المحتوى معتمد ✓</p>
          <p className="mt-2 text-sm text-green-700">
            لكي تعتمد مسودة جديدة: غيّر{" "}
            <code className="rounded bg-white px-1">review_status</code> إلى{" "}
            <code className="rounded bg-white px-1">approved</code> في ملف
            المحتوى، أو سجّل الاعتماد عبر API التدقيق.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {draftSkills.map((s) => (
            <article
              key={s.id}
              className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200"
            >
              <p className="text-xs font-bold text-amber-800">مهارة — مسودة</p>
              <h2 className="mt-1 font-bold">{s.title_ar}</h2>
              <p className="text-sm text-slate-600">{s.hook_ar}</p>
              <ApproveButton questionId={s.id} kind="skill" />
            </article>
          ))}
          {draftQuestions.map((d) =>
            d.kind === "question" ? (
              <article
                key={d.item.id}
                className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"
              >
                <p className="text-xs font-bold text-amber-700">
                  سؤال — مسودة {d.parent ? `(${d.parent})` : ""}
                </p>
                <p className="mt-2 font-medium">{d.item.prompt_ar}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {d.item.choices_ar.map((c, i) => (
                    <li
                      key={i}
                      className={
                        i === d.item.correct_index
                          ? "font-bold text-green-700"
                          : ""
                      }
                    >
                      {i + 1}. {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-slate-400">
                  مصدر: {d.item.source}
                </p>
                <ApproveButton questionId={d.item.id} kind="question" />
              </article>
            ) : null
          )}
        </div>
      )}

      <div className="mt-10 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-bold text-ink">كل المهارات (عامة)</p>
        <ul className="mt-2 space-y-1">
          {ALL_SKILLS.map((s) => (
            <li key={s.id} className="flex justify-between">
              <span>{s.title_ar}</span>
              <span
                className={
                  s.review_status === "approved"
                    ? "text-green-600"
                    : "text-amber-600"
                }
              >
                {s.review_status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ApproveButton({
  questionId,
  kind,
}: {
  questionId: string;
  kind: "skill" | "question";
}) {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  const approve = async () => {
    try {
      const res = await fetch("/api/review/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: questionId, kind }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={approve}
        className="min-h-10 rounded-xl bg-teal-600 px-4 text-sm font-bold text-white"
      >
        اعتماد في قاعدة التدقيق
      </button>
      {status === "ok" && (
        <p className="mt-1 text-xs text-green-700">
          سُجّل الاعتماد. حدّث الملف في الكود إلى approved ليظهر للعامة.
        </p>
      )}
      {status === "err" && (
        <p className="mt-1 text-xs text-red-600">
          ما قدرنا نسجّل (تأكد من Supabase) — اعتمد يدوياً في الملف.
        </p>
      )}
    </div>
  );
}
