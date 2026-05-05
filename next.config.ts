import path from "path";
import { fileURLToPath } from "url";

import type { NextConfig } from "next";

/** Stabilises Turbopack when `npm run dev` is started from the parent `ანი/` folder (two lockfiles). */
const turbopackRoot = path.dirname(fileURLToPath(import.meta.url));
const isGithubPages = process.env.DEPLOY_TARGET === "github-pages";

const nextConfig: NextConfig = {
  turbopack: {
    root: turbopackRoot,
  },
  ...(isGithubPages
    ? {
        output: "export",
        basePath: "/casa-kilice",
        assetPrefix: "/casa-kilice/",
      }
    : {}),
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    ...(isGithubPages ? { unoptimized: true } : {}),
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      /* Editorial RSS hero images (Vogue, Harper’s Bazaar, L’Officiel USA, WordPress CDNs, etc.) */
      { protocol: "https", hostname: "www.vogue.com" },
      { protocol: "https", hostname: "assets.vogue.com" },
      { protocol: "https", hostname: "media.vogue.com" },
      { protocol: "https", hostname: "www.harpersbazaar.com" },
      { protocol: "https", hostname: "hips.hearstapps.com" },
      { protocol: "https", hostname: "hips.hearstapps.io" },
      { protocol: "https", hostname: "www.hearstapps.com" },
      { protocol: "https", hostname: "www.lofficielusa.com" },
      { protocol: "https", hostname: "www.lofficiel.com" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "i1.wp.com" },
      { protocol: "https", hostname: "i2.wp.com" },
      { protocol: "https", hostname: "i3.wp.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      /* DatoCMS (common on editorial / headless sites) */
      { protocol: "https", hostname: "www.datocms-assets.com" },
      { protocol: "https", hostname: "assets.datocms-assets.com" },
      { protocol: "https", hostname: "**.datocms-assets.com" },
      { protocol: "https", hostname: "static.wixstatic.com" },
      { protocol: "https", hostname: "images.squarespace-cdn.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "**.hearstapps.com" },
      { protocol: "https", hostname: "**.hearstapps.io" },
      { protocol: "https", hostname: "**.vogue.com" },
      { protocol: "https", hostname: "**.condenastdigital.com" },
    ],
  },
};

export default nextConfig;
