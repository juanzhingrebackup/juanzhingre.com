"use client";

import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import React, { useState, useCallback, useLayoutEffect, useRef } from "react";
import "./LookBookViewer.css";

interface LookBookViewerProps {
    onClose: () => void;
}

const LookBookViewer: React.FC<LookBookViewerProps> = ({ onClose }) => {
    const [currentViewIndex, setCurrentViewIndex] = useState(0);
    const video0Ref = useRef<HTMLVideoElement>(null);
    const video1Ref = useRef<HTMLVideoElement>(null);

    // Total views: 0 = (0.mp4 + 0.webp), 1 = (1.mp4), 2 = (2.webp)
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

    // Ensure videos play when view changes and pause others
    useLayoutEffect(() => {
        if (currentViewIndex === 0) {
            if (video0Ref.current) {
                video0Ref.current.currentTime = 0;
                video0Ref.current.play().catch(console.error);
            }
            if (video1Ref.current) {
                video1Ref.current.pause();
            }
        } else if (currentViewIndex === 1) {
            if (video1Ref.current) {
                video1Ref.current.currentTime = 0;
                video1Ref.current.play().catch(console.error);
            }
            if (video0Ref.current) {
                video0Ref.current.pause();
            }
        } else if (currentViewIndex === 2) {
            // View 2 is just an image, pause all videos
            if (video0Ref.current) {
                video0Ref.current.pause();
            }
            if (video1Ref.current) {
                video1Ref.current.pause();
            }
        }
    }, [currentViewIndex]);

    // Start first video on mount
    useLayoutEffect(() => {
        if (video0Ref.current) {
            video0Ref.current.play().catch(console.error);
        }
    }, []);

    const hasPrev = currentViewIndex > 0;
    const hasNext = currentViewIndex < totalViews - 1;

    return (
        <div className="lookbook-viewer-container">
            <div className="lookbook-viewer-content">
                <div className="lookbook-container">
                    {currentViewIndex === 0 && (
                        <div className="lookbook-view-0">
                            <video
                                ref={video0Ref}
                                src="/images/cuts/0.mp4"
                                className="lookbook-video"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                            <img
                                src="/images/cuts/0.webp"
                                alt="Look Book 0"
                                className="lookbook-image"
                            />
                        </div>
                    )}
                    {currentViewIndex === 1 && (
                        <div className="lookbook-view-single">
                            <video
                                ref={video1Ref}
                                src="/images/cuts/1.mp4"
                                className="lookbook-video-single"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        </div>
                    )}
                    {currentViewIndex === 2 && (
                        <div className="lookbook-view-single">
                            <img
                                src="/images/cuts/2.webp"
                                alt="Look Book 2"
                                className="lookbook-image-single"
                            />
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

