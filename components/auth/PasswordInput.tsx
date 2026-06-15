"use client";

import { useState, type ChangeEvent } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/layout/icons";

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  className: string;
}

/** Campo password con toggle mostra/nascondi, stile coerente con gli input FinanceHub. */
export function PasswordInput({
  id,
  name,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  className,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className={`${className} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Nascondi password" : "Mostra password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary transition duration-150 ease-in-out hover:text-text-primary"
      >
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}
