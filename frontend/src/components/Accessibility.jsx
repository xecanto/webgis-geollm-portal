import { h } from 'preact';

/**
 * SkipLink component - Allows keyboard users to skip navigation
 * and go directly to the main content
 */
export const SkipLink = () => (
  <a 
    href="#main" 
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#1A936F] text-[#F0F3BD] z-50 px-4 py-2 rounded-md"
  >
    Skip to main content
  </a>
);

/**
 * VisuallyHidden component - Hides content visually but keeps it accessible to screen readers
 */
export const VisuallyHidden = ({ children }) => (
  <span className="sr-only">{children}</span>
);

/**
 * A more accessible button component with proper aria attributes
 */
export const AccessibleButton = ({ 
  children, 
  onClick, 
  ariaLabel, 
  ariaExpanded, 
  ariaControls,
  className,
  disabled = false,
  type = 'button'
}) => (
  <button
    type={type}
    onClick={onClick}
    aria-label={ariaLabel}
    aria-expanded={ariaExpanded}
    aria-controls={ariaControls}
    disabled={disabled}
    className={`focus-visible ${className}`}
  >
    {children}
  </button>
);

/**
 * A more accessible modal component
 */
export const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  className
}) => {
  if (!isOpen) return null;
  
  // Close on escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  // Focus trap - keep focus inside modal when open
  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative bg-[#1B263B] rounded-lg p-6 max-w-md mx-auto">
        <h2 id="modal-title" className="text-xl font-bold mb-4">{title}</h2>
        
        {children}
        
        <button
          className="absolute top-3 right-3 text-[#F0F3BD]/70 hover:text-[#F0F3BD] focus-visible"
          onClick={onClose}
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
};

/**
 * Custom select component with proper accessibility
 */
export const AccessibleSelect = ({
  id,
  label,
  options,
  value,
  onChange,
  className
}) => (
  <div className={className}>
    <label 
      htmlFor={id}
      className="block mb-2 text-sm font-medium text-[#F0F3BD]"
    >
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="block w-full px-4 py-2 bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A936F] text-[#F0F3BD] appearance-none"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <span className="material-symbols-outlined text-[#1A936F]">expand_more</span>
      </div>
    </div>
  </div>
);

/**
 * Accessible Toggle Switch component
 */
export const ToggleSwitch = ({
  id,
  label,
  checked,
  onChange,
  className
}) => (
  <div className={`flex items-center ${className}`}>
    <label 
      htmlFor={id}
      className="relative inline-flex items-center cursor-pointer"
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div className={`
        w-11 h-6 bg-[#1B263B]/50 rounded-full peer 
        border border-[#1A936F]/30
        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
        after:bg-[#F0F3BD] after:rounded-full after:h-5 after:w-5 
        after:transition-all peer-checked:after:translate-x-full 
        peer-checked:after:bg-[#F0F3BD] peer-checked:bg-[#1A936F]
        peer-focus:ring-2 peer-focus:ring-[#1A936F]/40
      `}></div>
      <span className="ml-3 text-sm font-medium text-[#F0F3BD]">{label}</span>
    </label>
  </div>
);
