"use client";

import { useEffect, useState, useRef } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem("nasaq_splash_seen");
    if (!seen) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setFading(true);
    sessionStorage.setItem("nasaq_splash_seen", "true");
    setTimeout(() => setVisible(false), 500);
  };

  const handleVideoEnd = () => dismiss();

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-olive flex items-center justify-center transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <button
        onClick={dismiss}
        className="absolute top-6 left-6 z-10 text-ivory/80 hover:text-ivory font-arabic text-lg px-4 py-2 border border-ivory/20 rounded transition-colors"
      >
        تخطي
      </button>

      <div className="relative w-full max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-arabic text-ivory font-bold tracking-wider">
            نَسَق
          </h1>
          <p className="text-ivory/60 font-editorial text-xl mt-2">NASAQ</p>
        </div>

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className="w-full rounded shadow-2xl"
          poster="/assets/splash-poster.jpg"
        >
          <source src="/assets/intro.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
