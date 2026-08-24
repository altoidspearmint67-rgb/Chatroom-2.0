const typographyMap = {
  "display-large":
    "text-[3.5625rem] leading-[4rem] font-normal",

  "display-medium":
    "text-[2.8125rem] leading-[3.25rem] font-normal",

  "display-small":
    "text-4xl leading-[2.75rem] font-normal",

  "headline-large":
    "text-[2rem] leading-10 font-normal",

  "headline-medium":
    "text-[1.75rem] leading-9 font-normal",

  "headline-small":
    "text-2xl leading-8 font-normal",

  "title-large":
    "text-[1.375rem] leading-7 font-[550]",

  "title-medium":
    "text-base leading-6 font-[550]",

  "title-small":
    "text-sm leading-5 font-[550]",

  "body-large":
    "text-base leading-6 font-normal break-words",

  "body-medium":
    "text-sm leading-5 font-normal break-words",

  "body-small":
    "text-xs leading-4 font-normal break-words",

  "label-large":
    "text-sm leading-5 font-medium",

  "label-medium":
    "text-xs leading-4 font-medium",

  "label-small":
    "text-[0.6875rem] leading-[0.875rem] font-medium",

  "_messages-medium":
    "font-normal text-[var(--message-size)]",

  "_status-medium":
    "font-normal text-[11px]",
};

export function typography({
  class:
    textClass = "body",

  size = "medium",
} = {}) {
  return (
    typographyMap[
      `${textClass}-${size}`
    ] ||
    typographyMap[
      "body-medium"
    ]
  );
}

export function Text({
  children,

  class:
    textClass,

  className = "",

  size,

  ...rest
}) {
  return (
    <span
      {...rest}
      className={[
        typography({
          class: textClass,
          size,
        }),

        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}