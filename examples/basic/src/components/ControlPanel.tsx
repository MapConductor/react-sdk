import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ControlPanelProps {
  title: string;
  children: ReactNode;
}

/**
 * The options of a sample, over the map.
 *
 * The title is a button that folds the panel away. Until someone presses it,
 * the screen width decides (`auto`, in CSS): open beside a desktop map, folded
 * to its title on a phone, where an open panel would cover most of the map.
 * Deciding in CSS keeps the server-rendered page and the first paint the same.
 * Folding only hides the body, so the controls keep their state.
 */
export function ControlPanel({ title, children }: ControlPanelProps) {
  const [open, setOpen] = useState<boolean | null>(null);
  const toggle = () => {
    setOpen(current => {
      if (current !== null) return !current;
      // Still `auto`: flip whatever the screen width shows now.
      return typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches;
    });
  };
  const mode = open === null ? 'auto' : open ? 'open' : 'folded';
  return (
    <div className={`control-panel control-panel-${mode}`}>
      <button type="button" className="control-panel-header" aria-expanded={open ?? undefined} onClick={toggle}>
        <h3 className="control-panel-title">{title}</h3>
        <svg className="control-panel-chevron" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M4 10l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="control-panel-body">{children}</div>
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
