import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeConfig = {
  sm: {
    track: 'w-8 h-5',
    thumb: 'w-3.5 h-3.5',
    translate: 14,
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-4.5 h-4.5',
    translate: 20,
  },
};

/**
 * Toggle switch component with smooth animations
 */
export const Toggle = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
}: ToggleProps) => {
  const config = sizeConfig[size];

  return (
    <label
      className={`
        inline-flex items-start gap-3 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex shrink-0 items-center rounded-full
          transition-colors duration-normal
          focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2
          ${config.track}
          ${checked 
            ? 'bg-accent-primary' 
            : 'bg-bg-tertiary border border-border-subtle'
          }
        `}
      >
        <motion.span
          className={`
            absolute left-0.5 rounded-full bg-white shadow-sm
            ${config.thumb}
          `}
          initial={false}
          animate={{
            x: checked ? config.translate : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-text-primary">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-text-secondary mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

/**
 * Toggle group for selecting between multiple options
 */
interface ToggleGroupProps<T extends string> {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export const ToggleGroup = <T extends string>({
  options,
  value,
  onChange,
  className = '',
}: ToggleGroupProps<T>) => {
  return (
    <div
      className={`
        inline-flex items-center gap-1 p-1 rounded-lg
        bg-bg-secondary border border-border-subtle
        ${className}
      `}
    >
      {options.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            relative flex items-center gap-2 px-3 py-1.5 rounded-md
            text-sm font-medium transition-colors
            ${value === option.value
              ? 'text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {option.icon}
          <span>{option.label}</span>
          
          {value === option.value && (
            <motion.div
              layoutId="toggleGroupActive"
              className="absolute inset-0 rounded-md bg-bg-tertiary -z-10"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};

