import Link from "next/link";
import { type Dictionary, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  dictionary: Dictionary;
};

export function CitabilityBlock({ locale, dictionary }: Props) {
  return (
    <section className="panel citabilitySection" aria-labelledby="citability-heading">
      <h2 id="citability-heading">{dictionary.citabilityTitle}</h2>
      <p className="citabilityIntro">{dictionary.citabilityIntro}</p>
      <ul className="citabilityList">
        <li>{dictionary.citabilityBulletIso}</li>
        <li>{dictionary.citabilityBulletCanada}</li>
        <li>{dictionary.citabilityBulletData}</li>
      </ul>
      <p className="subtle citabilitySources">
        {locale === "fr" ? "Sources : " : "Sources: "}
        <a href="https://www.iso.org/iso-8601-date-and-time-format.html" rel="nofollow noreferrer" target="_blank">
          ISO.org
        </a>
        {" · "}
        <a href="https://date.nager.at/swagger/index.html" rel="nofollow noreferrer" target="_blank">
          Nager.Date API
        </a>
        {" · "}
        <Link href="/llms.txt">llms.txt</Link>
      </p>
      <p className="subtle">{dictionary.citabilityClosing}</p>
    </section>
  );
}
