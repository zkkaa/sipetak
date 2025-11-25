"use client"

import React from "react";
import LandingHome from "@/components/landingPage/landinghome";
import LandingQuots from "@/components/landingPage/landingquots";
import LandingFitur from "@/components/landingPage/landingfitur";
import Layanan from "@/components/landingPage/layanan";
import FAQSection from "@/components/landingPage/faqsection";
import Partner from "@/components/landingPage/partner";
import LandFooter from "@/components/landingPage/landfoot";
import LandNavbar from "@/components/landingPage/Landnavbar";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import SplashScreen from "@/components/SplashScreen";

function LandingPage() {
  return <>
    <LandNavbar />
    <LandingHome />
    <LandingQuots />
    <LandingFitur />
    <Layanan /> 
    <FAQSection />
    <Partner />
    <LandFooter />
  </>
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent scrolling saat splash screen
    if (showSplash) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showSplash]);

  const handleSplashComplete = () => {
    // Animasi landing page muncul dari kanan
    gsap.fromTo(
      landingRef.current,
      { x: "50%", opacity: 0 },
      { 
        x: 0, 
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
          setShowSplash(false);
        }
      }
    );
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      
      <div
        ref={landingRef}
        className={`transition-opacity duration-500 ${
          showSplash ? "opacity-0" : "opacity-100"
        }`}
      >
        <LandingPage />
      </div>
    </>
  );
}