"use client";
import Image from "next/image";
import InputPw from "@/components/common/inputpw";
import InputEmail from "@/components/common/inputemail";

export default function Page() {
  

  return <>
    <div className="relative w-screen h-screen flex justify-center items-center gap-7">
      {/* <div className="absolute w-[480px] h-[480px] bg-blue-500 opacity-30 rounded-full -top-44 -left-44"></div>
      <div className="absolute w-[500px] h-[500px] bg-blue-500 opacity-30 rounded-full -bottom-48 -right-48"></div> */}

      <Image src="/login.png" alt="Logo" width={100} height={100} className="w-96 h-96 bg-red-300" />
      <div className="w-fit bg-white shadow-lg z-10 rounded-3xl py-8 px-14">
        <h1 className="text-4xl font-bold mb-2">Masuk</h1>
        <span className="text-base">Silahkan masukkan akun anda!</span>

        <div className="flex flex-col">
          <div className="flex flex-col justify-between gap-5 mt-10">
            <InputEmail />
            <InputPw />
          </div>
          
          <button
            type="submit"
            className="w-80 h-11 bg-cyan-500 text-white border border-cyan-400 border-b-4 font-[600] text-[17px] overflow-hidden relative px-4 py-2 rounded-md hover:brightness-100 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group active:scale-95 mt-14"
          >
            <span className="w-full h-full bg-cyan-400 shadow-cyan-400 absolute -top-[150%] left-0 inline-flex rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
            Login
          </button>
          <span className="mt-4 text-sm">Belum punya akun? <a href="/register" className="text-cyan-500">Daftar sekarang</a></span>
        </div>
      </div>
    </div>
  </>
}
