"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { cuts, getCutPath } from "@/src/data/cuts";
import "./LookBookViewer.css";

interface LookBookViewerProps {
    onClose: () => void;
}

const LookBookViewer: React.FC<LookBookViewerProps> = ({ onClose }) => {
    const [currentViewIndex, setCurrentViewIndex] = useState(0);
    const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>(
        Object.fromEntries(cuts.map((_, i) => [i, true]))
    );
    
    // Store refs for all media elements
    const mediaRefs = useRef<Record<number, HTMLVideoElement | HTMLImageElement | null>>({});

    const totalViews = cuts.length;

    const handleNavigate = useCallback((direction: "prev" | "next") => {
        setCurrentViewIndex((prev) => {
            if (direction === "prev") {
                return prev > 0 ? prev - 1 : totalViews - 1;
            } else {
                return prev < totalViews - 1 ? prev + 1 : 0;
            }
        });
    }, [totalViews]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                handleNavigate("prev");
            } else if (e.key === "ArrowRight") {
                handleNavigate("next");
            } else if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNavigate, onClose]);

    // Handle media playback when view changes
    useEffect(() => {
        const currentCut = cuts[currentViewIndex];
        const currentMedia = mediaRefs.current[currentViewIndex];

        if (currentCut.type === 'video' && currentMedia instanceof HTMLVideoElement) {
            currentMedia.currentTime = 0;
            currentMedia.play().catch(() => {
                // Ignore autoplay errors - video is still clickable
            });
        }

        // Pause all other videos
        cuts.forEach((cut, index) => {
            if (index !== currentViewIndex && cut.type === 'video') {
                const video = mediaRefs.current[index];
                if (video instanceof HTMLVideoElement) {
                    video.pause();
                }
            }
        });
    }, [currentViewIndex]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cuts.forEach((cut, index) => {
                if (cut.type === 'video') {
                    const video = mediaRefs.current[index];
                    if (video instanceof HTMLVideoElement) {
                        video.pause();
                        video.src = "";
                        video.load();
                    }
                }
            });
        };
    }, []);

    const hasPrev = currentViewIndex > 0;
    const hasNext = currentViewIndex < totalViews - 1;

    const handleMediaLoad = (index: number) => {
        setLoadingStates(prev => ({ ...prev, [index]: false }));
    };

    const handleMediaLoadStart = (index: number) => {
        setLoadingStates(prev => ({ ...prev, [index]: true }));
    };

    const renderMedia = (cut: typeof cuts[0], index: number) => {
        const isActive = currentViewIndex === index;
        
        if (!isActive) return null;

        if (cut.type === 'video') {
            return (
                <div key={index} className="lookbook-view-single">
                    <div className="lookbook-media-wrapper">
                        <video
                            ref={(el) => { mediaRefs.current[index] = el; }}
                            src={getCutPath(cut.filename)}
                            className="lookbook-video-single"
                            muted
                            loop
                            playsInline
                            preload="auto"
                            onClick={(e) => {
                                const video = e.currentTarget;
                                if (video.paused) {
                                    video.play().catch(() => {});
                                } else {
                                    video.pause();
                                }
                            }}
                            onLoadStart={() => handleMediaLoadStart(index)}
                            onCanPlay={() => handleMediaLoad(index)}
                            onLoadedData={() => handleMediaLoad(index)}
                            onWaiting={() => handleMediaLoadStart(index)}
                            onPlaying={() => handleMediaLoad(index)}
                            style={{ cursor: 'pointer' }}
                        />
                        {loadingStates[index] && (
                            <div className="lookbook-loading-overlay">
                                <div className="lookbook-spinner"></div>
                            </div>
                        )}
                    </div>
                </div>
            );
        } else {
            return (
                <div key={index} className="lookbook-view-single">
                    <div className="lookbook-media-wrapper">
                        <img
                            ref={(el) => { mediaRefs.current[index] = el; }}
                            src={getCutPath(cut.filename)}
                            alt={`Look Book ${index}`}
                            className="lookbook-image-single"
                            onLoad={() => handleMediaLoad(index)}
                            onError={() => handleMediaLoad(index)}
                        />
                        {loadingStates[index] && (
                            <div className="lookbook-loading-overlay">
                                <div className="lookbook-spinner"></div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="lookbook-viewer-container">
            <div className="lookbook-viewer-content">
                <div className="lookbook-container">
                    {cuts.map((cut, index) => renderMedia(cut, index))}
                </div>
                <div className="lookbook-viewer-controls">
                    <button
                        onClick={() => handleNavigate("prev")}
                        disabled={!hasPrev}
                        className="nav-button prev-button"
                        aria-label="Previous view"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        onClick={() => handleNavigate("next")}
                        disabled={!hasNext}
                        className="nav-button next-button"
                        aria-label="Next view"
                    >
                        <FaChevronRight />
                    </button>
                    <button
                        onClick={onClose}
                        className="nav-button close-button"
                        aria-label="Close look book"
                    >
                        <FaTimes />
                    </button>
                </div>
            </div>
        </div>
    );
};
export default LookBookViewer; // By John Michael
