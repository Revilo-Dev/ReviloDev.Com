# ReviloDev.Com

ReviloDev.com is My personal landing site since 2025, It hosts my GitHub updates, links to all my projects, privacy policies for apps and wikis for my Minecraft mods.

ReviloDev.com is built in Vite React, DaisyUI is used for all the components, colour pallets and the sites Design language, and lucide React is used for the icons. 

The private analytics panel is available at `/dashboard`. It requires the server API, Firestore, and admin secrets; a frontend-only deployment cannot provide analytics or authenticate admins. See [dashboard setup and deployment](functions/README.md). Never publish `.secret.local` or `.dashboard-local`.

Website and mod cards with verified public repositories show GitHub's latest push date, formatted `Oct 16 2026` in Brisbane time. Repository lookups are shared and cached for one hour, with the last verified dates retained if GitHub is unavailable. Matches live in `src/data/projectRepositories.js`; unmatched cards retain their existing text. Run `node --test scripts/repository-updates.test.mjs` to check date formatting and fetching.

------
[DaisyUI](https://daisyui.com)
[React](https://react.dev)
[Lucide](https://lucide.dev)
