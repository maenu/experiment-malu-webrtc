"use client";

import { Peer } from "peerjs";
import { useEffect, useRef, useState } from "react";

export default function Page() {
	const initialized = useRef<boolean | null>(null); // ridiculous...
	const localAudioElement = useRef<HTMLAudioElement | null>(null);
	const remoteAudioElement = useRef<HTMLAudioElement | null>(null);
	const containerElement = useRef<HTMLElement | null>(null);
	const callButton = useRef<HTMLButtonElement | null>(null);
	const hangupButton = useRef<HTMLButtonElement | null>(null);
	const statsButton = useRef<HTMLButtonElement | null>(null);
	const [peer, setPeer] = useState<Peer | null>(null);
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [dataConnection, setDataConnection] = useState(null);
	const [mediaConnection, setMediaConnection] = useState(null);
	const [status, setStatus] = useState("Connecting...");
	function showCallContent() {
		setStatus(`Your device ID is: ${peer.id}`);
		callButton.current.hidden = false;
		containerElement.current.hidden = true;
	}
	function showConnectedContent() {
		setStatus("You're connected");
		callButton.current.hidden = true;
		containerElement.current.hidden = false;
	}
	function callOnClick() {
		const remoteId = window.prompt("Please enter the remote id");
		setDataConnection(peer.connect(remoteId));
		setMediaConnection(peer.call(remoteId, localStream));
	}
	function hangupOnClick() {
		dataConnection.close();
		showCallContent();
	}
	function statsOnClick() {
		dataConnection.peerConnection.getStats().then(
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
	function onPeerOpen() {
		setStatus(`Your device ID is: ${peer.id}`);
		console.log("peer open");
	}
	function onPeerConnection(connection) {
		setDataConnection(connection);
		console.log("peer connection");
	}
	function onPeerCall(connection) {
		if (!confirm("Do you want to answer?")) {
			console.log("call denied");
			return;
		}
		setMediaConnection((mediaConnection) => {
			mediaConnection = connection;
			mediaConnection.answer(localStream);
			return mediaConnection;
		});
		console.log("peer call");
	}
	function onPeerClose() {
		console.log("peer close");
	}
	function onPeerDisconnected() {
		console.log("peer disconnected");
	}
	function onPeerError(error) {
		console.error("peer error", error);
	}
	function onDataConnectionOpen() {
		console.log("dataConnection open");
	}
	function onDataConnectionData(data) {
		console.log("dataConnection data", data);
	}
	function onDataConnectionClose() {
		// WARNING event not in firefox yet
		console.log("dataConnection close");
		showCallContent();
	}
	function onDataConnectionError(error) {
		console.log("dataConnection error", error);
	}
	function onMediaConnectionStream(stream) {
		remoteAudioElement.current.srcObject = stream;
		remoteAudioElement.current.autoplay = true;
		console.log("mediaConnection stream", stream);
		showConnectedContent();
	}
	function onMediaConnectionClose() {
		console.log("mediaConnection closed");
	}
	function onMediaConnectionError(error) {
		console.error("mediaConnection error", error);
	}
	useEffect(() => {
		if (initialized.current !== false) {
			return;
		}
		initialized.current = true;
		setPeer(
			new Peer(
				`${Math.floor(Math.random() * 2 ** 18)
					.toString(36)
					.padStart(4, "0")}`,
				{
					host: process.env.NEXT_PUBLIC_EXPERIMENT_MALU_WEBRTC_HOST,
					port: parseInt(
						process.env.NEXT_PUBLIC_EXPERIMENT_MALU_WEBRTC_PEERJS_PORT,
						10,
					),
					debug: 1,
					path: process.env.NEXT_PUBLIC_EXPERIMENT_MALU_WEBRTC_PEERJS_PATH,
					key: process.env.NEXT_PUBLIC_EXPERIMENT_MALU_WEBRTC_PEERJS_KEY,
					secure: true,
					config: {
						iceServers: [
							{
								urls: [
									`stun:${process.env.NEXT_PUBLIC_EXPERIMENT_MALU_WEBRTC_HOST}:3478`,
									`turn:${process.env.NEXT_PUBLIC_EXPERIMENT_MALU_WEBRTC_HOST}:3478`,
								],
								username:
									process.env.NEXT_PUBLIC_EXPERIMENT_MALU_WEBRTC_COTURN_USER,
								credential:
									process.env
										.NEXT_PUBLIC_EXPERIMENT_MALU_WEBRTC_COTURN_PASSWORD,
							},
						],
						sdpSemantics: "unified-plan",
					},
				},
			),
		);
	}, [localStream]);
	useEffect(() => {
		if (peer === null) {
			return;
		}
		peer.addListener("open", onPeerOpen);
		peer.addListener("connection", onPeerConnection);
		peer.addListener("call", onPeerCall);
		peer.addListener("close", onPeerClose);
		peer.addListener("disconnected", onPeerDisconnected);
		peer.addListener("error", onPeerError);
		return () => {
			if (peer === null) {
				return;
			}
			peer.removeListener("open", onPeerOpen);
			peer.removeListener("connection", onPeerConnection);
			peer.removeListener("call", onPeerCall);
			peer.removeListener("close", onPeerClose);
			peer.removeListener("disconnected", onPeerDisconnected);
			peer.removeListener("error", onPeerError);
		};
	}, [peer]);
	useEffect(() => {
		if (dataConnection === null) {
			return;
		}
		dataConnection.addListener("open", onDataConnectionOpen);
		dataConnection.addListener("data", onDataConnectionData);
		dataConnection.addListener("close", onDataConnectionClose);
		dataConnection.addListener("error", onDataConnectionError);
		return () => {
			if (dataConnection === null) {
				return;
			}
			dataConnection.removeListener("open", onDataConnectionOpen);
			dataConnection.removeListener("data", onDataConnectionData);
			dataConnection.removeListener("close", onDataConnectionClose);
			dataConnection.removeListener("error", onDataConnectionError);
		};
	}, [dataConnection]);
	useEffect(() => {
		if (mediaConnection === null) {
			return;
		}
		mediaConnection.addListener("stream", onMediaConnectionStream);
		mediaConnection.addListener("close", onMediaConnectionClose);
		mediaConnection.addListener("error", onMediaConnectionError);
		return () => {
			if (mediaConnection === null) {
				return;
			}
			mediaConnection.removeListener("open", onMediaConnectionStream);
			mediaConnection.removeListener("close", onMediaConnectionClose);
			mediaConnection.removeListener("error", onMediaConnectionError);
		};
	}, [mediaConnection]);
	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}
		const setup = async () => {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: false,
				audio: true,
			});
			localAudioElement.current.srcObject = stream;
			localAudioElement.current.autoplay = true;
			initialized.current = false;
			setLocalStream(stream);
		};
		setup().catch((error) => {
			console.error(error);
		});
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
