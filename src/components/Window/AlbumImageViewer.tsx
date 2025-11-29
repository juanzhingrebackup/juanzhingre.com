"use client";

import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import React, { useState, useCallback, useLayoutEffect, useRef } from "react";
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
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
    
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const currentImageRef = useRef<HTMLImageElement | null>(null);

    // Preload all images in the album when component mounts
    useLayoutEffect(() => {
        let loadedCount = 0;
        const totalImages = album.photoCount;
        const imagePromises: Promise<void>[] = [];

        // Preload all images in the album
        for (let i = 0; i < album.photoCount; i++) {
            const imagePath = getImagePath(album.id, i);
            const img = new Image();
            const promise = new Promise<void>((resolve) => {
                img.onload = () => {
                    loadedCount++;
                    setLoadingProgress((loadedCount / totalImages) * 100);
                    setPreloadedImages((prev) => new Set(prev).add(imagePath));
                    resolve();
                };
                img.onerror = () => {
                    loadedCount++;
                    setLoadingProgress((loadedCount / totalImages) * 100);
                    resolve(); // Continue even if one fails
                };
            });
            img.src = imagePath;
            imagePromises.push(promise);
        }

        // Wait for all images to load, then show viewer
        Promise.all(imagePromises).then(() => {
            setIsLoading(false);
        });
    }, [album.id, album.photoCount]);

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

    // Show loading bar until all images are loaded
    if (isLoading) {
        return (
            <div className="album-image-viewer-container">
                <LoadingBar progress={loadingProgress} />
            </div>
        );
    }

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
                            try {
                                const img = e.target as HTMLImageElement;
                                img.style.display = "none";
                                const parent = img.parentElement;
                                if (parent) {
                                    // Use textContent instead of innerHTML for security
                                    const errorDiv = document.createElement("div");
                                    errorDiv.className = "error-message";
                                    const errorText = document.createElement("div");
                                    errorText.textContent = "Image Failed to Load";
                                    const errorSubText = document.createElement("div");
                                    errorSubText.className = "error-sub-message";
                                    errorSubText.textContent = currentImagePath;
                                    errorDiv.appendChild(errorText);
                                    errorDiv.appendChild(errorSubText);
                                    parent.innerHTML = "";
                                    parent.appendChild(errorDiv);
                                }
                            } catch (error) {
                                console.error("Error handling image load failure:", error);
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

export default AlbumImageViewer;

