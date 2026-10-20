# Edgardo Gabriel Paclibar - Portfolio

A responsive portfolio for aspiring software engineer Edgardo Gabriel Paclibar. It is built with Next.js, React, TypeScript, Tailwind CSS, and Motion.

The included development and build scripts use Next.js's Webpack mode so the project also works reliably from OneDrive-synced Windows folders.

## Run locally

Use Node.js 24.x, matching the Vercel runtime pinned in `package.json`.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Available checks and production commands:

```bash
npm run lint
npm test
npm run build
npm start
```

Run `npm start` only after `npm run build` completes.

## Project index

Open **Project index** in the header, or press **Ctrl+K** on Windows/Linux and **Command+K** on macOS. The index searches all 17 existing selected and archive projects by name, category, summary, and technology. Use the arrow keys to browse, Enter to open a case study, or click a project. Desktop visitors get an animated poster preview, the documented summary, technology tags, and case-study/source links; smaller screens use a compact project list.

The native modal dialog keeps keyboard focus inside, closes with Escape or a backdrop click, restores focus and page scrolling, and respects reduced motion. It is available on the homepage and case-study pages. It reads the same approved content as the existing project collection and adds no dependency or external service. Research references and the design choice are documented in `docs/portfolio-inspiration.md`.

## GitHub contribution calendar

The calendar loads the public contribution graph for `Gabbu69` through `GET /api/github-activity`. It needs no token, database, or third-party service. The server reads GitHub's public contribution HTML and returns only validated dates, daily counts, intensity levels, the annual total, and the successful fetch time. Project cards are curated separately; LabTrack QR is excluded from those cards, while the contribution calendar shows the account-wide totals visible on GitHub.

The server caches successful normalized data for one hour, refreshing when a request arrives after that period. It does not cache unchecked upstream HTML. A failed or malformed refresh preserves the previous successful calendar. When no valid cached result exists, the API returns a generic HTTP 503 and the UI offers the GitHub profile link. The API response itself uses `Cache-Control: no-store`, so the persistent server cache controls freshness without a second browser/CDN cache layer.

This uses GitHub's own public HTML rather than a documented calendar API, so markup changes may require a parser update. The parser joins each dated cell with its associated tooltip, validates a complete contiguous date range, and checks the annual total against daily counts. GitHub may take up to 24 hours to count a new qualifying contribution; hourly refresh does not make contribution processing instantaneous. The displayed `fetchedAt` means the data was checked at that time, and dates retain GitHub's calendar values. See [GitHub's contribution reference](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference) and [contribution delays](https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/troubleshooting-missing-contributions).

`npm test` covers reordered cells/tooltips, counts, empty valid calendars, invalid dates and totals, malformed responses, and loader failures. To verify persistent cache behavior after a production build, run:

```bash
npm run build
npm run test:github-cache
```

The cache check copies the production build into a disposable directory under ignored `work/`, excluding the original cache. A separate child server uses simulated upstream responses and a controlled clock to verify cold-cache HTTP 503, hourly refresh, preservation after malformed HTTP 200 and transport failure, and recovery. Its fixtures and cache never enter the actual preview's `.next/cache`; the application has no public test controls.

For a browser check of the unavailable state, `npm run test:github-cache -- --preview-unavailable` keeps a separate isolated preview running and prints its local URL and control-file path. Set `shutdown` to `true` in that isolated control file when finished; the helper stops the server and removes its disposable files.

## Appearance and motion

The English editorial presentation is in `src/app/editorial.css`, with shared component foundations in `src/app/globals.css` and app details/contact styling in `src/app/case-study.css`. The hero keeps the existing portrait, a vermilion sun, and an opening paper-shutter animation. Its layout changes for phones rather than shrinking the desktop composition. Personal location labels and the moving process strip have been removed; geographical names describing actual projects and organizations remain.

The header's day/night button follows the system preference initially and saves an explicit choice under `gab-portfolio-theme`. An early initialization script applies it before hydration; changes also sync across tabs. Supporting browsers reveal the new palette from the button, while reduced-motion users get an immediate switch.

Keep responsive checks at 320px, 390px, 768px, and desktop width when changing the design. Check both themes, keyboard navigation, menu dismissal, project search/reset, toolkit selection, and reduced-motion styling. Browser viewport checks do not replace physical iOS/Android device testing.

## Edit portfolio content

The main content source is [`src/data/portfolio.ts`](src/data/portfolio.ts). Edit its exported objects and arrays to change the profile, introduction, OJT details, projects, skills, links, and contact information. Keeping content in this file avoids having to rewrite the page components.

Images belong in [`public/images`](public/images). Reference them from the data file with a root-relative path such as `/images/project-name.webp`.

When replacing images:

- Prefer optimized `.webp`, `.avif`, or `.svg` files.
- Use short lowercase filenames with hyphens.
- Keep screenshots free of patient records, credentials, private dashboards, and other confidential information.
- Add useful alternative text in the matching content entry.

The search and social metadata also read the public name, role, email address, portrait, and GitHub account from this data file. Their presentation is configured in `src/app/layout.tsx`.

## Add a project

1. Add the project image to `public/images`.
2. In `src/data/portfolio.ts`, copy one existing item from the projects list.
3. Replace its `title`, `eyebrow`, `category`, `featured`, `summary`, optional `note`, `stack`, `repo`, and optional `live` values.
4. Configure `visual` as either an image with `src`, `alt`, and optional `fit`, or another visual kind already supported by the page.
5. Add a stable `slug` and matching `caseStudy` entry. Use a public repository or demo URL, or omit the optional link instead of adding a placeholder.
6. Run the lint, TypeScript, test, and build commands before publishing.

Follow the exact shape of an existing project item. TypeScript will flag required fields that are missing or invalid.

## App case studies

All 17 selected/archive apps have shareable `/projects/[slug]` pages. The homepage retains search and categories and adds a **View details** link to every project. Each page covers purpose and audience, features, workflow, technical layers, limitations, and evidence. Unknown slugs return HTTP 404. Case-study URLs have individual metadata/canonical URLs and appear in the sitemap.

Content is typed in `src/data/case-studies.ts` and connected to cards through `src/data/portfolio.ts`. `src/data/project-evidence.json` records public repository commits and documents reviewed on October 12, 2026. Evidence links use those snapshots, rather than fetching GitHub at runtime. Update the content and evidence together when capabilities change. The USM Hospital case study uses only the previously approved portfolio summary and assets because its source repository is private. LabTrack QR remains excluded.

Keep local-first data, demo data, serverless storage, configured services, and physical-device acceptance distinct. A demo link does not establish current backend setup or production adoption.

## On-page messages to Gmail

Visitors write their **Name**, **Email**, and **Message** inside the portfolio. The `@formspree/react` integration submits asynchronously and keeps success/errors on the same page. Replies happen by email; the portfolio does not store an on-site conversation. The contact form preserves input after failure, prevents duplicate pending submission, and includes Formspree's `_gotcha` honeypot.

The form is intentionally unavailable until an owner-controlled Formspree form is configured. A copy-email action remains available, including an address-selection fallback when clipboard access is denied. Never use a fake form ID or show successful delivery for an unconfigured form.

Owner setup:

1. Sign in to [Formspree](https://formspree.io/) and create a portfolio contact form. Configure **gabriellimjuco@gmail.com** as the notification recipient and complete recipient verification in your own inbox.
2. Set the public form ID (the final part of `https://formspree.io/f/FORM_ID`) as `NEXT_PUBLIC_FORMSPREE_FORM_ID` in an ignored `.env.local` for local use and in Vercel for the intended deployment. `.env.example` contains placeholders. This form ID is public; Gmail passwords or Google account access are unnecessary.
3. Keep Formspree's provider spam filtering enabled. If the form requires a CAPTCHA, configure custom **reCAPTCHA v3** in Formspree using its [React integration guide](https://help.formspree.io/articles/working-with-react/using-a-custom-recaptcha-with-formspree-react). Configure its secret only in Formspree, its allowed local/production hostnames in Google, and its public key as `NEXT_PUBLIC_FORMSPREE_RECAPTCHA_SITE_KEY` in the website. The form obtains a fresh token at submit time and reports script/token failures without losing input. Do not disable a required CAPTCHA to bypass a failed check.
4. Redeploy after changing public environment values. Verify a real submission arrives in Gmail and that **Reply** addresses the visitor's `email` field; adjust the Formspree notification settings if needed. Check spam folders and provider quota/status if a submission does not arrive.

The privacy notice links Formspree's policy, with Google's policy/terms also shown when custom reCAPTCHA is enabled. Formspree handles submission processing; the portfolio adds no message database or logging of form contents.

Validation covers missing configuration and simulated provider success, errors, pending requests, and retries. Live inbox delivery and reply routing require the owner setup above and must be reported separately.

## Add or update skills

Edit the `skills` collection in `src/data/portfolio.ts`. Copy an existing skill and replace its `name`, `icon`, `color`, and `note`. The `icon` must match one of the values in the `SkillIcon` type; add a new icon key and its matching renderer only when the design needs an icon that is not already supported. Group skills by honest working experience rather than listing tools that have not been used in a project.

## Project wording and privacy

This portfolio distinguishes prototypes from deployed production systems. Keep that distinction clear whenever content changes:

- Use labels such as **prototype**, **demo**, **thesis project**, or **OJT prototype** when they are accurate.
- Do not claim a system was deployed, adopted, or used in production without public evidence and permission.
- Do not publish real patient information, internal hospital data, credentials, private URLs, or unapproved screenshots. Use fabricated or fully redacted examples for healthcare work.
- Describe what was built and how it works; avoid invented metrics, user counts, performance gains, and business outcomes.
- Treat screening and decision-support projects as aids, not official medical, halal-certification, financial, or agricultural advice.

## Deployment

The app can be deployed on any platform that supports Next.js. Before publishing, run:

```bash
npm run lint
npm run build
```

The preferred production address is [gabrielpaclibar.vercel.app](https://gabrielpaclibar.vercel.app). The original [portfolio-eta-inky-60.vercel.app](https://portfolio-eta-inky-60.vercel.app) address remains available for existing links. The connected GitHub repository is `Gabbu69/Portfolio`, with production deployments from `main`. Adding a domain does not publish local source changes; push/deployment verification is separate.

`vercel.json` selects the Next.js framework, `npm ci`, and `npm run build`. Leave Vercel's output directory at its Next.js default; `dist` belongs to the separate `build:sites` adapter. No database or secret environment variables are needed for this portfolio. On-page delivery requires the public Formspree form ID and, when custom reCAPTCHA is enabled, its public site key.

Canonical links, social metadata, `robots.txt`, and `sitemap.xml` use the same production origin in `src/lib/site-url.ts`. The default is `https://gabrielpaclibar.vercel.app`; an explicit `NEXT_PUBLIC_SITE_URL` overrides it. The platform's generated project hostname does not override the chosen preferred address. Update any previously configured `NEXT_PUBLIC_SITE_URL` and redeploy when moving to a different production origin.

After deploying, verify the Vercel success status belongs to the pushed commit. Open the public site and check search and category filters across both selected and archive projects, mobile navigation, toolkit selection, images, all case-study links, and the contact form. Also request `/robots.txt`, `/sitemap.xml`, and a missing page (which should return HTTP 404). For a shorter free address, add an available name-based `.vercel.app` domain to the existing project's production domain settings; preserve the old link for existing visitors. Update `NEXT_PUBLIC_SITE_URL` to the assigned preferred origin and redeploy so metadata and sitemap use it.

## Add certificates and recognition

The homepage certificate collection is driven by `src/data/credentials.ts`. Add a record with a unique `id`, the document-backed title, issuer, kind, ISO certificate date, readable date, description, preview image, original file path, and format. Set `featured: true` on one recognition to place it in the spotlight. An optional `distinction` object supplies the featured award’s value, ordinal suffix, and label. Keep other records in the desired display order, usually newest first; the count and year range update automatically.

Place optimized WebP previews in `public/certificates/` and preserve original images/PDFs in `public/certificates/originals/`. The gallery shows complete images without cropping certificate text, opens a keyboard-accessible preview, and provides original-file viewing and downloads. No layout changes are needed to add a standard entry. Label course completion, workshop completion, appreciation, participation, and competition recognition accurately; these records do not imply professional certification.
