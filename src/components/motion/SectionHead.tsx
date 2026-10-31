// Brand-card motif: "CIRMANO / SECTION ······ 03 / 10" over a hairline.
export function SectionHead({ label, page, total = 10 }: { label: string; page: number; total?: number }) {
  return (
    <div className="section-head">
      <span className="section-head__label">CIRMANO / {label}</span>
      <span className="section-head__page" aria-hidden="true">
        {String(page).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}
