import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows the development server to be opened from the configured LAN host.
  allowedDevOrigins: ["192.168.69.135"],
};

export default nextConfig;
