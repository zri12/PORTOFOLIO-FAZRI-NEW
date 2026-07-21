# Google SEO and Search Console

## Included

- Per-page title, description, canonical URL, robots directives, Open Graph, and Twitter metadata.
- `Blog` and `BlogPosting` JSON-LD on article routes.
- Public `robots.txt` and a Vercel sitemap endpoint that reads published article slugs from Supabase.
- A Google Search Console verification field in Admin > Site Settings.

## Search Console Setup

1. Deploy the latest site and database migration.
2. Open Google Search Console and add the domain property `fazrilukman.id`.
3. Prefer DNS TXT verification because it verifies every protocol and subdomain. Add the TXT value through the DNS provider.
4. For URL-prefix verification, copy only the meta tag `content` value into Admin > Site Settings > Google Search Console Verification Code, then save and redeploy or reload the public site.
5. Submit `https://fazrilukman.id/sitemap.xml` in Search Console.
6. Request indexing for the home page, blog archive, and important published articles.

Search position cannot be guaranteed by code. Ranking also depends on content relevance, crawl time, domain authority, links, competition, and Google's indexing systems. The implementation provides the technical foundation; useful original articles and ongoing Search Console monitoring remain necessary.
