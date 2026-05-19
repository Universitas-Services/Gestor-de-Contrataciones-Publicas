interface Fase1SectionHeaderProps {
  title: string;
  description: string;
}

export function Fase1SectionHeader({ title, description }: Fase1SectionHeaderProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold leading-tight text-[#215ea8] md:text-[34px]">{title}</h2>
      <p className="max-w-4xl text-sm italic text-slate-500 md:text-base">{description}</p>
    </div>
  );
}
