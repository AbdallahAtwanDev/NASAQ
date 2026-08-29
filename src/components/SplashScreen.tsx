"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem("nasaq_splash_seen");
      if (!seen) setVisible(true);
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = () => {
    setFading(true);
    try {
      sessionStorage.setItem("nasaq_splash_seen", "true");
    } catch {
      /* ignore */
    }
    setTimeout(() => setVisible(false), 500);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-olive flex items-center justify-center transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <button
        onClick={dismiss}
        className="absolute top-6 left-6 z-10 text-ivory/80 hover:text-ivory font-arabic text-lg px-4 py-2 border border-ivory/20 rounded transition-colors cursor-pointer"
      >
        تخطي
      </button>

      <div className="relative w-full max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-arabic text-ivory font-bold tracking-wider mb-8">
          نَسَق
        </h1>
        <video
          autoPlay
          muted
          playsInline
          onEnded={dismiss}
          onError={dismiss}
          className="w-full rounded shadow-2xl"
        >
          <source src="/assets/intro.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
