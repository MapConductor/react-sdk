import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ControlPanelProps {
  title: string;
  children: ReactNode;
}

export function ControlPanel({ title, children }: ControlPanelProps) {
  return (
    <div className="control-panel">
      <h3 className="control-panel-title">{title}</h3>
      {children}
    </div>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
  debounce?: number;
  onChange: (value: number) => void;
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step = 0.01,
  format,
  debounce: debounceMs,
  onChange,
}: SliderControlProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setLocalValue(value); }, [value]);

  const handleChange = (next: number) => {
    setLocalValue(next);
    if (debounceMs) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onChange(next), debounceMs);
    } else {
      onChange(next);
    }
  };

  return (
    <div className="slider-control">
      <div className="slider-label">
        <span>{label}</span>
        <span>{format ? format(localValue) : localValue.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={event => handleChange(parseFloat(event.target.value))}
      />
    </div>
  );
}
