export const provinceCodes = [
  "CA-AB",
  "CA-BC",
  "CA-MB",
  "CA-NB",
  "CA-NL",
  "CA-NS",
  "CA-NT",
  "CA-NU",
  "CA-ON",
  "CA-PE",
  "CA-QC",
  "CA-SK",
  "CA-YT",
] as const;

export type ProvinceCode = (typeof provinceCodes)[number];

export const provinceNames: Record<ProvinceCode, { en: string; fr: string }> = {
  "CA-AB": { en: "Alberta", fr: "Alberta" },
  "CA-BC": { en: "British Columbia", fr: "Colombie-Britannique" },
  "CA-MB": { en: "Manitoba", fr: "Manitoba" },
  "CA-NB": { en: "New Brunswick", fr: "Nouveau-Brunswick" },
  "CA-NL": { en: "Newfoundland and Labrador", fr: "Terre-Neuve-et-Labrador" },
  "CA-NS": { en: "Nova Scotia", fr: "Nouvelle-Écosse" },
  "CA-NT": { en: "Northwest Territories", fr: "Territoires du Nord-Ouest" },
  "CA-NU": { en: "Nunavut", fr: "Nunavut" },
  "CA-ON": { en: "Ontario", fr: "Ontario" },
  "CA-PE": { en: "Prince Edward Island", fr: "Île-du-Prince-Édouard" },
  "CA-QC": { en: "Quebec", fr: "Québec" },
  "CA-SK": { en: "Saskatchewan", fr: "Saskatchewan" },
  "CA-YT": { en: "Yukon", fr: "Yukon" },
};

export const defaultCanadaTimeZone = "America/Toronto";

const provinceTimeZones: Record<ProvinceCode, string> = {
  "CA-AB": "America/Edmonton",
  "CA-BC": "America/Vancouver",
  "CA-MB": "America/Winnipeg",
  "CA-NB": "America/Moncton",
  "CA-NL": "America/St_Johns",
  "CA-NS": "America/Halifax",
  "CA-NT": "America/Yellowknife",
  "CA-NU": "America/Iqaluit",
  "CA-ON": "America/Toronto",
  "CA-PE": "America/Halifax",
  "CA-QC": "America/Toronto",
  "CA-SK": "America/Regina",
  "CA-YT": "America/Whitehorse",
};

export function isProvinceCode(value: string): value is ProvinceCode {
  return provinceCodes.includes(value as ProvinceCode);
}

export function getProvinceTimeZone(province: ProvinceCode | null): string {
  return province ? provinceTimeZones[province] : defaultCanadaTimeZone;
}
