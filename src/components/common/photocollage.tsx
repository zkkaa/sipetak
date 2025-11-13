import Image from "next/image";

export default function PhotoCollage() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
      <div className="flex flex-col gap-6">
        <div className="rounded-tl-[60px] rounded-br-[60px] overflow-hidden w-80 h-60 md:w-96 md:h-72 shadow-md">
          <Image
            src="/umkm2.png"
            alt="Pasar modern"
            width={500}
            height={400}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="rounded-full overflow-hidden w-48 h-48 shadow-md self-start">
          <Image
            src="/umkm3.png"
            alt="Kasir UMKM"
            width={300}
            height={300}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="rounded-tr-[60px] rounded-bl-[60px] overflow-hidden w-72 h-60 md:w-80 md:h-72 shadow-md">
        <Image
          src="/umkm1.png"
          alt="Pedagang keliling"
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
