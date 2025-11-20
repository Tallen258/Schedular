import React from 'react';

interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'number' | 'password' | 'url' | 'tel';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number | string;
}


const TextInput = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  min,
  max,
  step,
}: TextInputProps) => {
  return (
    <div className="w-full">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-custom-red-700 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`form-input ${error ? 'border-custom-red-500' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
      />
      {error && (
        <p id={`${name}-error`} className="text-custom-red-700 text-sm mt-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${name}-helper`} className="text-itin-sand-600 text-sm mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default TextInput;
