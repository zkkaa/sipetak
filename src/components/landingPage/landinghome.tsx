"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
// import PhotoCollage from "../common/photocollage";
import Button from "../common/button";
// import Router from "next/router";

export default function LandingHome() {
    const router = useRouter();
    const goLogin = () => router.push("/login");

    return (
        <section id="LandingHome" className="flex flex-col items-center justify-center min-h-screen">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-20">
                <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-14 items-center">
                    <div className="flex flex-col justify-center gap-3">
                        <div className="flex flex-col gap-10">
                            <h1 className="text-black text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"><span>Sistem Digital untuk</span><br /><span className="text-gray-300">Pengelolaan UMKM Modern</span></h1>
                            <p className="w-9/12 text-sm md:text-base">Mewujudkan ekosistem usaha mikro yang terintegrasi, legal, dan harmonis dengan ketertiban kota. Proses perizinan lokasi yang mudah dan transparan.</p>
                        </div>
                        <Button title="Daftar Sekarang" onClick={goLogin} className="bg-blue-400 text-white py-2 px-6 hover:bg-blue-500"></Button>
                    </div>
                    <div className="w-full flex justify-center">
                        <div className="w-full max-w-[370px] md:max-w-md lg:max-w-lg xl:max-w-xl">
                            {/* <PhotoCollage /> */}
                            <Image src="/landhome.png" alt="family" layout="responsive" width={16} height={9} className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </div>
            </main>
        </section>
    );
}