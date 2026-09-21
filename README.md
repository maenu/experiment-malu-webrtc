# WebRTC experiment

Creates an environment to test and optimize WebRTC connections.
The scenario would be two musicians playing together.
Is a latency of ca. 20ms achievable to enable this?
How is the latency composed, i.e., which component is the slowest and how could it be optimized?

Currently, it is based on a local VM running the signal server and web server, and two browser clients on the same machine.
The signal server is contacted by all clients, then negotiates a P2P connection for audio between clients.
The web server serves the client entry point.

## Setup

Run an Ubuntu Server with Docker and pnpm.
Pull and run the signaling server [PeerJS](https://peerjs.com/).

```
docker pull peerjs/peerjs-server
docker run -p 9000:9000 -d peerjs/peerjs-server --port 9000 --cors malu-dev --key malu-dev --path /signal --allow_discovery
```

Clone this repo on the server and run it as a [NextJS](https://nextjs.org/) app

```
pnpm run dev
```

## Experiment

Open Chrome with two tabs on [http://localhost:3000/](http://localhost:3000/).
They represent the two clients to connect.
Another tab on [chrome://webrtc-internals/](chrome://webrtc-internals/) can be used to monitor and debug existing WebRTC connections.
Allow the client tabs to use the microphone.
Copy the "device ID" from one tab, press "Call", enter the copied ID, and press "Ok".
**Curiously, the first call with fail with no feedback.**
Call a second time, then the other tab gets an modal dialog to accept the call.
Monitor audio by muting/unmuting the audio streams below.
In the internals tab, click the lowest grey box, which is the latest connection, scroll down, expand "Stats graphs for remote-inbound-rtp" or "Stats graphs for remote-inbound-rtp" to get info on roundtrip-time etc.

## Result

On the same machine, two clients can have a roundtrip-time of 1ms.
Yet, the measured times represent only the network latency and the processing time of the other client.
What is the latency mouth to ear?
