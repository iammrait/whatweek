import { getDictionary, type Locale } from "@/lib/i18n";

const DEFAULT_ORIGIN = "https://blog.whatweek.ca";

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
}

type WpPost = {
  id: number;
  link: string;
  title: { rendered: string };
};

export async function BlogTeaser({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const origin = (process.env.BLOG_WP_ORIGIN ?? DEFAULT_ORIGIN).replace(/\/$/, "");

  let posts: WpPost[] = [];
  try {
    const res = await fetch(`${origin}/wp-json/wp/v2/posts?per_page=3&_fields=id,link,title`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return null;
    posts = data as WpPost[];
  } catch {
    return null;
  }

  if (posts.length === 0) return null;

  return (
    <section className="panel blogTeaser" aria-labelledby="blog-teaser-heading">
      <h2 id="blog-teaser-heading">{dictionary.blogTeaserHeading}</h2>
      <p className="subtle">{dictionary.blogTeaserIntro}</p>
      {locale === "fr" ? <p className="subtle blogTeaserLangNote">{dictionary.blogEnglishNote}</p> : null}
      <ul className="blogTeaserList">
        {posts.map((post) => (
          <li key={post.id}>
            <a href={post.link} target="_blank" rel="noopener noreferrer">
              {stripTags(post.title.rendered)}
            </a>
          </li>
        ))}
      </ul>
      <p className="blogTeaserFooter">
        <a href={`${origin}/`} target="_blank" rel="noopener noreferrer">
          {dictionary.blogVisit} →
        </a>
      </p>
    </section>
  );
}
