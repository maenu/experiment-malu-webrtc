import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import cors from "cors";
import helmet from "helmet";
import next from "next";
import { PeerServer } from "peer";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
app.prepare().then(() => {
	const corsConfig = {
		origin: [
			process.env.EXPERIMENT_MALU_WEBRTC_HOST,
			`${process.env.EXPERIMENT_MALU_WEBRTC_HOST}:${process.env.EXPERIMENT_MALU_WEBRTC_HTTP_PORT}`,
			`${process.env.EXPERIMENT_MALU_WEBRTC_HOST}:${process.env.EXPERIMENT_MALU_WEBRTC_HTTPS_PORT}`,
			`${process.env.EXPERIMENT_MALU_WEBRTC_HOST}:${process.env.EXPERIMENT_MALU_WEBRTC_PEERJS_PORT}`,
		],
	};
	const securityConfig = {
		contentSecurityPolicy: {
			directives: {
				"default-src": ["'self'"],
				"script-src": [
					"'self'",
					(request, response) => {
						return `'nonce-${request.headers["x-nonce"]}'`;
					},
					...(dev ? ["'unsafe-eval'"] : []),
				],
				"style-src": [
					"'self'",
					(request, response) => {
						return `'nonce-${request.headers["x-nonce"]}'`;
					},
				],
				"img-src": ["'self'", "blob:", "data:"],
				"font-src": ["'self'"],
				"object-src": ["'none'"],
			},
		},
	};
	const sslConfig = {
		cert: readFileSync(process.env.EXPERIMENT_MALU_WEBRTC_CA_CERT),
		key: readFileSync(process.env.EXPERIMENT_MALU_WEBRTC_CA_KEY),
	};
	const peerConfig = {
		path: process.env.EXPERIMENT_MALU_WEBRTC_PEERJS_PATH,
		port: parseInt(process.env.EXPERIMENT_MALU_WEBRTC_PEERJS_PORT, 10),
		key: process.env.EXPERIMENT_MALU_WEBRTC_PEERJS_KEY,
		corsOptions: corsConfig,
		ssl: {
			cert: sslConfig.cert.toString(),
			key: sslConfig.key.toString(),
		},
	};
	const turnConfig = [
		`--listening-ip=${process.env.EXPERIMENT_MALU_WEBRTC_COTURN_IP}`,
		`--relay-ip=${process.env.EXPERIMENT_MALU_WEBRTC_COTURN_IP}`,
		`--external-ip=${process.env.EXPERIMENT_MALU_WEBRTC_COTURN_IP}`,
		`--cert=${process.env.EXPERIMENT_MALU_WEBRTC_CA_CERT}`,
		`--pkey=${process.env.EXPERIMENT_MALU_WEBRTC_CA_KEY}`,
		`--dtls`,
		`--lt-cred-mech`,
		`--realm=${process.env.EXPERIMENT_MALU_WEBRTC_HOST}`,
		`--user=${process.env.EXPERIMENT_MALU_WEBRTC_COTURN_USER}:${process.env.EXPERIMENT_MALU_WEBRTC_COTURN_PASSWORD}`,
		...process.env.EXPERIMENT_MALU_WEBRTC_COTURN_EXTRA.split(" "),
	];

	const nextHandler = app.getRequestHandler();
	const securityHandler = helmet(securityConfig);
	const corsHandler = cors(corsConfig);

	const turnServer = spawn("turnserver", turnConfig);
	turnServer.stdout.on("data", (data) => {
		console.log("turn", "out", data.toString());
	});
	turnServer.stderr.on("data", (data) => {
		console.log("turn", "err", data.toString());
	});
	turnServer.on("close", (code) => {
		console.log("turn", "close", code);
	});
	const peerServer = PeerServer(peerConfig);
	peerServer.on("connection", (client) => {
		console.log("peer", "connection", client.getId());
	});
	peerServer.on("disconnect", (client) => {
		console.log("peer", "disconnect", client.getId());
	});
	const httpsServer = createHttpsServer(sslConfig, (request, response) => {
		corsHandler(request, response, (error?) => {
			if (error) {
				console.error("https", "cors", error);
				response.writeHead(500, "Internal Server Error");
				response.end();
				return;
			}
			request.headers["x-nonce"] = Buffer.from(crypto.randomUUID()).toString(
				"base64",
			);
			securityHandler(request, response, (error?) => {
				if (error) {
					console.error("https", "security", error);
					response.writeHead(500, "Internal Server Error");
					response.end();
					return;
				}
				response.setHeader("x-nonce", request.headers["x-nonce"]);
				request.headers["content-security-policy"] = response.getHeader(
					"content-security-policy",
				) as string;
				nextHandler(request, response);
			});
		});
	});
	httpsServer.listen(
		parseInt(process.env.EXPERIMENT_MALU_WEBRTC_HTTPS_PORT, 10),
		process.env.EXPERIMENT_MALU_WEBRTC_HOST,
	);
	const httpServer = createHttpServer((request, response) => {
		response.writeHead(301, {
			location: `https://${request.headers.host}${request.url}`,
		});
		response.end();
	});
	httpServer.listen(
		parseInt(process.env.EXPERIMENT_MALU_WEBRTC_HTTP_PORT, 10),
		process.env.EXPERIMENT_MALU_WEBRTC_HOST,
	);
});
