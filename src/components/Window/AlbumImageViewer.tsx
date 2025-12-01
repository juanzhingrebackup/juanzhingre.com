"use client";

import React, { useState, useCallback, useLayoutEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { getImagePath } from "@/src/data/photos";
import LoadingBar from "./LoadingBar";
import "./AlbumImageViewer.css";

interface Album {
    id: string;
    name: string;
    photoCount: number;
}

interface AlbumImageViewerProps {
    album: Album;
    onClose: () => void;
}

const AlbumImageViewer: React.FC<AlbumImageViewerProps> = ({ album, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
    
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const currentImageRef = useRef<HTMLImageElement | null>(null);
    const preloadedImagesRef = useRef<HTMLImageElement[]>([]);

    // Preload only adjacent images (not all images) to save memory
    useLayoutEffect(() => {
        // Clear previous preloaded images
        preloadedImagesRef.current = [];

        const preloadAdjacent = (offset: number) => {
            const targetIndex = currentImageIndex + offset;
            if (targetIndex >= 0 && targetIndex < album.photoCount) {
                const imagePath = getImagePath(album.id, targetIndex);
                const img = new Image();
                img.onload = () => {
                    setPreloadedImages((prev) => new Set(prev).add(imagePath));
                };
                img.src = imagePath;
                preloadedImagesRef.current.push(img);
            }
        };

        // Only preload current, next, and previous images
        preloadAdjacent(0); // current
        preloadAdjacent(1); // next
        preloadAdjacent(-1); // previous
    }, [album.id, album.photoCount, currentImageIndex]);

    // Cleanup on unmount
    useLayoutEffect(() => {
        return () => {
            preloadedImagesRef.current = [];
            setPreloadedImages(new Set());
        };
    }, []);

    const handleNavigate = useCallback((direction: "prev" | "next") => {
        const maxIndex = album.photoCount - 1;
        setCurrentImageIndex((prev) => {
            if (direction === "prev") {
                return prev > 0 ? prev - 1 : maxIndex;
            } else {
                return prev < maxIndex ? prev + 1 : 0;
            }
        });
    }, [album.photoCount]);

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

    const hasPrev = currentImageIndex > 0;
    const hasNext = currentImageIndex < album.photoCount - 1;
    const currentImagePath = getImagePath(album.id, currentImageIndex);

    return (
        <div className="album-image-viewer-container">
            <div className="image-viewer-content">
                <div 
                    ref={imageContainerRef}
                    className="image-container"
                >
                    <img
                        ref={currentImageRef}
                        key={`${album.id}-${currentImageIndex}`}
                        src={currentImagePath}
                        alt={`${album.name} - Image ${currentImageIndex + 1}`}
                        className="main-image"
                        loading="eager"
                        decoding="sync"
                        onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = "none";
                            const parent = img.parentElement;
                            if (parent) {
                                parent.innerHTML = `
                                    <div class="error-message">
                                        <div>Image Failed to Load</div>
                                        <div class="error-sub-message">${currentImagePath}</div>
                                    </div>
                                `;
                            }
                        }}
                    />
                </div>
                <div className="image-viewer-controls">
                    <button
                        onClick={() => handleNavigate("prev")}
                        disabled={!hasPrev}
                        className="nav-button prev-button"
                        aria-label="Previous image"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        onClick={() => handleNavigate("next")}
                        disabled={!hasNext}
                        className="nav-button next-button"
                        aria-label="Next image"
                    >
                        <FaChevronRight />
                    </button>
                    <button
                        onClick={onClose}
                        className="nav-button close-button"
                        aria-label="Close album"
                    >
                        <FaTimes />
                    </button>
                </div>
            </div>
        </div>
    );
};
export default AlbumImageViewer; // By John Michael
