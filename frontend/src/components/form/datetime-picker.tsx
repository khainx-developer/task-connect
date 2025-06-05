import { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalendarIcon } from "../icons/Calendar";

interface PropsType {
  id: string;
  onChange: (selectedDates: Date[], dateStr: string) => void;
  label?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function DateTimePicker({
  id,
  onChange,
  label,
  value,
  placeholder = "Select date and time",
  required = false,
  disabled = false,
}: PropsType) {
  useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      enableTime: true,
      dateFormat: "d/m/Y H:i",
      time_24hr: true,
      defaultDate: value ? new Date(value) : undefined,
      onChange,
      static: true,
      monthSelectorType: "static",
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [onChange, id, value]);

  return (
    <div>
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="relative">
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          defaultValue={value}
          disabled={disabled}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800 disabled:opacity-50"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalendarIcon className="size-6" />
        </span>
      </div>
    </div>
  );
} 