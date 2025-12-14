"use client";

export default function InputNik() {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text');
    
    if (!/^\d+$/.test(pasteData)) {
      e.preventDefault();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    input.value = input.value.replace(/\D/g, '');
  };

  return (
    <div className="form-control">
      <input 
        type="text" 
        name="nik" 
        id="nik" 
        maxLength={16}
        pattern="\d{16}"
        inputMode="numeric"
        onKeyPress={handleKeyPress}
        onPaste={handlePaste}
        onInput={handleInput}
        required
      />
      <label>
        <span className="span" style={{ transitionDelay: "0ms" }}>N</span>
        <span className="span" style={{ transitionDelay: "50ms" }}>I</span>
        <span className="span" style={{ transitionDelay: "100ms" }}>K</span>
      </label>
    </div>
  );
}