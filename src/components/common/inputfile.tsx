import React, { useState, useEffect } from "react";
import { Camera } from "@phosphor-icons/react";
import { twMerge } from "tailwind-merge"; 

interface InputFileProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    onChange: (file: File) => void;
    className?: string;
    inputHeightClass?: string;
}

const InputFile = ({ onChange, className, inputHeightClass = "h-full", ...props }: InputFileProps) => {
    const [image, setImage] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Deteksi apakah device adalah mobile
        const checkMobile = () => {
            setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    setImage(reader.result);
                }
            };
            reader.readAsDataURL(file);

            onChange(file);
        } else {
            setImage(null);
        }
    };

    return (
        <div className={twMerge(`
            relative w-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer overflow-hidden transition-colors 
            hover:border-blue-400 ${inputHeightClass}
            `, className)}>
            <div className="relative w-full h-full group">
                {image
                    ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={image}
                            alt="Uploaded"
                            className="w-full h-full object-cover rounded-xl transition duration-300 group-hover:blur-sm"
                        />
                    )
                    : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50">
                            <Camera size={48} className="mb-2" />
                            <span className="text-sm font-medium">
                                {isMobile ? "Ambil Gambar" : "Klik untuk Unggah atau Ambil Gambar"}
                            </span>
                        </div>
                    )}

                {image && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-600/60 text-white opacity-0 group-hover:opacity-100 transition duration-300 rounded-xl z-20 pointer-events-none">
                        <span className="text-lg font-semibold">Ganti Bukti Foto</span>
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    capture={isMobile ? "environment" : undefined}
                    onChange={handleImageChange}
                    {...props}
                    className="absolute inset-0 opacity-0 cursor-pointer z-30"
                />
            </div>
        </div>
    );
};

export default InputFile;