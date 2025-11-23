"use client";

export default function InputTelp() {

  return (
    <div className="form-control">
      <input type="tel" name="phone" id="phone" required/>
      <label>
        <span className="span" style={{ transitionDelay: "0ms" }}>N</span>
        <span className="span" style={{ transitionDelay: "50ms" }}>o</span>
        <span className="span" style={{ transitionDelay: "100ms" }}>.</span>
        <span className="span" style={{ transitionDelay: "150ms" }}>T</span>
        <span className="span" style={{ transitionDelay: "200ms" }}>e</span>
        <span className="span" style={{ transitionDelay: "250ms" }}>l</span>
        <span className="span" style={{ transitionDelay: "300ms" }}>e</span>
        <span className="span" style={{ transitionDelay: "350ms" }}>p</span>
        <span className="span" style={{ transitionDelay: "400ms" }}>h</span>
        <span className="span" style={{ transitionDelay: "450ms" }}>o</span>
        <span className="span" style={{ transitionDelay: "500ms" }}>n</span>
        <span className="span" style={{ transitionDelay: "550ms" }}>e</span>
      </label>
    </div>
  );
}
