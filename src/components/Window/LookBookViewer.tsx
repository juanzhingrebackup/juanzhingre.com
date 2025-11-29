"use client";

import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import React, { useState, useCallback, useLayoutEffect, useRef } from "react";
import "./LookBookViewer.css";

interface LookBookViewerProps {
    onClose: () => void;
}

const LookBookViewer: React.FC<LookBookViewerProps> = ({ onClose }) => {
    const [currentViewIndex, setCurrentViewIndex] = useState(0);
    const [loadingStates, setLoadingStates] = useState({
        video0: true,
        video1: true,
        image2: true,
    });
    const video0Ref = useRef<HTMLVideoElement>(null);
    const video1Ref = useRef<HTMLVideoElement>(null);
    const image2Ref = useRef<HTMLImageElement>(null);

    // Total views: 0 = (0.mp4), 1 = (1.mp4), 2 = (2.webp)
    const totalViews = 3;

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
    useLayoutEffect(() => {
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

    // Ensure videos play when view changes and pause/cleanup others
    useLayoutEffect(() => {
        if (currentViewIndex === 0) {
            if (video0Ref.current) {
                video0Ref.current.currentTime = 0;
                video0Ref.current.play().catch(console.error);
            }
            // Cleanup other video to free memory
            if (video1Ref.current) {
                video1Ref.current.pause();
                video1Ref.current.src = "";
                video1Ref.current.load();
            }
        } else if (currentViewIndex === 1) {
            if (video1Ref.current) {
                video1Ref.current.currentTime = 0;
                video1Ref.current.play().catch(console.error);
            }
            // Cleanup other video to free memory
            if (video0Ref.current) {
                video0Ref.current.pause();
                video0Ref.current.src = "";
                video0Ref.current.load();
            }
        } else if (currentViewIndex === 2) {
            // View 2 is just an image, pause and cleanup all videos
            if (video0Ref.current) {
                video0Ref.current.pause();
                video0Ref.current.src = "";
                video0Ref.current.load();
            }
            if (video1Ref.current) {
                video1Ref.current.pause();
                video1Ref.current.src = "";
                video1Ref.current.load();
            }
        }
    }, [currentViewIndex]);

    // Start first video on mount
    useLayoutEffect(() => {
        if (video0Ref.current) {
            video0Ref.current.play().catch(console.error);
        }

        // Cleanup on unmount
        return () => {
            if (video0Ref.current) {
                video0Ref.current.pause();
                video0Ref.current.src = "";
                video0Ref.current.load();
            }
            if (video1Ref.current) {
                video1Ref.current.pause();
                video1Ref.current.src = "";
                video1Ref.current.load();
            }
        };
    }, []);

    const hasPrev = currentViewIndex > 0;
    const hasNext = currentViewIndex < totalViews - 1;

    const handleVideo0LoadStart = () => {
        setLoadingStates(prev => ({ ...prev, video0: true }));
    };

    const handleVideo0CanPlay = () => {
        setLoadingStates(prev => ({ ...prev, video0: false }));
    };

    const handleVideo0Waiting = () => {
        setLoadingStates(prev => ({ ...prev, video0: true }));
    };

    const handleVideo0Playing = () => {
        setLoadingStates(prev => ({ ...prev, video0: false }));
    };


    const handleVideo1LoadStart = () => {
        setLoadingStates(prev => ({ ...prev, video1: true }));
    };

    const handleVideo1CanPlay = () => {
        setLoadingStates(prev => ({ ...prev, video1: false }));
    };

    const handleVideo1Waiting = () => {
        setLoadingStates(prev => ({ ...prev, video1: true }));
    };

    const handleVideo1Playing = () => {
        setLoadingStates(prev => ({ ...prev, video1: false }));
    };

    const handleImage2Load = () => {
        setLoadingStates(prev => ({ ...prev, image2: false }));
    };

    const handleImage2Error = () => {
        setLoadingStates(prev => ({ ...prev, image2: false }));
    };

    // Reset loading states when view changes and check if images are already loaded
    useLayoutEffect(() => {
        if (currentViewIndex === 0) {
            setLoadingStates(prev => ({ ...prev, video0: true }));
        } else if (currentViewIndex === 1) {
            setLoadingStates(prev => ({ ...prev, video1: true }));
        } else if (currentViewIndex === 2) {
            setLoadingStates(prev => ({ ...prev, image2: true }));
            // Check if image is already loaded (cached)
            if (image2Ref.current?.complete) {
                setLoadingStates(prev => ({ ...prev, image2: false }));
            }
        }
    }, [currentViewIndex]);

    return (
        <div className="lookbook-viewer-container">
            <div className="lookbook-viewer-content">
                <div className="lookbook-container">
                    {currentViewIndex === 0 && (
                        <div className="lookbook-view-single">
                            <div className="lookbook-media-wrapper">
                                <video
                                    ref={video0Ref}
                                    src="/images/cuts/0.mp4"
                                    className="lookbook-video-single"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    onLoadStart={handleVideo0LoadStart}
                                    onCanPlay={handleVideo0CanPlay}
                                    onLoadedData={handleVideo0CanPlay}
                                    onWaiting={handleVideo0Waiting}
                                    onPlaying={handleVideo0Playing}
                                />
                                {loadingStates.video0 && (
                                    <div className="lookbook-loading-overlay">
                                        <div className="lookbook-spinner"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {currentViewIndex === 1 && (
                        <div className="lookbook-view-single">
                            <div className="lookbook-media-wrapper">
                                <video
                                    ref={video1Ref}
                                    src="/images/cuts/1.mp4"
                                    className="lookbook-video-single"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    onLoadStart={handleVideo1LoadStart}
                                    onCanPlay={handleVideo1CanPlay}
                                    onLoadedData={handleVideo1CanPlay}
                                    onWaiting={handleVideo1Waiting}
                                    onPlaying={handleVideo1Playing}
                                />
                                {loadingStates.video1 && (
                                    <div className="lookbook-loading-overlay">
                                        <div className="lookbook-spinner"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {currentViewIndex === 2 && (
                        <div className="lookbook-view-single">
                            <div className="lookbook-media-wrapper">
                                <img
                                    ref={image2Ref}
                                    src="/images/cuts/2.webp"
                                    alt="Look Book 2"
                                    className="lookbook-image-single"
                                    onLoad={handleImage2Load}
                                    onError={handleImage2Error}
                                />
                                {loadingStates.image2 && (
                                    <div className="lookbook-loading-overlay">
                                        <div className="lookbook-spinner"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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

export default LookBookViewer;

