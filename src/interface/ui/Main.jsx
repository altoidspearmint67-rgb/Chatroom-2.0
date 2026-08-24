export const mainClassName = `
  flex
  min-h-0
  min-w-0
  flex-1
  flex-col
  overflow-hidden

  mx-[var(--gap-md)]
  mb-[var(--gap-md)]
  px-[var(--gap-md)]

  rounded-[var(--borderRadius-xl)]

  bg-[var(--md-sys-color-surface-container-lowest)]

  max-md:m-0
  max-md:rounded-none
`;

export function Main({
  children,

  className = "",

  ...rest
}) {
  return (
    <main
      {...rest}
      className={[
        mainClassName,
        className,
      ].join(" ")}
    >
      {children}
    </main>
  );
}