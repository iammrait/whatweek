"use client";

import { provinceCodes, provinceNames, type ProvinceCode } from "@/lib/provinces";
import { type WeekSystem } from "@/lib/week";

type Props = {
  provinceLabel: string;
  allCanadaLabel: string;
  applyLabel: string;
  locale: "en" | "fr";
  year: number;
  selectedProvince: ProvinceCode | null;
  system: WeekSystem;
};

export function ProvinceSelect({
  provinceLabel,
  allCanadaLabel,
  applyLabel,
  locale,
  year,
  selectedProvince,
  system,
}: Props) {
  return (
    <form method="GET" className="provinceForm">
      <input type="hidden" name="year" value={year} />
      {system === "iso" ? <input type="hidden" name="system" value="iso" /> : null}
      <label htmlFor="province-select">{provinceLabel}</label>
      <select
        id="province-select"
        name="province"
        defaultValue={selectedProvince ?? ""}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        <option value="">{allCanadaLabel}</option>
        {provinceCodes.map((code) => (
          <option key={code} value={code}>
            {provinceNames[code][locale]} ({code.replace("CA-", "")})
          </option>
        ))}
      </select>
      <button type="submit" aria-label={applyLabel}>
        {applyLabel}
      </button>
    </form>
  );
}
