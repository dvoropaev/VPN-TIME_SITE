import { defineConfig } from 'vite';
import {resolve} from 'path';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import createSvgSpritePlugin from 'vite-plugin-svg-spriter';

const FRONT_PATH = 'src';

export default defineConfig({
    root: "src",
    plugins: [
        createSvgSpritePlugin({
            svgFolder: resolve(__dirname, `${FRONT_PATH}/assets/images/svg/`),
            
        }),
      ViteImageOptimizer({
        jpg: {
          quality: 100
        },
        png: {
          quality: 100
        },
        jpeg: {
            quality: 100
        }
      }),
    ],
    build: {
        minify: true,
        cssMinify: true,
       minifyCSS: 'lightningcss',
       rollupOptions: {
            input: {
                index: resolve(__dirname, `${FRONT_PATH}/index.html`),
                about: resolve(__dirname, `${FRONT_PATH}/pages/about/index.html`),
            }
        },
   },
});