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

Run the signaling server [PeerJS](https://peerjs.com/).

```
docker run -p 9000:9000 -d peerjs/peerjs-server --port 9000 --cors malu-dev --key malu-dev --path /signal --allow_discovery
```

Run the TURN/STUN server [coturn](https://github.com/coturn/coturn)

```
docker run -d -p 3478:3478 -p 3478:3478/udp -p 5349:5349 -p 5349:5349/udp -p 49152-49155:49152-49155/udp coturn/coturn --min-port=49152 --max-port=49155
```

Clone this repo on the server and run it as a [NextJS](https://nextjs.org/) app

```
pnpm run dev
```

This project followed a basic Mozilla tutorial [Building an Internet-Connected Phone with PeerJS](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Build_a_phone_with_peerjs).

## Experiment

Open Chrome with two tabs on [http://localhost:3000/](http://localhost:3000/).
They represent the two clients to connect.
Another tab on [chrome://webrtc-internals/](chrome://webrtc-internals/) for Chrome or [about:webrtc](about:webrtc) for Firefox can be used to monitor and debug existing WebRTC connections.
Allow the client tabs to use the microphone.
Copy the "device ID" from one tab, press "Call", enter the copied ID, and press "Ok".
**Curiously, the first call with fail with no feedback.**
Call a second time, then the other tab gets an modal dialog to accept the call.
Monitor audio by muting/unmuting the audio streams below.
In the internals tab, click the lowest grey box, which is the latest connection, scroll down, expand "Stats graphs for remote-inbound-rtp" or "Stats graphs for remote-inbound-rtp" to get info on roundtrip-time etc.
To process statistics programmatically, [RTCPeerConnectionStats](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnectionStats) can be used.

## Result

On the same machine, two clients can have a roundtrip-time of 1ms.
Yet, the measured times represent only the network latency and the processing time of the other client.

## Future work

Network latency is only one part of it.
The perceived latency of a human in an audio chat is the time from the generation of the soundwaves on one end (mouth/instrument), them picked up by a microphone, encoded, sent through the network, decoded on the other end, emitted by a speaker, to the sensory perception (ear).
And end-to-end measurement is required to get a complete view on the origin of perceived latency, e.g., something like <https://transitiverobotics.com/blog/webrtc-latency-breakdown/>.

More realistic scenarios should be tested, e.g., a client on another host, could use <https://github.com/puppeteer/puppeteer> to automate.
These headless clients may need some fake devices, see <https://stackoverflow.com/questions/23340886/chrome-fake-microphone-input-for-test-purpose> and <https://stackoverflow.com/questions/21193109/simulate-microphone-input>.
To encode a timestamp in audio, a click of a certain frequency might be enough.
Otherwise, a data-over-sound solution could be used, e.g., <https://github.com/ggerganov/ggwave>, <https://github.com/quiet/quiet>, or <https://github.com/jonasbits/chirp.io>.

## References

More WebRTC guides and tutorials can be found at Mozilla at <https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API>.<br>
WebRTC samples can be found at <https://webrtc.github.io/samples/><br>
More guides from the WebRTC specification group at <https://webrtc.org/getting-started/overview><br>
When working with WebRTC performance, these might be helpful <https://blog.mozilla.org/webrtc/debugging-with-aboutwebrtc-in-firefox-getting-data-out/>, <https://github.com/peermetrics/webrtc-stats>, <https://github.com/vpalmisano/webrtcperf>, <https://sipfront.com/blog/2026/04/how-to-test-a-webrtc-connection-effectively-in-2026/>, <https://www.forasoft.com/blog/article/how-to-test-webrtc-stream>, <https://medium.com/@vpalmisano/webrtc-debugging-with-prometheus-grafana-254b6ac71063><br>
Other notes on latency can be found at <https://www.reddit.com/r/WebRTC/comments/fx3zsc/what_rtt_really_is_in_context_of_webrtc/>, <https://rtcleague.com/blogs/reduce-latency-webrtc-applications>, <https://www.gethopp.app/blog/latency-exploration><br>
A TURN/STUN server can be found at <https://github.com/coturn/coturn><br>
