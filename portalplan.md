# FAIRDatabase Portal Implementation Plan

## Goals
- Provide an attractive, intuitive portal that showcases FAIRDatabase to researchers and lay users.
- Use modern frontend best practices while ensuring no additional *hosting* costs.
- Integrate tightly with the FAIRDatabase demo backend via a secure, minimal API.
- Keep everything reproducible and version controlled.

---

## Architecture Overview

- **Hosting**: Static site hosted on GitHub Pages from `fairdatabase-portal-main` repository (no recurring cost, GitHub-native CI). Free-tier alternatives like Netlify or Vercel are possible, but GitHub Pages avoids external vendor constraints and is allowed for personal/academic projects.[cite:8][cite:10]
- **Frontend stack**: Static-generated React app using Vite or Next.js static export, or a well-structured vanilla TypeScript SPA if you want to minimize tooling.
- **Data source**: All dynamic content fetched from:
  - The FAIRDatabase demo API (`https://demo.fairdatabase.org/api/demo/*`), read-only.[cite:1][cite:2]
  - Static JSON/Markdown configuration files stored directly in the FAIRDatabase GitHub repo (queried via raw GitHub URLs pinned to tags/commits).[cite:1][cite:2]
- **Security model**: Portal is purely client-side, holds no secrets, and only talks to hardened, public read-only endpoints.

This pattern separates concerns: the portal is a static, cacheable, zero-secret front-end, while the FAIRDatabase backend handles all stateful and sensitive operations.[cite:2]

---

## Frontend Technology Choices

### Framework

Recommended options:

- **React + Vite**
  - Simple setup, fast dev server, easy GitHub Pages deployment.
  - Good ecosystem for components, routing, and charting.
- **Next.js (Static Export)**
  - Use `next export` to generate static HTML/JS.[cite:10]
  - Great if you expect to later move to server-side rendering without changing much architecture.
- **SvelteKit / Vue**
  - Also exportable to static sites, if team preference leans that way.

Given GitHub Pages constraints (no server-side runtime), the portal must be entirely static or use purely client-side code for any dynamic behavior.[cite:10]

### UI and Styling

- Use a component library such as **Chakra UI**, **MUI**, or **Tailwind CSS + Headless UI** to rapidly achieve a polished, accessible design.
- Define a consistent design system:
  - Color palette aligned with FAIR/biomed branding (e.g., blues/greens with accent colors).
  - Typography: sans-serif for body (e.g. Inter/Roboto), monospace for code blocks.
  - Spacing and layout tokens for consistent paddings/margins.
- Build a responsive layout (mobile-first) with CSS grid/flexbox.

These choices require no paid licenses and are well-supported in the React ecosystem.

---

## Information Architecture & UX

### Top-level Navigation

- **Home** – high-level description of FAIRDatabase and immediate interactive demo.
- **Explore Data** – more advanced exploratory widgets for microbiome datasets.
- **For Researchers** – technical details, API docs, links to papers and GitHub.[cite:2][cite:7]
- **About / Methods** – explanation of FAIR principles, Supabase/Postgres stack, privacy and security notes.[cite:2][cite:1]

### Landing Page UX

- Hero section:
  - Short, punchy headline (e.g. “FAIR Microbiome Data, Ready to Explore”).
  - Subheading targeted at both audiences: “A real-time, FAIR-compliant database for human microbiome data, with an interactive sandbox for researchers and curious explorers.”[cite:2]
  - Primary CTA button: “Try the Live Demo”.
  - Secondary CTA: “Read the Methods Paper”.[cite:2]

- Immediate interactive component (no scrolling):
  - Simple widget backed by `/api/demo/query` for a preconfigured scenario.
  - Example: dropdown for “Scenario” (gut vs oral microbiome, etc.), slider for sample size, “Run demo” button.

### Dual User Pathways

- **Everyday users**
  - Provide curated scenarios with limited controls and auto-explanations.
  - Use plain language tooltips (“What is alpha diversity?”, “What is metadata?”).
  - Provide pre-baked textual interpretations generated on the backend (or static content) to avoid exposing LLM credentials client-side.[cite:2]

- **Researchers**
  - Link prominently to:
    - The full FAIRDatabase demo UI.
    - FAIRDatabase GitHub repository.
    - The Frontiers methods paper.[cite:2]
  - Include code snippets (Python/R/JS) showing how to query the demo API.
  - Provide schema diagrams and Supabase/Postgres notes at a high level.[cite:1][cite:2]

---

## Integration with FAIRDatabase Demo API

### API Surface

Assume the FAIRDatabase demo exposes endpoints such as:

- `GET /api/demo/datasets` – list available demo datasets and metadata.
- `GET /api/demo/query?dataset=…&filter=…` – return aggregated statistics and small data samples.
- `POST /api/demo/nl-query` – optional LLM-assisted query API.

The portal will:

- Fetch lists on load (with caching) to populate dropdowns.
- Issue queries in response to user actions.
- Render results via charts (e.g. Plotly.js, Chart.js, or D3) and tables.

### Client-Side Data Flow

- Use React Query or SWR for data fetching and caching, including loading and error states.
- Keep all parsing and visualization client-side; never embed secrets or service keys.
- Use type-safe API clients (TypeScript interfaces) to ensure correct integration.

### Using GitHub as a Static Config Source

To keep the portal tightly coupled to the FAIRDatabase repo without runtime code execution:

- Maintain `demo-config/` directory in FAIRDatabase:
  - `example_queries.json`
  - `example_workflows.json`
  - `scenarios.json`.
- Reference them in the portal via raw GitHub URLs pinned to tags/commits, e.g.:
  - `https://raw.githubusercontent.com/SheratonMV/FAIRDatabase/v1.0.0/demo-config/example_queries.json`.[cite:1]
- On each new FAIRDatabase release, bump the tag in the portal configuration.

This provides tight linkage to GitHub while remaining secure and zero-cost.

---

## Charts and Visualization

- Use a free, open-source charting library:
  - **Plotly.js** (MIT for JS), **Chart.js**, or **Recharts**.
- Visual components:
  - Diversity indices over groups.
  - Relative abundance stacked bar plots for taxa.
  - Sample size distributions.
- Ensure accessibility:
  - Provide text summaries for each chart.
  - Use high-contrast color schemes.

Charts will be driven entirely by the JSON returned from the FAIRDatabase demo API.

---

## Security Considerations (Portal)

- The portal is purely static: no API keys or secrets are stored in the repository or sent to the browser.
- All API calls go to:
  - Public, read-only demo endpoints with rate limits.
  - Raw GitHub content endpoints.
- Enforce HTTPS-only resources.
- Implement content security policy (CSP) headers via GitHub Pages configuration (using a `CNAME` + DNS + custom headers if served behind a reverse proxy; otherwise document CSP for future migration).
- Validate query parameters client-side (e.g., only allow pre-defined scenario IDs, enums for filters), even though the backend should also validate.

Because there is no server-side logic in the portal, the primary risks are XSS and misuse of external APIs, both mitigated by strict CSP, careful React component design, and minimal direct HTML injection.

---

## Implementation Steps (Portal)

1. **Initialize portal stack**
   - Convert `fairdatabase-portal-main` into a Vite/React project (or Next.js static project).
   - Set up TypeScript, ESLint, Prettier.

2. **Design system and layout**
   - Implement basic layout (navbar, footer, main content area).
   - Configure theme (colors, typography).

3. **Create key pages and routes**
   - `Home`, `Explore`, `For Researchers`, `About`.

4. **Integrate with FAIRDatabase demo API**
   - Implement a small `api.ts` module encapsulating calls to `/api/demo/*`.
   - Implement hooks for querying datasets and running demo queries.

5. **GitHub-config integration**
   - Implement a service to fetch `example_queries.json` from FAIRDatabase GitHub.
   - Display these as clickable presets.

6. **Charts and visualizations**
   - Implement chart components fed by API responses.

7. **Accessibility and polish**
   - Add ARIA labels, keyboard navigation checks.
   - Add loading skeletons and error notices.

8. **GitHub Pages deployment**
   - Add GitHub Actions workflow to build and deploy to `gh-pages` branch on push to `main`.
   - Configure custom domain (e.g. `www.fairdatabase.org`) pointing to GitHub Pages.

All of this uses only GitHub and client-side resources, incurring no extra hosting cost.
