export function Ripple() {
  return (
    <span
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        inset-0
        rounded-[inherit]
        bg-current
        opacity-0
        transition-opacity
        duration-150
        group-active:opacity-[0.10]
      "
    />
  );
}