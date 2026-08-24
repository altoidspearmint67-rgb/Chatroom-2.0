export function MenuItem({
  children,

  value,

  onClick,

  disabled = false,

  className = "",

  ...rest
}) {
  return (
    <button
      {...rest}
      type="button"
      data-value={value}
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2 rounded-lg px-3 py-2",
        "text-left text-sm transition",

        disabled
          ? "cursor-not-allowed text-white/25"
          : "text-white/75 hover:bg-white/[0.07] hover:text-white",

        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}