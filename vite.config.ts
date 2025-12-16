import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import projInfo from "./src/data/projInfo";
import storyLoaderPlugin from "./vite-plugin-story-loader";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedHostsEnv = process.env.VITE_ALLOWED_HOSTS || "";
const allowedHosts = allowedHostsEnv
    .split(",")
    .map(h => h.trim())
    .filter(Boolean);

function achievementImagesPlugin() {
    const achDir = path.resolve(__dirname, "public/ach/240");
    const imagesRoute = "/ach/240/images.json";

    const readImages = () =>
        fs
            .readdirSync(achDir, { withFileTypes: true })
            .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".png"))
            .map(entry => entry.name)
            .sort();

    return {
        name: "achievement-images-json",
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const url = req.url?.split("?")[0] ?? "";
                if (url !== imagesRoute) return next();
                try {
                    const images = readImages();
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify(images));
                } catch (err) {
                    next(err as any);
                }
            });
        },
        generateBundle() {
            if (!fs.existsSync(achDir)) return;
            const images = readImages();
            this.emitFile({
                type: "asset",
                fileName: "ach/240/images.json",
                source: JSON.stringify(images)
            });
        }
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    server: {
        allowedHosts: allowedHosts.length > 0 ? allowedHosts : undefined
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        return id.toString().split("node_modules/")[1].split("/")[0].toString();
                    }
                }
            }
        }
    },
    resolve: {
        alias: {
            vue: "vue/dist/vue.esm-bundler.js"
        }
    },
    plugins: [
        achievementImagesPlugin(),
        storyLoaderPlugin(),
        vue(),
        vueJsx({
            // options are passed on to @vue/babel-plugin-jsx
        }),
        tsconfigPaths(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
              globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
              globIgnores: ['ach/**'],
              maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
            },
            manifest: {
                name: projInfo.title,
                short_name: projInfo.title,
                description: projInfo.description,
                theme_color: "#2E3440",
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png"
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png"
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable"
                    }
                ]
            }
        })
    ]
});
