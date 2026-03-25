import React, { useState, useEffect, ChangeEvent } from 'react';

interface FormattedInputProps {
  value: number;
  onChange: (value: number) => void;
  type: 'R$' | '%' | '#';
  className?: string;
  placeholder?: string;
}

const formatValue = (val: number, formatType: 'R$' | '%' | '#') => {
  if (isNaN(val)) return '';
  
  if (formatType === 'R$') {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (formatType === '%') {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    return val.toString();
  }
};

export function FormattedInput({ value, onChange, type, className, placeholder }: FormattedInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Format the initial value or when it changes externally
    if (value === 0 && !displayValue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayValue('');
    } else {
       
      setDisplayValue(formatValue(value, type));
    }
  }, [value, type, displayValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;
    
    // Allow empty input
    if (rawValue === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    if (type === 'R$' || type === '%') {
      // Remove all non-digit characters
      const digitsOnly = rawValue.replace(/\D/g, '');
      
      if (digitsOnly === '') {
        setDisplayValue('');
        onChange(0);
        return;
      }

      // Parse as integer and divide by 100 to get decimal value
      const numericValue = parseInt(digitsOnly, 10) / 100;
      
      // Update display value immediately for smooth typing
      setDisplayValue(numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      
      // Notify parent
      onChange(numericValue);
    } else {
      // For '#' type, just allow numbers
      const numericValue = parseFloat(rawValue);
      setDisplayValue(rawValue);
      if (!isNaN(numericValue)) {
        onChange(numericValue);
      }
    }
  };

  return (
    <input
      type={type === '#' ? 'number' : 'text'}
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}
