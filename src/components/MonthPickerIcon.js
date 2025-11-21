'use client'
import { useRef } from "react";
import { BsCalendar3 } from "react-icons/bs";

export default function MonthPickerIcon({ selectedMonth, selectedYear, onChange }) {
  const inputRef = useRef(null);

  const openPicker = () => {
    if (!inputRef.current) return;
    if (typeof inputRef.current.showPicker === "function") {
      inputRef.current.showPicker();
    } else {
      inputRef.current.focus();
      inputRef.current.click();
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [y, m] = val.split("-");
    onChange(parseInt(m, 10) - 1, parseInt(y, 10));
  };

  const valueStr = `${selectedYear}-${String(selectedMonth + 1).padStart(
    2,
    "0"
  )}`;

  const now = new Date();
  const maxStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;

  return (
    <>
      <input
        ref={inputRef}
        type="month"
        value={valueStr}
        max={maxStr}     
        onChange={handleChange}
        style={{ display: "none" }}
        aria-hidden="true"
      />
      <button
        type="button"
        className="btn btn-link p-1"
        onClick={openPicker}
        aria-label="Select month"
        style={{ color: "var(--bs-primary)", fontSize: "1.05rem" }}
      >
        <BsCalendar3 />
      </button>
    </>
  );
}
