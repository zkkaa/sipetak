"use client";

export default function InputNama() {

  return (
    <div className="form-control">
      <input  type="text" name="nama" id="nama" required/>
      <label>
        <span className="span" style={{ transitionDelay: "0ms" }}>N</span>
        <span className="span" style={{ transitionDelay: "50ms" }}>a</span>
        <span className="span" style={{ transitionDelay: "100ms" }}>m</span>
        <span className="span" style={{ transitionDelay: "150ms" }}>a</span>
      </label>
    </div>
  );
}
