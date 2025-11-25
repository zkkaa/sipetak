"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import Image from "next/image";

interface SplashScreenProps {
  onComplete: () => void;
}

// Generate bubbles di client saja untuk menghindari hydration mismatch
const generateBubbles = () => {
  return [...Array(10)].map((_, i) => ({
    id: i,
    size: Math.random() * 12 + 8,
    left: Math.random() * 200 - 50,
    top: Math.random() * 200 - 50,
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

  // Ensure client-side rendering untuk menghindari hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setBubbles(generateBubbles());
  }, []);

  useEffect(() => {
    if (!isClient) return;

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

    // 2. Tunggu 1 detik di tengah, lalu logo bergeser ke kiri
    timeline.to([logoRef.current, bubbleContainerRef.current], {
      x: -250,
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
    timeline.call(() => {
      setShowText1(true);
    });

    // Hold text 1 selama 2 detik
    timeline.to({}, { duration: 2 });

    // Text 1 geser ke kanan dan hilang + Text 2 muncul
    timeline.to(text1Ref.current, {
      x: 100,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
    }, 0);

    // Text 2 muncul bersamaan saat text 1 hilang
    timeline.call(() => {
      setShowText1(false);
      setShowText2(true);
    }, 0);

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

  // Render empty state di server untuk menghindari hydration mismatch
  if (!isClient) {
    return (
      <div className="splash-container fixed inset-0 z-50 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="splash-container fixed inset-0 z-50 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 flex items-center justify-center overflow-hidden">
      
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

      {/* Content Container */}
      <div className="relative flex items-center justify-center">
        
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
            <div className="bg-white rounded-full p-4 shadow-2xl">
              <Image
                src="/logo.png"
                alt="SIPETAK Logo"
                width={180}
                height={180}
                className="drop-shadow-lg"
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

        {/* Text Container */}
        <div className="absolute left-1/2 ml-12 w-[500px]">
          {/* Text 1 */}
          {showText1 && (
            <motion.div
              ref={text1Ref}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-white"
            >
              <div className="text-4xl font-bold leading-tight">
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
              className="text-white mt-4"
            >
              <div className="text-3xl font-semibold leading-tight">
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