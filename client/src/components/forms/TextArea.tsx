import React from 'react';

interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  error?: string;
  helperText?: string;
}

const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  error,
  helperText,
}: TextAreaProps) => {
  return (
    <div className="w-full">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-custom-red-700 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`form-input resize-y ${error ? 'border-custom-red-500' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
      />
      {maxLength && (
        <div className="text-right text-sm text-itin-sand-600 mt-1">
          {value.length}/{maxLength}
        </div>
      )}
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

export default TextArea;
