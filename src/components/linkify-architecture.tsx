import type { ReactNode } from "react";

const DEFAULT_STUDIO = "Dílna architektury";
const DEFAULT_URL = "https://www.dilnaarchitektury.cz";

/** Nominativ + genitiv — both appear in copy. */
const STUDIO_PATTERN = /(Dílny architektury|Dílna architektury)/g;

export function ArchitectureStudioLink({
  label = DEFAULT_STUDIO,
  href = DEFAULT_URL,
  className = "underline underline-offset-2 hover:text-[var(--color-moss)]",
}: {
  label?: string;
  href?: string;
  className?: string;
}) {
  return (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

/** Turn every “Dílna/Dílny architektury” in plain text into an outbound link. */
export function linkifyArchitecture(
  text: string,
  href = DEFAULT_URL,
  className = "underline underline-offset-2 hover:text-[var(--color-moss)]",
): ReactNode {
  const parts = text.split(STUDIO_PATTERN);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (part === "Dílna architektury" || part === "Dílny architektury") {
      return (
        <ArchitectureStudioLink key={`${part}-${i}`} label={part} href={href} className={className} />
      );
    }
    return <span key={`t-${i}`}>{part}</span>;
  });
}
