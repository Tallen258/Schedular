import React from 'react';

interface DateTimeInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'date' | 'time' | 'datetime-local';
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  error?: string;
  helperText?: string;
}


const DateTimeInput = ({
  label,
  name,
  value,
  onChange,
  type = 'datetime-local',
  required = false,
  disabled = false,
  min,
  max,
  error,
  helperText,
}: DateTimeInputProps) => {
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
        required={required}
        disabled={disabled}
        min={min}
        max={max}
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

export default DateTimeInput;
