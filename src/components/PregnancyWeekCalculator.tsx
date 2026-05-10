"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { addDays, diffInDays, formatLong, parseIsoDate, ymd } from "@/lib/date-math";
import { getIsoWeekNumber, getIsoWeekYear } from "@/lib/week";

type Mode = "lmp" | "due" | "conception";

type Props = {
  locale: Locale;
  todayIso: string;
  defaultLmpIso: string;
};

const TOTAL_PREGNANCY_DAYS = 280;

function computeDueFromLmp(lmp: Date): Date {
  return addDays(lmp, TOTAL_PREGNANCY_DAYS);
}

function computeLmpFromDue(due: Date): Date {
  return addDays(due, -TOTAL_PREGNANCY_DAYS);
}

function computeLmpFromConception(conception: Date): Date {
  return addDays(conception, -14);
}

function trimester(weeks: number): 1 | 2 | 3 {
  if (weeks < 13) return 1;
  if (weeks < 27) return 2;
  return 3;
}

export function PregnancyWeekCalculator({ locale, todayIso, defaultLmpIso }: Props) {
  const isFr = locale === "fr";
  const [mode, setMode] = useState<Mode>("lmp");
  const [lmp, setLmp] = useState(defaultLmpIso);
  const [due, setDue] = useState(() => {
    const initialLmp = parseIsoDate(defaultLmpIso);
    return initialLmp ? ymd(computeDueFromLmp(initialLmp)) : "";
  });
  const [conception, setConception] = useState(() => {
    const initialLmp = parseIsoDate(defaultLmpIso);
    return initialLmp ? ymd(addDays(initialLmp, 14)) : "";
  });

  const today = parseIsoDate(todayIso);

  const result = useMemo(() => {
    let lmpDate: Date | null = null;
    if (mode === "lmp") lmpDate = parseIsoDate(lmp);
    else if (mode === "due") {
      const dueDate = parseIsoDate(due);
      lmpDate = dueDate ? computeLmpFromDue(dueDate) : null;
    } else if (mode === "conception") {
      const conceptionDate = parseIsoDate(conception);
      lmpDate = conceptionDate ? computeLmpFromConception(conceptionDate) : null;
    }
    if (!lmpDate || !today) return null;

    const dueDate = computeDueFromLmp(lmpDate);
    const conceptionDate = addDays(lmpDate, 14);
    const elapsedDays = Math.max(0, diffInDays(today, lmpDate));
    const totalWeeks = Math.floor(elapsedDays / 7);
    const dayInWeek = elapsedDays % 7;
    const remainingDays = Math.max(0, diffInDays(dueDate, today));
    const remainingWeeks = Math.floor(remainingDays / 7);
    const tri = trimester(totalWeeks);
    const milestoneDates: Array<{ week: number; date: Date }> = [];
    for (let w = 4; w <= 40; w += 4) {
      milestoneDates.push({ week: w, date: addDays(lmpDate, w * 7) });
    }
    return {
      lmpDate,
      dueDate,
      conceptionDate,
      elapsedDays,
      totalWeeks,
      dayInWeek,
      remainingDays,
      remainingWeeks,
      trimester: tri,
      milestoneDates,
      isoWeek: getIsoWeekNumber(dueDate),
      isoWeekYear: getIsoWeekYear(dueDate),
      isPast: today.getTime() > dueDate.getTime(),
    } as const;
  }, [mode, lmp, due, conception, today]);

  const trimesterLabel = (tri: 1 | 2 | 3) => {
    if (isFr) return tri === 1 ? "Premier trimestre" : tri === 2 ? "Deuxième trimestre" : "Troisième trimestre";
    return tri === 1 ? "First trimester" : tri === 2 ? "Second trimester" : "Third trimester";
  };

  return (
    <div className="converterCard">
      <div className="converterTabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "lmp"}
          className={mode === "lmp" ? "converterTabActive" : ""}
          onClick={() => setMode("lmp")}
        >
          {isFr ? "Date des dernières règles" : "Last menstrual period"}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "due"}
          className={mode === "due" ? "converterTabActive" : ""}
          onClick={() => setMode("due")}
        >
          {isFr ? "Date prévue d'accouchement" : "Due date"}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "conception"}
          className={mode === "conception" ? "converterTabActive" : ""}
          onClick={() => setMode("conception")}
        >
          {isFr ? "Date de conception" : "Conception date"}
        </button>
      </div>

      <div className="converterPanel">
        {mode === "lmp" && (
          <div>
            <label className="converterLabel" htmlFor="pw-lmp">
              {isFr ? "1er jour des dernières règles" : "First day of last menstrual period"}
            </label>
            <input
              id="pw-lmp"
              className="converterInput"
              type="date"
              value={lmp}
              onChange={(event) => setLmp(event.target.value)}
            />
          </div>
        )}
        {mode === "due" && (
          <div>
            <label className="converterLabel" htmlFor="pw-due">
              {isFr ? "Date prévue d'accouchement" : "Estimated due date"}
            </label>
            <input
              id="pw-due"
              className="converterInput"
              type="date"
              value={due}
              onChange={(event) => setDue(event.target.value)}
            />
          </div>
        )}
        {mode === "conception" && (
          <div>
            <label className="converterLabel" htmlFor="pw-con">
              {isFr ? "Date approximative de conception" : "Estimated conception date"}
            </label>
            <input
              id="pw-con"
              className="converterInput"
              type="date"
              value={conception}
              onChange={(event) => setConception(event.target.value)}
            />
          </div>
        )}

        {result ? (
          <>
            <dl className="converterResults">
              <div>
                <dt>{isFr ? "Vous êtes à" : "You are at"}</dt>
                <dd>
                  <strong>
                    {isFr
                      ? `${result.totalWeeks} semaine${result.totalWeeks === 1 ? "" : "s"} et ${result.dayInWeek} jour${result.dayInWeek === 1 ? "" : "s"}`
                      : `${result.totalWeeks} weeks ${result.dayInWeek} day${result.dayInWeek === 1 ? "" : "s"}`}
                  </strong>{" "}
                  <span className="converterMuted">({trimesterLabel(result.trimester)})</span>
                </dd>
              </div>
              <div>
                <dt>{isFr ? "Date prévue (DPA)" : "Estimated due date"}</dt>
                <dd>{formatLong(result.dueDate, locale)}</dd>
              </div>
              <div>
                <dt>{isFr ? "Date de conception (estimée)" : "Conception date (estimated)"}</dt>
                <dd>{formatLong(result.conceptionDate, locale)}</dd>
              </div>
              <div>
                <dt>{isFr ? "Jours restants" : "Days remaining"}</dt>
                <dd>
                  {result.isPast
                    ? isFr ? "Date dépassée" : "Past due"
                    : `${result.remainingDays} (${result.remainingWeeks} ${isFr ? "sem." : "wk"})`}
                </dd>
              </div>
              <div>
                <dt>{isFr ? "Semaine ISO de la DPA" : "ISO week of due date"}</dt>
                <dd>
                  {isFr ? "Semaine" : "Week"} {result.isoWeek} · {result.isoWeekYear}
                </dd>
              </div>
            </dl>

            <div className="contentSection" style={{ marginTop: "1rem" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>
                {isFr ? "Jalons par groupe de 4 semaines" : "Four-week milestones"}
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">{isFr ? "Semaine" : "Week"}</th>
                      <th scope="col">{isFr ? "Date" : "Date"}</th>
                      <th scope="col">{isFr ? "Trimestre" : "Trimester"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.milestoneDates.map((m) => (
                      <tr key={m.week}>
                        <td>{m.week}</td>
                        <td>{formatLong(m.date, locale)}</td>
                        <td>{trimesterLabel(trimester(m.week))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <p className="converterError">{isFr ? "Date invalide." : "Invalid date."}</p>
        )}

        <p className="converterMuted" style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
          {isFr
            ? "Estimation basée sur la règle de Naegele (280 jours / 40 semaines à partir des dernières règles). Ce n'est pas un avis médical — consultez votre professionnel de la santé."
            : "Estimate based on Naegele's rule (280 days / 40 weeks from last menstrual period). Not medical advice — consult your healthcare provider."}
        </p>
      </div>
    </div>
  );
}
