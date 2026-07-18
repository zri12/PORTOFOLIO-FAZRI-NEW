import { usePortfolioData } from "../../hooks/usePortfolioData";

export function BrandMark({ className = "", imageClassName = "" }: { className?: string; imageClassName?: string }) {
  const { profile } = usePortfolioData();

  return (
    <div className={`flex items-center justify-center overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)] ${className}`}>
      {profile.logoUrl ? (
        <img src={profile.logoUrl} alt={`${profile.displayName || "Fazri"} logo`} className={`h-full w-full object-contain ${imageClassName}`} />
      ) : (
        <span className="font-manrope font-bold text-[var(--color-accent-main)]">FL</span>
      )}
    </div>
  );
}
