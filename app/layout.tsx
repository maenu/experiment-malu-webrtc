import "@/app/ui/global.css";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width" />
			<title>WebRTC experiment</title>
			<body>{children}</body>
		</html>
	);
}
