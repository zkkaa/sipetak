// File: src/components/SplashScreen.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import Image from "next/image";

interface SplashScreenProps {
  onComplete: () => void;
}

const generateBubbles = () => {
  return [...Array(10)].map((_, i) => ({
    id: i,
    size: Math.random() * 12 + 8,
    // Menyesuaikan rentang posisi agar lebih kecil dan proporsional untuk mobile
    left: Math.random() * 100 - 50,
    top: Math.random() * 100 - 50,
  }));
};

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const logoRef = useRef<HTMLDivElement>(null);
  const bubbleContainerRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const [showText1, setShowText1] = useState(false);
  const [showText2, setShowText2] = useState(false);
  const [bubbles, setBubbles] = useState<Array<{ id: number; size: number; left: number; top: number }>>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setBubbles(generateBubbles());
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Menentukan pergeseran logo.
    // Untuk mobile, logo tetap di tengah (x: 0), teks yang akan muncul di sebelahnya (tidak ada pergeseran logo)
    // Untuk desktop, logo bergeser ke kiri (x: -250) untuk memberi ruang pada teks.
    const logoMoveX = window.innerWidth > 768 ? -250 : 0; 
    
    // Pergeseran text container.
    // Di mobile, teks tidak perlu digeser karena sudah di bawah logo (x: 0).
    // Di desktop, teks akan muncul di posisi relatif yang disesuaikan.

    const timeline = gsap.timeline({
      onComplete: () => {
        setTimeout(onComplete, 300);
      }
    });

    // 1. Logo muncul dari bawah ke tengah (1 detik)
    timeline.to(logoRef.current, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
    });

    // Bubble animation muncul
    timeline.to(bubbleContainerRef.current, {
      opacity: 1,
      duration: 0.5,
    }, "-=0.5");

    // 2. Tunggu 1 detik di tengah, lalu lakukan pergeseran (hanya di desktop, jika logoMoveX != 0)
    timeline.to([logoRef.current, bubbleContainerRef.current], {
      x: logoMoveX, // Menggunakan nilai responsif
      duration: 0.8,
      ease: "power2.inOut",
      delay: 1,
    });

    // Hide bubbles
    timeline.to(bubbleContainerRef.current, {
      opacity: 0,
      duration: 0.3,
    }, "-=0.5");

    // 3. Text 1 muncul
    // Perhatikan: Text 1 dan Text 2 sekarang berada di luar pergerakan logo di mobile,
    // jadi yang perlu dianimasikan hanya opacity dan stagger.
    timeline.call(() => {
      setShowText1(true);
    });

    // Hold text 1 selama 2 detik
    timeline.to({}, { duration: 2 });

    // Text 1 geser ke kanan dan hilang (Hanya terlihat bergeser di desktop)
    timeline.to(text1Ref.current, {
      x: 100,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
    });

    // Text 2 muncul (hide text1, show text2)
    timeline.call(() => {
      setShowText1(false);
      setShowText2(true);
    }, undefined, "+=0");

    // Hold text 2 selama 2 detik
    timeline.to({}, { duration: 2 });

    // 4. Seluruh splash bergeser ke kiri
    timeline.to(".splash-container", {
      x: "-100%",
      duration: 1,
      ease: "power2.inOut",
    });

    return () => {
      timeline.kill();
    };
  }, [isClient, onComplete]);

  const text1 = "Hallo, selamat datang di Sipetak";
  const text2 = "Sistem Penataan Tempat Usaha Kita";

  // Variants untuk animasi huruf per huruf
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      }
    }
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      x: -20,
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 200
      }
    }
  };

  // Loading state while client-side hydration
  if (!isClient) {
    return (
      <div className="splash-container fixed inset-0 z-50 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="splash-container fixed inset-0 z-50 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>

      {/* Content Container: FLEX-COL di mobile (default) dan FLEX-ROW di desktop (md:) */}
      {/* Di mobile, konten (logo & teks) ditumpuk di tengah vertikal. */}
      <div className="relative flex flex-col md:flex-row items-center justify-center">
        
        {/* Logo + Bubbles */}
        <div className="relative">
          <div
            ref={logoRef}
            className="relative z-10"
            style={{ 
              transform: "translateY(100vh)", 
              opacity: 0 
            }}
          >
            <div className="bg-white rounded-full p-3 md:p-4 shadow-2xl">
              <Image
                src="/logo.png"
                alt="SIPETAK Logo"
                width={120} // Ukuran kecil untuk mobile
                height={120}
                className="md:w-[180px] md:h-[180px] drop-shadow-lg" // Ukuran besar untuk desktop
                priority
              />
            </div>
            
            {/* Bubble Container */}
            <div
              ref={bubbleContainerRef}
              className="absolute inset-0 pointer-events-none"
              style={{ opacity: 0 }}
            >
              {bubbles.map((bubble) => (
                <motion.div
                  key={bubble.id}
                  className="absolute bg-white rounded-full opacity-60"
                  style={{
                    width: bubble.size,
                    height: bubble.size,
                    left: `${bubble.left}px`,
                    top: `${bubble.top}px`,
                  }}
                  animate={{
                    y: [0, -150, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 1.5,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Text Container: 
            - Mobile: Text di bawah logo, lebar penuh.
            - Desktop: Text di samping kanan logo.
        */}
        <div 
          className="w-full text-center mt-6 md:absolute md:left-1/2 md:ml-12 md:w-[500px] md:text-left md:mt-0"
          style={{ 
            // Reset positioning untuk mobile
            // Hanya berlaku di desktop karena posisi absolute
            // Di mobile, ini tetap relatif di bawah logo
            transform: 'none' 
          }}
        >
          {/* Text 1 */}
          {showText1 && (
            <motion.div
              ref={text1Ref}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-white"
            >
              <div className="text-2xl md:text-4xl font-bold leading-tight"> {/* Ukuran teks disesuaikan */}
                {text1.split("").map((char, index) => (
                  <motion.span
                    key={`text1-${index}`}
                    variants={letterVariants}
                    className="inline-block"
                    style={{ 
                      whiteSpace: char === " " ? "pre" : "normal",
                      marginRight: char === " " ? "0.25em" : "0"
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Text 2 */}
          {showText2 && (
            <motion.div
              ref={text2Ref}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-white mt-2"
            >
              <div className="text-xl md:text-2xl font-semibold leading-tight"> {/* Ukuran teks disesuaikan */}
                {text2.split("").map((char, index) => (
                  <motion.span
                    key={`text2-${index}`}
                    variants={letterVariants}
                    className="inline-block"
                    style={{ 
                      whiteSpace: char === " " ? "pre" : "normal",
                      marginRight: char === " " ? "0.25em" : "0"
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Loading Dots */}
      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex space-x-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-white rounded-full shadow-lg"
              animate={{
                y: [0, -12, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}