import type { Metadata } from "next";
import "./globals.css";
import "98.css";
import { albums } from "@/src/data/photos";

export const metadata: Metadata = {
    title: "juanzhingre.com",
    description: "Portfolio website for Juan Zhingre",
    manifest: "/manifest.json",
    icons: {
        icon: "/favicon.png",
        apple: "/favicon.png"
    },
    themeColor: "#000000",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
};

// Album IDs for preloading (generated from photos.ts)
const ALBUM_IDS = albums.map(album => album.id);

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
                {/* Preload album cover images immediately */}
                {ALBUM_IDS.map((albumId) => (
                    <link
                        key={albumId}
                        rel="preload"
                        as="image"
                        href={`/images/albums/${albumId}/0.webp`}
                        fetchPriority="high"
                    />
                ))}
                {/* Preload music icons */}
                <link rel="preload" as="image" href="/images/icons/profile.webp" fetchPriority="high" />
                <link rel="preload" as="image" href="/images/icons/spotify.webp" fetchPriority="high" />
                <link rel="preload" as="image" href="/images/icons/apple.webp" fetchPriority="high" />
                <link rel="preload" as="image" href="/images/icons/youtube.webp" fetchPriority="high" />
                <link rel="preload" as="image" href="/images/icons/amazon.webp" fetchPriority="high" />
                {/* Preload script to start loading images immediately */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                const albums = ${JSON.stringify(ALBUM_IDS)};
                                const musicIcons = ['/images/icons/profile.webp', '/images/icons/spotify.webp', '/images/icons/apple.webp', '/images/icons/youtube.webp', '/images/icons/amazon.webp'];
                                
                                // Preload album covers
                                albums.forEach(function(albumId) {
                                    const img = new Image();
                                    img.src = '/images/albums/' + albumId + '/0.webp';
                                });
                                
                                // Preload music icons
                                musicIcons.forEach(function(iconPath) {
                                    const img = new Image();
                                    img.src = iconPath;
                                });
                                
                                // Enhanced error logging for debugging
                                const originalError = console.error;
                                const originalWarn = console.warn;
                                
                                console.error = function(...args) {
                                    originalError.apply(console, ['🔴 ERROR:', ...args]);
                                    // Also log to a global array for inspection
                                    if (!window.__errorLog) window.__errorLog = [];
                                    window.__errorLog.push({
                                        type: 'error',
                                        timestamp: new Date().toISOString(),
                                        args: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))
                                    });
                                };
                                
                                console.warn = function(...args) {
                                    originalWarn.apply(console, ['⚠️ WARN:', ...args]);
                                    if (!window.__errorLog) window.__errorLog = [];
                                    window.__errorLog.push({
                                        type: 'warn',
                                        timestamp: new Date().toISOString(),
                                        args: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))
                                    });
                                };
                                
                                // Make error log accessible
                                window.getErrorLog = function() {
                                    return window.__errorLog || [];
                                };
                                
                                window.clearErrorLog = function() {
                                    window.__errorLog = [];
                                };
                            })();
                        `
                    }}
                />
            </head>
            <body>{children}</body>
        </html>
    );
} // By John Michael
