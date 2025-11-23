"use client";

export default function InputNik() {

  return (
    <div className="form-control">
      <input type="text" name="nik" id="nik" maxLength={16} required/>
      <label>
        <span className="span" style={{ transitionDelay: "0ms" }}>N</span>
        <span className="span" style={{ transitionDelay: "50ms" }}>I</span>
        <span className="span" style={{ transitionDelay: "100ms" }}>K</span>
      </label>

    </div>
  );
}
