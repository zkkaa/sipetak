"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "../common/button";

export default function LandingHome() {
    const router = useRouter();
    const goLogin = () => router.push("/daftar");

    return (
        <section
            id="LandHome"
            className="flex flex-col items-center justify-center min-h-screen pt-20 pb-10 md:pt-14"
        >
            <main className="flex flex-col items-center justify-center w-full flex-1 px-6 md:px-40 lg:px-20 max-w-screen mx-auto">
                <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 lg:gap-16 items-centerzz">
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
                            onClick={goLogin}
                            className="w-fit bg-blue-500 text-white py-3 px-8 text-base font-semibold hover:bg-blue-600 transition duration-300"
                        >
                            Daftar Sekarang
                        </Button>
                    </div>
                    <div className="w-full flex justify-center order-1 md:order-2">
                        <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
                            <Image
                                src="/landhome.png"
                                alt="family"
                                width={700}
                                height={400}
                                className="rounded-xl bg-transparent w-full h-auto" // Added w-full h-auto for better scaling
                                priority
                            />
                        </div>
                    </div>
                </div>
            </main>
        </section>
    );
}