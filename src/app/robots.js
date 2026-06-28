import { MetadataRoute } from "next";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api"],
      },
    ],
    sitemap: "https://discountstorebd.com/sitemap.xml",
  };
}