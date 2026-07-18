import type React from "react";

export function AdminPageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-manrope text-3xl font-bold text-[var(--color-text-main)]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
      </div>
      {action}
    </div>
  );
}
