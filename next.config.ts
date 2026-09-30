import { execSync } from "node:child_process";
import type { NextConfig } from "next";

const hostname = execSync("hostname --fqdn").toString().trim();

const nextConfig: NextConfig = {
	allowedDevOrigins: [hostname],
	/* config options here */
};

export default nextConfig;
