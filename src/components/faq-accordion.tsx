"use client";

import { useId, useState } from "react";

type Faq = { q: string; a: string };

export function FaqAccordion({ items }: { items: readonly Faq[] }) {
  const baseId = useId();
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const toggle = (index: number) => {
    setOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="mt-10 border-y border-[var(--color-line)]">
      {items.map((f, index) => {
        const isOpen = Boolean(open[index]);
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <article
            key={f.q}
            itemScope
            itemType="https://schema.org/Question"
            className="border-b border-[var(--color-line)] last:border-b-0"
          >
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors hover:text-[var(--color-moss)]"
              >
                <span itemProp="name" className="pr-2 font-medium text-[var(--color-ink)]">
                  {f.q}
                </span>
                <span
                  aria-hidden
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--color-line)] text-lg leading-none text-[var(--color-moss)] transition-transform duration-300 ${
                    isOpen ? "rotate-45 bg-[var(--color-moss)] text-[var(--color-paper)]" : ""
                  }`}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden" inert={isOpen ? undefined : true}>
                <div
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                  className="max-w-prose pb-5 text-sm leading-relaxed text-[var(--color-ink-soft)] sm:text-base"
                >
                  <p itemProp="text">{f.a}</p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
