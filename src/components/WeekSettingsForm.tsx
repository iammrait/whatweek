"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n";
import {
  builtInPresets,
  isFirstDay,
  isWeekRule,
  PRESETS_STORAGE_KEY,
  slugifyPresetId,
  type FirstDay,
  type SettingsPreset,
  type WeekRule,
} from "@/lib/settings-presets";

type Props = {
  locale: Locale;
  initialFirstDay: FirstDay;
  initialRule: WeekRule;
  /** Optional preset id from ?preset=<id> in URL — applied if found in localStorage. */
  initialPresetId?: string;
};

const COOKIE_FIRST_DAY = "ww_first_day";
const COOKIE_WEEK_RULE = "ww_week_rule";

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

const EMPTY_PRESETS: SettingsPreset[] = [];
let cachedPresets: SettingsPreset[] = EMPTY_PRESETS;
let cachedSerialized: string | null = null;

function readPresetsFromStorage(): SettingsPreset[] {
  if (typeof window === "undefined") return EMPTY_PRESETS;
  try {
    const raw = window.localStorage.getItem(PRESETS_STORAGE_KEY);
    if (raw === cachedSerialized) return cachedPresets;
    cachedSerialized = raw;
    if (!raw) {
      cachedPresets = EMPTY_PRESETS;
      return cachedPresets;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      cachedPresets = EMPTY_PRESETS;
      return cachedPresets;
    }
    cachedPresets = parsed
      .filter((entry): entry is SettingsPreset => {
        if (!entry || typeof entry !== "object") return false;
        const obj = entry as Record<string, unknown>;
        return (
          typeof obj.id === "string" &&
          typeof obj.name === "string" &&
          typeof obj.firstDay === "string" &&
          isFirstDay(obj.firstDay) &&
          typeof obj.rule === "string" &&
          isWeekRule(obj.rule)
        );
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    return cachedPresets;
  } catch {
    cachedPresets = EMPTY_PRESETS;
    return cachedPresets;
  }
}

const presetSubscribers = new Set<() => void>();

function subscribePresets(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  presetSubscribers.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (event.key === PRESETS_STORAGE_KEY) {
      cachedSerialized = null;
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    presetSubscribers.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function notifyPresetSubscribers() {
  cachedSerialized = null;
  for (const cb of presetSubscribers) cb();
}

function getServerPresets(): SettingsPreset[] {
  return EMPTY_PRESETS;
}

function saveStoredPresets(presets: SettingsPreset[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
    notifyPresetSubscribers();
  } catch {
    // ignore quota / privacy errors
  }
}

type FormOverride = {
  firstDay?: FirstDay;
  rule?: WeekRule;
  hasPresetSelection?: boolean;
  presetId?: string | null;
};

export function WeekSettingsForm({ locale, initialFirstDay, initialRule, initialPresetId }: Props) {
  const isFr = locale === "fr";
  const storedPresets = useSyncExternalStore(subscribePresets, readPresetsFromStorage, getServerPresets);
  const allPresets = useMemo(() => [...builtInPresets, ...storedPresets], [storedPresets]);

  const [override, setOverride] = useState<FormOverride>({});
  const [savedSnapshot, setSavedSnapshot] = useState<{
    firstDay: FirstDay;
    rule: WeekRule;
  } | null>(null);
  const [presetName, setPresetName] = useState("");

  // Resolve the active ?preset=<id> against built-ins (always available) and
  // user-saved presets (after the localStorage subscription hydrates).
  const initialPresetMatch = useMemo(() => {
    if (!initialPresetId) return null;
    return allPresets.find((p) => p.id === initialPresetId) ?? null;
  }, [initialPresetId, allPresets]);

  // Effective values: explicit user override > URL preset match > initial cookie/url.
  const firstDay: FirstDay = override.firstDay ?? initialPresetMatch?.firstDay ?? initialFirstDay;
  const rule: WeekRule = override.rule ?? initialPresetMatch?.rule ?? initialRule;
  const activePresetId = override.hasPresetSelection
    ? override.presetId ?? null
    : initialPresetMatch?.id ?? null;

  const saved = Boolean(
    savedSnapshot && savedSnapshot.firstDay === firstDay && savedSnapshot.rule === rule,
  );

  const setFirstDay = (next: FirstDay) =>
    setOverride((prev) => ({
      ...prev,
      firstDay: next,
      hasPresetSelection: true,
      presetId: null,
    }));

  const setRule = (next: WeekRule) =>
    setOverride((prev) => ({
      ...prev,
      rule: next,
      hasPresetSelection: true,
      presetId: null,
    }));

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.searchParams.delete("preset");
    url.searchParams.set("firstDay", firstDay);
    url.searchParams.set("rule", rule);
    return url.toString();
  }, [firstDay, rule]);

  const presetShareUrl = useMemo(() => {
    if (typeof window === "undefined" || !activePresetId) return "";
    const url = new URL(window.location.href);
    url.searchParams.delete("firstDay");
    url.searchParams.delete("rule");
    url.searchParams.set("preset", activePresetId);
    return url.toString();
  }, [activePresetId]);

  const onSave = () => {
    setCookie(COOKIE_FIRST_DAY, firstDay);
    setCookie(COOKIE_WEEK_RULE, rule);
    setSavedSnapshot({ firstDay, rule });
  };

  const onCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const onReset = () => {
    setOverride({
      firstDay: "monday",
      rule: "iso",
      hasPresetSelection: true,
      presetId: null,
    });
    setCookie(COOKIE_FIRST_DAY, "");
    setCookie(COOKIE_WEEK_RULE, "");
    setSavedSnapshot({ firstDay: "monday", rule: "iso" });
  };

  const onApplyPreset = (presetId: string) => {
    const match = allPresets.find((p) => p.id === presetId);
    if (!match) return;
    setOverride({
      firstDay: match.firstDay,
      rule: match.rule,
      hasPresetSelection: true,
      presetId: match.id,
    });
  };

  const onSavePreset = () => {
    const trimmed = presetName.trim();
    if (!trimmed) return;
    const id = slugifyPresetId(trimmed) || `preset-${Date.now()}`;
    const next: SettingsPreset = {
      id,
      name: trimmed,
      firstDay,
      rule,
      updatedAt: new Date().toISOString(),
    };
    const filtered = storedPresets.filter((p) => p.id !== id);
    const updated = [next, ...filtered];
    saveStoredPresets(updated);
    setOverride((prev) => ({
      ...prev,
      firstDay,
      rule,
      hasPresetSelection: true,
      presetId: id,
    }));
    setPresetName("");
  };

  const onDeletePreset = (presetId: string) => {
    const updated = storedPresets.filter((p) => p.id !== presetId);
    saveStoredPresets(updated);
    if (activePresetId === presetId) {
      setOverride((prev) => ({
        ...prev,
        hasPresetSelection: true,
        presetId: null,
      }));
    }
  };

  return (
    <div className="converterCard">
      <div className="converterPanel">
        <div>
          <label className="converterLabel" htmlFor="ws-first-day">
            {isFr ? "Premier jour de la semaine" : "First day of the week"}
          </label>
          <select id="ws-first-day" className="converterInput" value={firstDay} onChange={(e) => setFirstDay(e.target.value as FirstDay)}>
            <option value="monday">{isFr ? "Lundi (ISO 8601)" : "Monday (ISO 8601)"}</option>
            <option value="sunday">{isFr ? "Dimanche (Canada / É.-U.)" : "Sunday (Canada / US)"}</option>
            <option value="saturday">{isFr ? "Samedi (Moyen-Orient)" : "Saturday (Middle East)"}</option>
          </select>
        </div>

        <div>
          <label className="converterLabel" htmlFor="ws-rule">
            {isFr ? "Règle de la semaine 1" : "Week 1 rule"}
          </label>
          <select id="ws-rule" className="converterInput" value={rule} onChange={(e) => setRule(e.target.value as WeekRule)}>
            <option value="iso">{isFr ? "ISO 8601 — semaine du premier jeudi" : "ISO 8601 — first Thursday week"}</option>
            <option value="first-day">{isFr ? "Semaine contenant le 1ᵉʳ janvier" : "Week containing January 1"}</option>
            <option value="first-four-day">{isFr ? "Première semaine de 4+ jours dans l'année" : "First week with 4+ days in year"}</option>
          </select>
        </div>

        <div className="ctaRow">
          <button type="button" className="ctaPrimary" onClick={onSave}>
            {isFr ? "Enregistrer" : "Save settings"}
          </button>
          <button type="button" className="ctaSecondary" onClick={onReset}>
            {isFr ? "Réinitialiser" : "Reset"}
          </button>
          <button type="button" className="ctaSecondary" onClick={() => onCopy(shareUrl)}>
            {isFr ? "Copier le lien" : "Copy link"}
          </button>
        </div>

        {saved && (
          <p className="subtle" role="status">
            {isFr ? "Préférences enregistrées dans un cookie sur cet appareil." : "Preferences saved in a cookie on this device."}
          </p>
        )}

        <hr style={{ borderColor: "var(--line)", margin: "1rem 0" }} />

        <h3 style={{ marginBottom: "0.5rem" }}>
          {isFr ? "Préréglages partageables" : "Shareable presets"}
        </h3>
        <p className="subtle" style={{ marginTop: 0 }}>
          {isFr
            ? "Sauvegardez vos paramètres avec un nom, puis partagez le lien ?preset=<id>. Les préréglages sont stockés localement (localStorage)."
            : "Save your settings with a name, then share the ?preset=<id> link. Presets live in your browser (localStorage)."}
        </p>

        <div className="converterRow" style={{ gap: "0.75rem" }}>
          <div style={{ flex: "1 1 220px" }}>
            <label className="converterLabel" htmlFor="ws-preset-name">
              {isFr ? "Nom du préréglage" : "Preset name"}
            </label>
            <input
              id="ws-preset-name"
              className="converterInput"
              type="text"
              maxLength={48}
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              placeholder={isFr ? "Ex. Paie biweekly ON" : "e.g. ON biweekly payroll"}
            />
          </div>
          <div style={{ flex: "0 1 200px", display: "flex", alignItems: "flex-end" }}>
            <button type="button" className="ctaSecondary" onClick={onSavePreset} disabled={!presetName.trim()}>
              {isFr ? "Enregistrer le préréglage" : "Save preset"}
            </button>
          </div>
        </div>

        {allPresets.length > 0 && (
          <div className="contentSection" style={{ marginTop: "1rem" }}>
            <h4 style={{ marginBottom: "0.4rem" }}>
              {isFr ? "Préréglages disponibles" : "Available presets"}
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
              {allPresets.map((preset) => {
                const isBuiltIn = builtInPresets.some((p) => p.id === preset.id);
                const isActive = preset.id === activePresetId;
                return (
                  <li
                    key={preset.id}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.4rem 0.6rem",
                      border: `1px solid var(--line)`,
                      borderRadius: 8,
                      background: isActive ? "var(--accent-light)" : "transparent",
                    }}
                  >
                    <div>
                      <strong>{preset.name}</strong>{" "}
                      <span className="subtle" style={{ fontSize: "0.85rem" }}>
                        · {preset.firstDay} · {preset.rule}
                      </span>
                      {isBuiltIn && (
                        <span className="subtle" style={{ marginLeft: "0.4rem", fontSize: "0.8rem" }}>
                          ({isFr ? "intégré" : "built-in"})
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <button type="button" className="ctaSecondary" onClick={() => onApplyPreset(preset.id)}>
                        {isFr ? "Appliquer" : "Apply"}
                      </button>
                      <button
                        type="button"
                        className="ctaSecondary"
                        onClick={() => {
                          if (typeof window === "undefined") return;
                          const url = new URL(window.location.href);
                          url.searchParams.delete("firstDay");
                          url.searchParams.delete("rule");
                          url.searchParams.set("preset", preset.id);
                          onCopy(url.toString());
                        }}
                      >
                        {isFr ? "Copier le lien" : "Copy link"}
                      </button>
                      {!isBuiltIn && (
                        <button
                          type="button"
                          className="ctaSecondary"
                          onClick={() => onDeletePreset(preset.id)}
                          aria-label={isFr ? "Supprimer" : "Delete"}
                        >
                          {isFr ? "Supprimer" : "Delete"}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {presetShareUrl && (
          <p className="converterMuted" style={{ wordBreak: "break-all", marginTop: "0.5rem" }}>
            <strong>{isFr ? "Lien du préréglage" : "Preset link"} :</strong> <code>{presetShareUrl}</code>
          </p>
        )}

        {shareUrl && (
          <p className="converterMuted" style={{ wordBreak: "break-all" }}>
            <strong>{isFr ? "Lien direct" : "Direct link"} :</strong> <code>{shareUrl}</code>
          </p>
        )}

        <details>
          <summary>{isFr ? "Comment c'est appliqué ?" : "How is this applied?"}</summary>
          <p style={{ marginTop: "0.5rem" }}>
            {isFr
              ? "Vos préférences se synchronisent avec un cookie et avec les paramètres d'URL ?firstDay=… et ?rule=…. Les préréglages nommés sont stockés dans localStorage et s'appliquent via ?preset=<id> sur cet appareil."
              : "Your preferences sync with a cookie and the URL params ?firstDay=… and ?rule=…. Named presets live in localStorage and apply via ?preset=<id> on this device."}
          </p>
        </details>
      </div>
    </div>
  );
}
