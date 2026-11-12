import type { NextConfig } from "next";

// src/lib/gorsel.ts içindeki IZINLI_GORSEL_ALANLARI ile aynı tutulmalı.
const gorselAlanlari = ["i.ibb.co", "res.cloudinary.com", "picsum.photos", "images.unsplash.com"];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: gorselAlanlari.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
};

export default nextConfig;
