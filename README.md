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

The Japanese editorial presentation is in `src/app/japanese.css`, with shared component foundations in `src/app/globals.css`. The hero uses the existing portrait, a vermilion sun, Japanese typography, and an opening paper-shutter animation. Its layout changes for phones rather than shrinking the desktop composition.

The header's day/night button follows the system preference initially and saves an explicit choice under `gab-portfolio-theme`. An early initialization script applies it before hydration; changes also sync across tabs. Supporting browsers reveal the new palette from the button, while reduced-motion users get an immediate switch. The moving process strip includes a pause control and stops when offscreen or when the page is hidden.

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
5. Use a public repository or demo URL, or omit the optional link instead of adding a placeholder.
6. Run the lint and build commands before publishing.

Follow the exact shape of an existing project item. TypeScript will flag required fields that are missing or invalid.

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

The production site is [portfolio-eta-inky-60.vercel.app](https://portfolio-eta-inky-60.vercel.app). The connected GitHub repository is `Gabbu69/Portfolio`, with production deployments from `main`.

`vercel.json` selects the Next.js framework, `npm ci`, and `npm run build`. Leave Vercel's output directory at its Next.js default; `dist` belongs to the separate `build:sites` adapter. No database or secret environment variables are needed for this portfolio.

Canonical links, social metadata, `robots.txt`, and `sitemap.xml` use the same production origin in `src/lib/site-url.ts`. To move to a custom domain, set `NEXT_PUBLIC_SITE_URL` to its complete HTTPS URL. Otherwise Vercel's `VERCEL_PROJECT_PRODUCTION_URL` is used, with the public production address as the fallback.

After deploying, verify the Vercel success status belongs to the pushed commit. Open the public site and check search and category filters across both selected and archive projects, mobile navigation, toolkit selection, images, and contact links. Also request `/robots.txt`, `/sitemap.xml`, and a missing page (which should return HTTP 404).
