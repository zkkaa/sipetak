"use client";
// import { useState } from "react";

export default function InputEmail() {
  return (
    <div className="form-control">
      <input type="email" name="email" id="email" required/>
      <label>
        <span className="span" style={{ transitionDelay: "0ms" }}>E</span>
        <span className="span" style={{ transitionDelay: "50ms" }}>m</span>
        <span className="span" style={{ transitionDelay: "100ms" }}>a</span>
        <span className="span" style={{ transitionDelay: "150ms" }}>i</span>
        <span className="span" style={{ transitionDelay: "200ms" }}>l</span>
      </label>
    </div>
  );
}
