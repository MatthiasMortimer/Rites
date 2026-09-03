# Rites & Secure contractor template

A reusable four-page Astro contractor website. Update the company details and page copy in [`src/content/site.md`](src/content/site.md); the site parses frontmatter and markdown at build time with `gray-matter` and `marked`.

## Commands

```sh
npm install
npm run dev
npm run build
```

Pages: `/`, `/services`, `/about`, and `/contact`.

Replace the Unsplash URL in `src/content/site.md` and the matching CSS background URL with a project-specific image before launch. The contact form currently opens the visitor's email client through `mailto:`; swap the form action for Formspree, FormSubmit, or your backend when deploying.
# Rites & Secure contractor template

A reusable Astro contractor website. Update the company details and page copy in [`src/content/site.md`](src/content/site.md); the site parses frontmatter and Markdown with `gray-matter` and `marked`.

## Commands

```sh
npm install
npm run dev
npm run build
```

Pages: `/`, `/services`, `/about`, `/contact`, and the SSR-protected `/dashboard`.

Set a strong `SESSION_SECRET` environment variable before deploying. The included accounts are demo credentials only and should be replaced with hashed credentials and a persistent production user store. The contact form currently opens the visitor's email client through `mailto:`; swap it for a backend when deploying.
