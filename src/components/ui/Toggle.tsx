interface ToggleProps {
  checked: boolean
  disabled?: boolean
  onChange: () => void
  label?: string
}

export function Toggle({ checked, disabled, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        if (!disabled) onChange()
      }}
      onPointerDown={(event) => event.stopPropagation()}
      className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors ${
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
      } ${checked ? 'bg-publish' : 'bg-gray-200'}`}
    >
      <span
        className={`absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-[16px]' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
