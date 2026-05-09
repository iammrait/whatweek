"use client";

type Props = {
  metric: string;
  label: string;
  subtext?: string;
};

export function KeywordHero({ metric, label, subtext }: Props) {
  return (
    <div className="keywordHero">
      <span className="keywordHeroMetric">{metric}</span>
      <span className="keywordHeroLabel">{label}</span>
      {subtext && <span className="keywordHeroSubtext">{subtext}</span>}
    </div>
  );
}