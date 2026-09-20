import Link from "next/link";

/** Branded Arabic 404 — never show Next’s English default. */
export default function NotFound() {
  return (
    <div className="relative mx-auto flex min-h-[70vh] w-full max-w-lg flex-col justify-center px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(13,148,136,0.2),_transparent_60%)]"
        aria-hidden
      />
      <div className="overflow-hidden rounded-[2rem] bg-ink px-6 py-10 text-white shadow-2xl shadow-teal-900/20">
        <p className="font-display text-4xl font-extrabold tracking-tight text-teal-300">
          قُدرة
        </p>
        <h1 className="mt-4 text-2xl font-extrabold leading-snug">
          الصفحة غير موجودة
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          الرابط غير صحيح أو الصفحة انتقلت. ارجع للرئيسية أو افتح خريطة المهارات.
        </p>
        <div className="mt-8 flex flex-col gap-2.5">
          <Link
            href="/"
            className="flex min-h-14 items-center justify-center rounded-2xl bg-teal-500 text-base font-extrabold text-white transition hover:bg-teal-400"
          >
            الرئيسية
          </Link>
          <Link
            href="/skills"
            className="flex min-h-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15"
          >
            خريطة المهارات
          </Link>
          <Link
            href="/auth"
            className="flex min-h-11 items-center justify-center text-sm font-semibold text-slate-400 hover:text-white"
          >
            سجّل دخولك
          </Link>
        </div>
      </div>
    </div>
  );
}
