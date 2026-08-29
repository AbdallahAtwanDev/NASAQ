import Link from "next/link";

export default function GridPattern() {
  return <div className="absolute inset-0 grid-pattern pointer-events-none" />;
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="text-2xl font-arabic font-bold text-ivory">نَسَق</span>
      <span className="text-sm font-editorial text-ivory/70 hidden sm:inline">
        NASAQ
      </span>
    </Link>
  );
}
