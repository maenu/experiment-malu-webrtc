"use client";

import { Peer } from "peerjs";
import { useEffect, useRef, useState } from "react";

export default function Page() {
	const localAudioElement = useRef<HTMLAudioElement | null>(null);
	const remoteAudioElement = useRef<HTMLAudioElement | null>(null);
	const containerElement = useRef<HTMLElement | null>(null);
	const callButton = useRef<HTMLButtonElement | null>(null);
	const hangupButton = useRef<HTMLButtonElement | null>(null);
	const statsButton = useRef<HTMLButtonElement | null>(null);
	const peer = useRef<Peer | null>(null);
	const dataConnection = useRef(null);
	const mediaConnection = useRef(null);
	const localStream = useRef<MediaStream | null>(null);
	const [status, setStatus] = useState("Connecting...");
	const [code, setCode] = useState(null);
	function showCallContent() {
		setStatus(`Your device ID is: ${peer.current.id}`);
		callButton.current.hidden = false;
		containerElement.current.hidden = true;
	}
	function showConnectedContent() {
		setStatus("You're connected");
		callButton.current.hidden = true;
		containerElement.current.hidden = false;
	}
	function callOnClick() {
		setCode(window.prompt("Please enter the sharing code"));
		dataConnection.current = peer.current.connect(code);
		dataConnection.current.on("open", () => {
			console.log("dataConnection open");
		});
		dataConnection.current.on("data", (data) => {
			console.log("dataConnection data", data);
		});
		dataConnection.current.on("close", () => {
			console.log("dataConnection close");
			// WARNING event not in firefox yet
			showCallContent();
		});
		dataConnection.current.on("error", (error) => {
			console.log("dataConnection error", error);
		});
		mediaConnection.current = peer.current.call(code, localStream.current);
		mediaConnection.current.on("stream", (stream) => {
			remoteAudioElement.current.srcObject = stream;
			remoteAudioElement.current.autoplay = true;
			showConnectedContent();
			console.log("mediaConnection stream", stream);
		});
		mediaConnection.current.on("close", () => {
			console.log("mediaConnection closed");
		});
		mediaConnection.current.on("error", (error) => {
			console.error("mediaConnection error", error);
		});
	}
	function hangupOnClick() {
		dataConnection.current.close();
		showCallContent();
	}
	function statsOnClick() {
		dataConnection.current.peerConnection.getStats().then(
			(stats) => {
				console.log("begin");
				for (const map of stats.values()) {
					console.log(map.type, map);
					if (map.type === "inbound-rtp") {
						console.log(
							map.type,
							"totalProcessingDelay",
							map.totalProcessingDelay,
						);
					} else if (map.type === "outbound-rtp") {
						console.log(
							map.type,
							"totalPacketSendDelay",
							map.totalPacketSendDelay,
						);
					} else if (map.type === "remote-inbound-rtp") {
						console.log(map.type, "roundTripTime", map.roundTripTime);
					} else if (map.type === "remote-outbound-rtp") {
						console.log(map.type, "roundTripTime", map.roundTripTime);
					}
				}
				console.log("end");
			},
			(error) => {
				console.error(error);
			},
		);
	}
	useEffect(() => {
		if (peer.current !== null) {
			return; // pretend effect is "pure", as dev mode calls it twice
		}
		peer.current = new Peer(
			`${Math.floor(Math.random() * 2 ** 18)
				.toString(36)
				.padStart(4, "0")}`,
			{
				host: window.location.hostname,
				port: 9000,
				debug: 1,
				path: "/peer",
				key: window.location.hostname,
				secure: true,
				config: {
					iceServers: [
						{
							urls: [
								`stun:${window.location.hostname}:3478`,
								`turn:${window.location.hostname}:3478`,
							],
							username: window.location.hostname,
							credential: window.location.hostname,
						},
					],
					sdpSemantics: "unified-plan",
				},
			},
		);
		peer.current.on("open", () => {
			setStatus(`Your device ID is: ${peer.current.id}`);
		});
		peer.current.on("connection", (connection) => {
			dataConnection.current = connection;
			dataConnection.current.on("open", () => {
				console.log("dataConnection open");
			});
			dataConnection.current.on("data", (data) => {
				console.log("dataConnection data", data);
			});
			dataConnection.current.on("close", () => {
				console.log("dataConnection close");
				// WARNING event not in firefox yet
				showCallContent();
			});
			dataConnection.current.on("error", (error) => {
				console.log("dataConnection error", error);
			});
		});
		peer.current.on("call", (connection) => {
			if (!confirm("Do you want to answer?")) {
				console.log("call denied");
				return;
			}
			mediaConnection.current = connection;
			mediaConnection.current.answer(localStream.current);
			showConnectedContent();
			mediaConnection.current.on("stream", (stream) => {
				remoteAudioElement.current.srcObject = stream;
				remoteAudioElement.current.autoplay = true;
				console.log("mediaConnection stream", stream);
			});
			mediaConnection.current.on("close", () => {
				console.log("mediaConnection closed");
			});
			mediaConnection.current.on("error", (error) => {
				console.error("mediaConnection error", error);
			});
		});
		peer.current.on("close", () => {
			console.log("peer closed");
		});
		peer.current.on("disconnected", () => {
			console.log("peer disconnected");
		});
		peer.current.on("error", (error) => {
			console.error(error);
		});
		navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(
			(stream) => {
				localAudioElement.current.srcObject = stream;
				localAudioElement.current.autoplay = true;
				localStream.current = stream;
				return stream;
			},
			(error) => {
				console.error(error);
			},
		);
	}, []);
	return (
		<main>
			<div className="container">
				<h1>Phone a friend</h1>
				<p id="cast-status" className="big">
					{status}
				</p>
				<p>Please use headphones!</p>
				<button
					className="call-btn"
					type="button"
					ref={callButton}
					onClick={() => callOnClick()}
				>
					Call
				</button>
				<button
					className="stats-btn"
					type="button"
					ref={statsButton}
					onClick={() => statsOnClick()}
				>
					Stats
				</button>
				<section className="call-container" hidden ref={containerElement}>
					<div className="audio-container">
						<p>You're automatically muted, unmute yourself!</p>
						<audio controls muted ref={remoteAudioElement}></audio>
						<audio controls muted ref={localAudioElement}></audio>
					</div>
					<button
						className="hangup-btn"
						type="button"
						ref={hangupButton}
						onClick={() => hangupOnClick()}
					>
						Hang up
					</button>
				</section>
			</div>
			<section className="modal" hidden>
				<div id="close">close</div>
				<div className="inner-modal">
					<label htmlFor="friend-device-id">
						Give us your friend's device ID
					</label>
					<input
						id="friend-device-id"
						type="text"
						placeholder="Enter your friend's device ID"
					/>
					{/* input aria-colcount="10"*/}
					<button className="connect-btn" type="button">
						Connect
					</button>
				</div>
			</section>
		</main>
	);
}
