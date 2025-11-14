"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "../common/button";

export default function LandingHome() {
    const router = useRouter();
    const goLogin = () => router.push("/masuk");

    return (
        <section 
            id="LandingHome" 
            className="flex flex-col items-center justify-center min-h-screen pt-20 pb-10 md:pt-0"
        >
            <main className="flex flex-col items-center justify-center w-full flex-1 px-6 md:px-10 lg:px-20 max-w-7xl mx-auto">
                <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 lg:gap-16 items-center">
                    
                    <div className="flex flex-col justify-center gap-6 md:gap-8 lg:gap-10 order-2 md:order-1">
                        <div className="flex flex-col gap-6">
                            <h1 className="text-black text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                <span>Sistem Digital untuk</span><br />
                                <span className="text-gray-600">Pengelolaan UMKM Modern</span>
                            </h1>
                            <p className="w-full md:w-11/12 text-sm md:text-base text-gray-700">
                                Mewujudkan ekosistem usaha mikro yang terintegrasi, legal, dan harmonis dengan ketertiban kota. Proses perizinan lokasi yang mudah dan transparan.
                            </p>
                        </div>
                        <Button 
                            title="Daftar Sekarang" 
                            onClick={goLogin} 
                            className="w-fit bg-blue-500 text-white py-3 px-8 text-base font-semibold hover:bg-blue-600 transition duration-300"
                        />
                    </div>
                    
                    <div className="w-full flex justify-center order-1 md:order-2">
                        <div className="w-full max-w-[450px] md:max-w-none">
                            <Image 
                                src="/landhome.png" 
                                alt="family" 
                                width={700}
                                height={400} 
                                className="rounded-xl shadow-2xl w-full h-auto" // Added w-full h-auto for better scaling
                            />
                        </div>
                    </div>
                </div>
            </main>
        </section>
    );
}