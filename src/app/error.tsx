"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-arabic font-bold text-olive mb-4">
        حدث خطأ
      </h1>
      <p className="text-charcoal/60 font-arabic mb-6">
        عذراً، حدثت مشكلة أثناء تحميل الصفحة.
      </p>
      <button onClick={reset} className="btn-primary">
        إعادة المحاولة
      </button>
    </div>
  );
}
