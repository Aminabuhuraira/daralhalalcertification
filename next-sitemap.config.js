/** @type {import("next-sitemap").IConfig} */
module.exports = {
  siteUrl: "https://www.daralhalalcertification.com",
  generateRobotsTxt: false,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ["/dashboard/*", "/api/*", "/auth/*"],
  additionalPaths: async () => [
    { loc: "/", priority: 1.0, changefreq: "daily" },
    { loc: "/certification", priority: 0.9 },
    { loc: "/verify", priority: 0.9 },
    { loc: "/learn", priority: 0.8 },
    { loc: "/resources", priority: 0.8 },
    { loc: "/resources/halal-market-data", priority: 0.8 },
    { loc: "/resources/ingredient-checker", priority: 0.8 },
    { loc: "/resources/inheritance-calculator", priority: 0.7 },
    { loc: "/about", priority: 0.7 },
    { loc: "/contact", priority: 0.6 },
  ],
};
