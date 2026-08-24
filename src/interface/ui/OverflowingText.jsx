export function OverflowingText({
  children,

  className = "",

  ...rest
}) {
  return (
    <div
      {...rest}
      className={[
        "min-w-0 overflow-hidden whitespace-nowrap text-ellipsis",
        "[&_*]:overflow-hidden [&_*]:whitespace-nowrap [&_*]:text-ellipsis",

        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}