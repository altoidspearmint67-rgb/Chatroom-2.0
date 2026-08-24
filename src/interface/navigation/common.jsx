export function SidebarBase({
  children,
  className = "",
}) {
  return (
    <aside
      className={[
        "flex",
        "w-[var(--layout-width-channel-sidebar)]",
        "shrink-0",
        "flex-col",
        "overflow-hidden",

        // Same background the old server rail sat on
        "bg-[var(--md-sys-color-surface-container-high)]",

        "text-[var(--md-sys-color-on-surface)]",
        "[fill:var(--md-sys-color-on-surface)]",

        "max-md:flex-1",

        className,
      ].join(" ")}
    >
      {children}
    </aside>
  );
}