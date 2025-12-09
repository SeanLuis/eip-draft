# ERC-7893 Documentation Site

Documentation site for ERC-7893: DeFi Protocol Solvency Proof Mechanism.

## Development

```bash
cd documentation-site

# First time setup (copies assets from ../assets/erc-7893/)
./scripts/setup.sh

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

> **Note:** The `src/content/docs/` and `public/images/` directories are generated from `../assets/erc-7893/` and are gitignored. Run the setup script after cloning.

## Deployment

Automatically deployed to GitHub Pages when changes are pushed to `main` branch.

Workflow: `/.github/workflows/deploy-docs.yml`

## Structure

```
assets/erc-7893/          # Source of truth (in parent directory)
├── docs/                 # Original documentation
├── images/               # Original images
│
documentation-site/
├── src/
│   ├── content/docs/     # Generated from assets (gitignored)
│   ├── layouts/
│   ├── pages/
│   └── styles/
└── public/
    └── images/           # Generated from assets (gitignored)
```
