"use client";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useState } from "react";

export default function InputPw() {
  const [show, setShow] = useState(false);

  return (
    <div className="form-control">
      <input type={show ? "text" : "password"} name="password" id="password" required/>
      <label>
        <span className="span" style={{ transitionDelay: "0ms" }}>P</span>
        <span className="span" style={{ transitionDelay: "50ms" }}>a</span>
        <span className="span" style={{ transitionDelay: "100ms" }}>s</span>
        <span className="span" style={{ transitionDelay: "150ms" }}>s</span>
        <span className="span" style={{ transitionDelay: "200ms" }}>w</span>
        <span className="span" style={{ transitionDelay: "250ms" }}>o</span>
        <span className="span" style={{ transitionDelay: "300ms" }}>r</span>
        <span className="span" style={{ transitionDelay: "350ms" }}>d</span>
      </label>
      {show ? ( 
        <Eye size={24} className="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer" onClick={() => setShow(false)} /> 
        ) : (
        <EyeSlash size={24} className="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer" onClick={() => setShow(true)} />
      )}
    </div>
  );
}
