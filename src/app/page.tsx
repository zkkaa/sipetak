// import Image from "next/image";

import React from "react";
import LandingHome from "@/components/landingPage/landinghome";
import LandingQuots from "@/components/landingPage/landingquots";
import LandingFitur from "@/components/landingPage/landingfitur";
import Layanan from "@/components/landingPage/layanan";
import FAQSection from "@/components/landingPage/faqsection";
import Partner from "@/components/landingPage/partner";
import LandFooter from "@/components/landingPage/landfoot";
import LandNavbar from "@/components/landingPage/Landnavbar";
// import router from "next/router";

export default function LandingPage() {
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
