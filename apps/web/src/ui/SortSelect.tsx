import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ArrowUpDown } from 'lucide-react';

export type SortSelectOption = {
  value: string;
  group: string;
  label: string;
};

type Props = {
  value: string;
  options: SortSelectOption[];
  onChange: (value: string) => void;
  label?: string;
};

export function SortSelect({
  value,
  options,
  onChange,
  label = 'Sort by',
}: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const selected = options[selectedIndex];

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function openMenu() {
    setActive(selectedIndex);
    setOpen(true);
  }

  function select(index: number) {
    onChange(options[index].value);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        openMenu();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(active);
    }
  }

  return (
    <div ref={ref} className="relative" onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`group flex h-11 items-center gap-3 rounded-xl border bg-surface pl-3 pr-3.5 text-left shadow-sm outline-none transition hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 ${
          open ? 'border-primary/40 ring-2 ring-primary/20' : 'border-border'
        }`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          <ArrowUpDown className="h-3.5 w-3.5" />
        </span>

        <span className="flex flex-col leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="text-sm font-medium text-foreground">
            {selected.group}
            <span className="mx-1.5 text-muted-foreground/50">·</span>
            <span className="text-muted-foreground">{selected.label}</span>
          </span>
        </span>

        <ChevronDown
          className={`ml-1 h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            open ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-30 mt-2 w-72 origin-top-right rounded-2xl border border-border bg-surface p-1.5 shadow-2xl ring-1 ring-black/5"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === active;
            const showGroup =
              index === 0 || options[index - 1].group !== option.group;

            return (
              <div key={option.value}>
                {showGroup && (
                  <p
                    className={`px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ${
                      index === 0 ? 'pt-2' : 'mt-1 border-t border-border pt-3'
                    }`}
                  >
                    {option.group}
                  </p>
                )}

                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => select(index)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                    isSelected
                      ? 'bg-primary/10 font-medium text-primary'
                      : isActive
                        ? 'bg-muted text-foreground'
                        : 'text-foreground/80'
                  }`}
                >
                  {option.label}
                  {isSelected && <Check className="h-4 w-4" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
