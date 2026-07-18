# Edgardo Gabriel Paclibar - Portfolio

A responsive portfolio for full-stack developer Edgardo Gabriel Paclibar. It is built with Next.js, React, TypeScript, Tailwind CSS, and Motion.

The included development and build scripts use Next.js's Webpack mode so the project also works reliably from OneDrive-synced Windows folders.

## Run locally

Use Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Available checks and production commands:

```bash
npm run lint
npm run build
npm start
```

Run `npm start` only after `npm run build` completes.

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

If the public URL is known, add it to the site metadata and use it when adding a sitemap or canonical URL. The repository intentionally does not guess a deployment domain.

For correct absolute social metadata outside Vercel, set `NEXT_PUBLIC_SITE_URL` to the final URL (for example, `https://your-domain.com`). Vercel deployments automatically use `VERCEL_PROJECT_PRODUCTION_URL` when that variable is available.
