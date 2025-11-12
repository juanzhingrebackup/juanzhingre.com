import type { Metadata } from "next";
import "./globals.css";
import "98.css";

export const metadata: Metadata = {
    title: "juanzhingre.com",
    description: "Portfolio website for Juan Zhingre",
    manifest: "/manifest.json",
    icons: {
        icon: "/favicon.png",
        apple: "/favicon.png"
    },
    themeColor: "#000000",
    viewport: "width=device-width, initial-scale=1"
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="Juan Zhingre" content="Juan Zhingre" />
            </head>
            <body>{children}</body>
        </html>
    );
} // By John Michael
