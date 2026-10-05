import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: ["dev-malu.gewa.local"],
	cacheComponents: true, // needed for CSP nonce to work?
	compress: false,
	webpack: (config) => {
		return {
			...config,
			optimization: {
				...config.optimization,
				minimize: false,
			},
		};
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
		serverFunctions: true,
	},
};

export default nextConfig;
