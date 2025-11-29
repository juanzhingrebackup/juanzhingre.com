"use client";

import { Icon as IconType, Window as WindowType, DesktopState } from "@/src/types/desktop";
import AppointmentMaker from "@/src/components/Window/AppointmentMaker";
import React, { useState, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";
import MusicWindow from "@/src/components/Window/MusicWindow";
import CreditsWindow from "@/src/components/Window/Origins";
import DemoPlayer from "@/src/components/Window/DemoPlayer";
import AlbumViewer from "@/src/components/Window/AlbumViewer";
import Window from "@/src/components/Window/Window";
import Icon from "@/src/components/Icon/Icon";
import { albums, getAlbumCover, getImagePath } from "@/src/data/photos";
import "./Desktop.css";

// Default desktop positions for icons
const DEFAULT_DESKTOP_POSITIONS: Record<string, { x: number; y: number }> = {
    music: { x: 30, y: 120 },
    demos: { x: 30, y: 240 },
    playday: { x: 24, y: 360 },
    ishv4ra: { x: 30, y: 480 }
};

const Desktop: React.FC = () => {
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState("");
    const [desktopState, setDesktopState] = useState<DesktopState>({
        icons: [
            {
                id: "music",
                name: "music",
                type: "folder",
                    position: DEFAULT_DESKTOP_POSITIONS.music,
                icon: "/images/icons/music.webp",
                color: "#007AFF"
            },
            {
                id: "demos",
                name: "demos",
                type: "folder",
                position: DEFAULT_DESKTOP_POSITIONS.demos,
                icon: "/images/icons/demos.webp",
                color: "#9C27B0"
            },
            {
                id: "playday",
                name: "playday cuts",
                type: "folder",
                position: DEFAULT_DESKTOP_POSITIONS.playday,
                icon: "/images/icons/playdaycuts.webp",
                color: "#FF6B6B"
            },
            {
                id: "ishv4ra",
                name: "ishv4ra",
                type: "folder",
                position: DEFAULT_DESKTOP_POSITIONS.ishv4ra,
                icon: "/images/icons/ishv4ra.webp",
                color: "#8B4513"
            }
        ],
        windows: [],
        activeWindowId: null,
        background: "dog-pattern"
    });

    // Effect to reposition icons for mobile on mount and resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                // Reposition icons horizontally at the top for mobile
                const iconSpacing = Math.min(90, (window.innerWidth - 40) / 4);
                setDesktopState((prev) => ({
                    ...prev,
                    icons: prev.icons.map((icon, index) => {
                        let xPosition = 20 + index * iconSpacing;
                        // Move ishv4ra icon (index 3) more to the right
                        if (index === 3) {
                            xPosition += 10;
                        }
                        return { ...icon, position: { x: xPosition, y: 20 } };
                    })
                }));
            } else {
                // Reset to original vertical layout for desktop
                setDesktopState((prev) => ({
                    ...prev,
                    icons: [
                        { ...prev.icons[0], position: DEFAULT_DESKTOP_POSITIONS.music },
                        { ...prev.icons[1], position: DEFAULT_DESKTOP_POSITIONS.demos },
                        { ...prev.icons[2], position: DEFAULT_DESKTOP_POSITIONS.playday },
                        { ...prev.icons[3], position: DEFAULT_DESKTOP_POSITIONS.ishv4ra }
                    ]
                }));
            }
        };

        // Set initial position
        handleResize();

        // Listen for resize events
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Icon movement
    const handleIconMove = useCallback(
        (iconId: string, x: number, y: number) => {
            setDesktopState((prev) => {
                const iconIndex = prev.icons.findIndex(
                    (icon) => icon.id === iconId
                );
                if (iconIndex === -1) return prev;

                const isMobile = window.innerWidth <= 768;
                let constrainedX = x;
                let constrainedY = y;

                if (isMobile) {
                    // On mobile, constrain icons to stay within screen bounds
                    const iconWidth = 100; // Approximate icon width
                    const iconHeight = 100; // Approximate icon height
                    const taskbarHeight = 50;

                    constrainedX = Math.max(
                        0,
                        Math.min(x, window.innerWidth - iconWidth)
                    );
                    constrainedY = Math.max(
                        0,
                        Math.min(
                            y,
                            window.innerHeight - iconHeight - taskbarHeight
                        )
                    );
                }

                const newIcons = [...prev.icons];
                newIcons[iconIndex] = {
                    ...newIcons[iconIndex],
                    position: { x: constrainedX, y: constrainedY }
                };

                return {
                    ...prev,
                    icons: newIcons
                };
            });
        },
        []
    );


    const handleOpenCredits = useCallback(() => {
        const isMobile = window.innerWidth <= 768;
        const newWindow: WindowType = {
            id: "credits-window",
            title: "Origins",
            type: "app",
            position: isMobile ? { x: 20, y: 20 } : { x: 300, y: 200 },
            size: isMobile
                ? {
                      width: Math.min(400, window.innerWidth - 40),
                      height: Math.min(750, window.innerHeight - 100)
                  }
                : { width: 500, height: 600 },
            isMinimized: false,
            isMaximized: false,
            isOpen: true,
            zIndex: Date.now(),
            content: (
                <CreditsWindow
                    onClose={() => handleWindowClose("credits-window")}
                />
            )
        };

        setDesktopState((prev) => ({
            ...prev,
            windows: [...prev.windows, newWindow],
            activeWindowId: newWindow.id
        }));
    }, []);


    const handleIconClick = useCallback(
        (icon: IconType) => {
            const existingWindow = desktopState.windows.find(
                (window) =>
                    window.id.startsWith(`${icon.id}-`) ||
                    window.id === `window-${icon.id}`
            );

            if (existingWindow) {
                // If app is already running, bring it to focus and unminimize if needed
                if (existingWindow.isMinimized) {
                    setDesktopState((prev) => ({
                        ...prev,
                        windows: prev.windows.map((w) =>
                            w.id === existingWindow.id
                                ? { ...w, isMinimized: false }
                                : w
                        ),
                        activeWindowId: existingWindow.id
                    }));
                } else {
                    // Just bring to focus
                    setDesktopState((prev) => ({
                        ...prev,
                        activeWindowId: existingWindow.id,
                        windows: prev.windows.map((w) => ({
                            ...w,
                            zIndex:
                                w.id === existingWindow.id
                                    ? Date.now()
                                    : w.zIndex
                        }))
                    }));
                }
                return;
            }

            if (icon.id === "music") {
                const isMobile = window.innerWidth <= 768;
                const newWindow: WindowType = {
                    id: `music-${Date.now()}`,
                    title: "Music",
                    type: "app",
                    position: isMobile ? { x: 20, y: 20 } : { x: 150, y: 150 },
                    size: isMobile
                        ? {
                              width: Math.min(400, window.innerWidth - 40),
                              height: Math.min(400, window.innerHeight - 100)
                          }
                        : { width: 600, height: 350 },
                    isMinimized: false,
                    isMaximized: false,
                    isOpen: true,
                    zIndex: Date.now(),
                    content: <MusicWindow />
                };

                // Force immediate rendering to prevent image pop-in delay
                flushSync(() => {
                    setDesktopState((prev) => ({
                        ...prev,
                        windows: [...prev.windows, newWindow],
                        activeWindowId: newWindow.id
                    }));
                });
            } else if (icon.id === "ishv4ra") {
                const isMobile = window.innerWidth <= 768;
                const newWindow: WindowType = {
                    id: `window-${icon.id}`,
                    title: "ishv4ra",
                    type: "app",
                    position: isMobile ? { x: 10, y: 10 } : { x: 100, y: 100 },
                    size: isMobile
                        ? {
                              width: window.innerWidth - 20,
                              height: window.innerHeight - 100
                          }
                        : { width: 800, height: 600 },
                    isMinimized: false,
                    isMaximized: false,
                    isOpen: true,
                    zIndex: Date.now(),
                    content: <AlbumViewer />
                };

                // Force immediate rendering to prevent image pop-in delay
                flushSync(() => {
                    setDesktopState((prev) => ({
                        ...prev,
                        windows: [...prev.windows, newWindow],
                        activeWindowId: newWindow.id
                    }));
                });
            } else if (icon.id === "demos") {
                const isMobile = window.innerWidth <= 768;
                // Calculate height based on number of songs dynamically
                const songCount = 7; // Number of demo tracks
                const titleBarHeight = 20; // Window title bar height
                const tableHeaderHeight = 32; // Table header row height
                const rowHeight = 36; // Each song row height
                const padding = 16; // Additional padding around content
                const calculatedHeight =
                    titleBarHeight +
                    tableHeaderHeight +
                    songCount * rowHeight +
                    padding;

                const newWindow: WindowType = {
                    id: `window-${icon.id}`,
                    title: icon.name,
                    type: "app",
                    position: isMobile ? { x: 20, y: 20 } : { x: 100, y: 100 },
                    size: isMobile
                        ? {
                              width: Math.min(500, window.innerWidth - 40),
                              height: Math.min(
                                  calculatedHeight + 30,
                                  window.innerHeight - 100
                              )
                          }
                        : { width: 450, height: calculatedHeight + 37 },
                    isMinimized: false,
                    isMaximized: false,
                    isOpen: true,
                    zIndex: Date.now(),
                    content: <DemoPlayer />
                };

                setDesktopState((prev) => ({
                    ...prev,
                    windows: [...prev.windows, newWindow],
                    activeWindowId: newWindow.id
                }));
            } else if (icon.id === "playday") {
                const isMobile = window.innerWidth <= 768;
                const newWindow: WindowType = {
                    id: `window-${icon.id}`,
                    title: icon.name,
                    type: "app",
                    position: isMobile ? { x: 10, y: 10 } : { x: 200, y: 150 },
                    size: isMobile
                        ? {
                              width: window.innerWidth - 20,
                              height: window.innerHeight - 100
                          }
                        : { width: 500, height: 650 },
                    isMinimized: false,
                    isMaximized: false,
                    isOpen: true,
                    zIndex: Date.now(),
                    content: (
                        <AppointmentMaker
                            onClose={() =>
                                handleWindowClose(`window-${icon.id}`)
                            }
                        />
                    )
                };

                setDesktopState((prev) => ({
                    ...prev,
                    windows: [...prev.windows, newWindow],
                    activeWindowId: newWindow.id
                }));
            } else if (icon.type === "app") {
                const newWindow: WindowType = {
                    id: `window-${icon.id}`,
                    title: icon.name,
                    type: "app",
                    position: { x: 150, y: 150 },
                    size: { width: 800, height: 600 },
                    isMinimized: false,
                    isMaximized: false,
                    isOpen: true,
                    zIndex: Date.now(),
                    content: <div>Welcome to {icon.name}!</div>
                };

                setDesktopState((prev) => ({
                    ...prev,
                    windows: [...prev.windows, newWindow],
                    activeWindowId: newWindow.id
                }));
            }
        },
        [desktopState.windows]
    );

    const handleWindowClose = useCallback((windowId: string) => {
        setDesktopState((prev) => ({
            ...prev,
            windows: prev.windows.filter((w) => w.id !== windowId),
            activeWindowId:
                prev.activeWindowId === windowId ? null : prev.activeWindowId
        }));
    }, []);

    const handleWindowMinimize = useCallback((windowId: string) => {
        setDesktopState((prev) => ({
            ...prev,
            windows: prev.windows.map((w) =>
                w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
            )
        }));
    }, []);

    const handleWindowMaximize = useCallback((windowId: string) => {
        setDesktopState((prev) => ({
            ...prev,
            windows: prev.windows.map((w) =>
                w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
            )
        }));
    }, []);

    const handleWindowMove = useCallback(
        (windowId: string, x: number, y: number) => {
            setDesktopState((prev) => {
                const windowIndex = prev.windows.findIndex(
                    (w) => w.id === windowId
                );
                if (windowIndex === -1) return prev;

                const newWindows = [...prev.windows];
                newWindows[windowIndex] = {
                    ...newWindows[windowIndex],
                    position: { x, y }
                };

                return {
                    ...prev,
                    windows: newWindows
                };
            });
        },
        []
    );

    const handleWindowResize = useCallback(
        (windowId: string, width: number, height: number) => {
            setDesktopState((prev) => ({
                ...prev,
                windows: prev.windows.map((w) =>
                    w.id === windowId ? { ...w, size: { width, height } } : w
                )
            }));
        },
        []
    );

    const handleDesktopClick = useCallback((e: React.MouseEvent) => {
        // Don't close menu if clicking on start button or start menu
        if (e.target instanceof HTMLElement) {
            if (
                e.target.closest("[data-start-button]") ||
                e.target.closest("[data-start-menu]")
            ) {
                return;
            }
        }
        setIsStartMenuOpen(false);
    }, []);

    // Update time every second
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: "America/Denver",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });

            const mountainTime = formatter.format(now);
            setCurrentTime(mountainTime);
        };

        updateTime(); // Update immediately
        const interval = setInterval(updateTime, 1000); // Update every second

        return () => clearInterval(interval);
    }, []);

    // Preload only album covers (not all images) to reduce memory usage
    // Full albums will be loaded on-demand when user opens them
    useEffect(() => {
        const preloadAlbumCovers = () => {
            // Only preload album covers (much smaller memory footprint)
            albums.forEach((album) => {
                const coverImg = new Image();
                coverImg.src = getAlbumCover(album.id);
            });
        };

        // Start preloading covers when component mounts
        preloadAlbumCovers();
    }, []);

    return (
        <div className="desktopContainer" onClick={handleDesktopClick}>
            <>
                <div className="backgroundOverlay" />

                {/* Desktop Icons */}
                {desktopState.icons.map((icon) => (
                    <Icon
                        key={icon.id}
                        icon={icon}
                        onClick={() => handleIconClick(icon)}
                        onMove={handleIconMove}
                        isSelected={false}
                    />
                ))}

                {/* Windows */}
                {desktopState.windows.map((window) => (
                    <Window
                        key={window.id}
                        window={window}
                        onClose={handleWindowClose}
                        onMinimize={handleWindowMinimize}
                        onMaximize={handleWindowMaximize}
                        onMove={handleWindowMove}
                        onResize={handleWindowResize}
                        onFocus={(windowId) => {
                            setDesktopState((prev) => ({
                                ...prev,
                                activeWindowId: windowId,
                                windows: prev.windows.map((w) => ({
                                    ...w,
                                    zIndex:
                                        w.id === windowId
                                            ? Date.now()
                                            : w.zIndex
                                }))
                            }));
                        }}
                    >
                        {window.content}
                    </Window>
                ))}

                {/* Taskbar */}
                <div className="taskbar">
                    <button
                        className="startButton"
                        data-start-button
                        onClick={() => {
                            setIsStartMenuOpen(!isStartMenuOpen);
                        }}
                    >
                        <img
                            src="/images/icons/startmenu.webp"
                            alt="Start"
                            className="startButtonIcon"
                        />
                        <span className="startButtonText">Start</span>
                    </button>

                    <div className="taskbarItems">
                        {desktopState.windows
                            .filter((window) => !window.isMinimized)
                            .map((window) => {
                                // Get the icon for this window type
                                let iconSrc = "";
                                if (window.id.startsWith("music-")) {
                                    iconSrc = "/images/icons/music.webp";
                                } else if (window.id === "window-ishv4ra") {
                                    iconSrc = "/images/icons/ishv4ra.webp";
                                } else if (window.id === "window-demos") {
                                    iconSrc = "/images/icons/demos.webp";
                                } else if (window.id === "window-playday") {
                                    iconSrc = "/images/icons/playdaycuts.webp";
                                }

                                return (
                                    <div
                                        key={window.id}
                                        className={`taskbarItem ${desktopState.activeWindowId === window.id ? "active" : ""}`}
                                        onClick={() => {
                                            setDesktopState((prev) => ({
                                                ...prev,
                                                activeWindowId: window.id,
                                                windows: prev.windows.map(
                                                    (w) => {
                                                        if (
                                                            w.id === window.id
                                                        ) {
                                                            return {
                                                                ...w,
                                                                zIndex: Date.now(),
                                                                isMinimized: false // Ensure window is not minimized
                                                            };
                                                        }
                                                        return w;
                                                    }
                                                )
                                            }));
                                        }}
                                    >
                                        <div className="taskbarItemContent">
                                            {iconSrc && (
                                                <img
                                                    src={iconSrc}
                                                    alt=""
                                                    className="taskbarIcon"
                                                />
                                            )}
                                            <span className="taskbarTitle">
                                                {window.title}
                                            </span>
                                        </div>
                                        <button
                                            className="taskbarCloseButton"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDesktopState((prev) => ({
                                                    ...prev,
                                                    windows:
                                                        prev.windows.filter(
                                                            (w) =>
                                                                w.id !==
                                                                window.id
                                                        ),
                                                    activeWindowId:
                                                        prev.activeWindowId ===
                                                        window.id
                                                            ? null
                                                            : prev.activeWindowId
                                                }));
                                            }}
                                            title="Close"
                                        >
                                            ×
                                        </button>
                                    </div>
                                );
                            })}
                    </div>

                    <div className="clock">{currentTime}</div>
                </div>

                {/* Start Menu */}
                <div
                    className={`startMenu ${!isStartMenuOpen ? "hidden" : ""}`}
                    data-start-menu
                >
                    <div className="startMenuSidebar">start menu</div>
                    <div className="startMenuContent">
                        <div
                            className="startMenuItem"
                            onClick={() => {
                                window.open(
                                    "https://www.instagram.com/juan.zhingre/",
                                    "_blank"
                                );
                                setIsStartMenuOpen(false);
                            }}
                        >
                            <img
                                src="/images/icons/instagram.webp"
                                alt="Instagram"
                                className="menuItemIcon"
                            />
                            juan.zhingre
                        </div>
                        <div
                            className="startMenuItem"
                            onClick={() => {
                                window.open(
                                    "https://www.instagram.com/ishv4ra/",
                                    "_blank"
                                );
                                setIsStartMenuOpen(false);
                            }}
                        >
                            <img
                                src="/images/icons/instagram.webp"
                                alt="Instagram"
                                className="menuItemIcon"
                            />
                            ishv4ra
                        </div>
                        <div
                            className="startMenuItem"
                            onClick={() => {
                                window.open(
                                    "https://www.instagram.com/playdaycuts/",
                                    "_blank"
                                );
                                setIsStartMenuOpen(false);
                            }}
                        >
                            <img
                                src="/images/icons/instagram.webp"
                                alt="Instagram"
                                className="menuItemIcon"
                            />
                            playdaycuts
                        </div>
                        <div className="divider"></div>
                        <div
                            className="startMenuItem"
                            onClick={() => {
                                handleOpenCredits();
                                setIsStartMenuOpen(false);
                            }}
                        >
                            Origins
                        </div>
                        <div className="divider"></div>
                        <div
                            className="startMenuItem"
                            onClick={() => {
                                setIsStartMenuOpen(false);
                                window.close();
                            }}
                        >
                            <img
                                src="/images/icons/startmenu.webp"
                                alt="Shutdown"
                                className="menuItemIcon"
                            />
                            Shut Down...
                        </div>
                    </div>
                </div>
            </>
        </div>
    );
};
export default Desktop; // By John Michael
