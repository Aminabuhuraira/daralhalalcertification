import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    domains: ["daralhalalcertification.com"],
  },
};

export default withNextIntl(nextConfig);
