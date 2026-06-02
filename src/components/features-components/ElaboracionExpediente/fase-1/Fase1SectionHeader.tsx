interface Fase1SectionHeaderProps {
  title: string;
  description: string;
}

export function Fase1SectionHeader({ title, description }: Fase1SectionHeaderProps) {
  return (
    <div className="space-y-1.5 border-b border-slate-100 pb-4">
      <h2 className="text-[18px] font-bold leading-tight text-color-titulos md:text-[20px]">
        {title}
      </h2>
      <p className="max-w-4xl text-[12px] italic leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
