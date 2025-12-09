import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://seanluis.github.io',
  base: '/erc-7893/',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  build: {
    assets: '_assets'
  }
});
