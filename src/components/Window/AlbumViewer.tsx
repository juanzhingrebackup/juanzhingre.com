"use client";

import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import React, { useLayoutEffect, useCallback, useState, useRef } from "react";
import { albums, getAlbumCover, getImagePath, Album } from "@/src/data/photos";
import LoadingBar from "./LoadingBar";
import "./AlbumViewer.css";
import "./AlbumImageViewer.css";

type ViewMode = "grid" | "imageViewer";

const AlbumViewer: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Grid loading state
    const [isGridLoading, setIsGridLoading] = useState(true);
    const [gridLoadingProgress, setGridLoadingProgress] = useState(0);
    
    // Image viewer loading state - per image
    const [imageLoadingStates, setImageLoadingStates] = useState<Map<number, boolean>>(new Map());
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
    
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const currentImageRef = useRef<HTMLImageElement | null>(null);

    // Preload all album covers and wait for them to load
    useLayoutEffect(() => {
        if (viewMode !== "grid") return;
        
        let loadedCount = 0;
        const totalCovers = albums.length;
        const coverPromises: Promise<void>[] = [];
        
        albums.forEach((album) => {
            const coverPath = getAlbumCover(album.id);
            const img = new Image();
            const promise = new Promise<void>((resolve) => {
                img.onload = () => {
                    loadedCount++;
                    setGridLoadingProgress((loadedCount / totalCovers) * 100);
                    resolve();
                };
                img.onerror = () => {
                    loadedCount++;
                    setGridLoadingProgress((loadedCount / totalCovers) * 100);
                    resolve(); // Continue even if one fails
                };
            });
            img.src = coverPath;
            coverPromises.push(promise);
        });

        // Wait for all covers to load, then show grid
        Promise.all(coverPromises).then(() => {
            setIsGridLoading(false);
        });
    }, [viewMode]);

    // Load image and track loading state
    const loadImage = useCallback((albumId: string, imageIndex: number) => {
        const imagePath = getImagePath(albumId, imageIndex);
        
        // Check if already loaded - use a ref-like pattern by checking state
        setLoadedImages((prev) => {
            if (prev.has(imagePath)) {
                // Already loaded, mark as not loading
                setImageLoadingStates((prevStates) => {
                    const newMap = new Map(prevStates);
                    newMap.set(imageIndex, false);
                    return newMap;
                });
                return prev;
            }
            
            // Not loaded yet, set loading state
            setImageLoadingStates((prevStates) => {
                const newMap = new Map(prevStates);
                newMap.set(imageIndex, true);
                return newMap;
            });

            // Load the image
            const img = new Image();
            img.onload = () => {
                setLoadedImages((current) => new Set(current).add(imagePath));
                setImageLoadingStates((prevStates) => {
                    const newMap = new Map(prevStates);
                    newMap.set(imageIndex, false);
                    return newMap;
                });
            };
            img.onerror = () => {
                setImageLoadingStates((prevStates) => {
                    const newMap = new Map(prevStates);
                    newMap.set(imageIndex, false);
                    return newMap;
                });
            };
            img.src = imagePath;
            
            return prev;
        });
    }, []);

    // Load current image and preload adjacent images when album or index changes
    useLayoutEffect(() => {
        if (!currentAlbum || viewMode !== "imageViewer") return;

        // Load current image
        loadImage(currentAlbum.id, currentImageIndex);

        // Preload adjacent images in background (browser will handle caching)
        const preloadAdjacent = (offset: number) => {
            const targetIndex = currentImageIndex + offset;
            if (targetIndex >= 0 && targetIndex < currentAlbum.photoCount) {
                const imagePath = getImagePath(currentAlbum.id, targetIndex);
                const img = new Image();
                img.src = imagePath;
                img.decode?.().catch(() => {});
            }
        };

        // Preload next and previous images
        preloadAdjacent(1);
        preloadAdjacent(-1);
        preloadAdjacent(2);
        preloadAdjacent(-2);
    }, [currentAlbum, currentImageIndex, viewMode, loadImage]);

    const handleAlbumClick = useCallback((album: Album) => {
        // Reset loading states when switching albums
        setImageLoadingStates(new Map());
        setCurrentAlbum(album);
        setCurrentImageIndex(0);
        setViewMode("imageViewer");
    }, []);

    const handleNavigate = useCallback((direction: "prev" | "next") => {
        if (!currentAlbum) return;

        const maxIndex = currentAlbum.photoCount - 1;
        setCurrentImageIndex((prev) => {
            if (direction === "prev") {
                return prev > 0 ? prev - 1 : maxIndex;
            } else {
                return prev < maxIndex ? prev + 1 : 0;
            }
        });
    }, [currentAlbum]);

    const handleCloseImageViewer = useCallback(() => {
        setViewMode("grid");
        setCurrentAlbum(null);
        setCurrentImageIndex(0);
    }, []);

    // Keyboard navigation for image viewer
    useLayoutEffect(() => {
        if (viewMode !== "imageViewer") return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                handleNavigate("prev");
            } else if (e.key === "ArrowRight") {
                handleNavigate("next");
            } else if (e.key === "Escape") {
                handleCloseImageViewer();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [viewMode, handleNavigate, handleCloseImageViewer]);

    // Show grid loading bar
    if (viewMode === "grid" && isGridLoading) {
        return (
            <div className="album-viewer-container">
                <LoadingBar progress={gridLoadingProgress} />
            </div>
        );
    }

    // Image viewer view
    if (viewMode === "imageViewer" && currentAlbum) {
        const hasPrev = currentImageIndex > 0;
        const hasNext = currentImageIndex < currentAlbum.photoCount - 1;
        const currentImagePath = getImagePath(currentAlbum.id, currentImageIndex);
        const isLoading = imageLoadingStates.get(currentImageIndex) ?? true;

        return (
            <div className="album-image-viewer-container">
                <div className="image-viewer-content">
                    <div 
                        ref={imageContainerRef}
                        className="image-container"
                    >
                        <div className="album-image-wrapper">
                            <img
                                ref={currentImageRef}
                                key={`${currentAlbum.id}-${currentImageIndex}`}
                                src={currentImagePath}
                                alt={`${currentAlbum.name} - Image ${currentImageIndex + 1}`}
                                className="main-image"
                                loading="eager"
                                decoding="sync"
                                onLoad={() => {
                                    setImageLoadingStates((prev) => {
                                        const newMap = new Map(prev);
                                        newMap.set(currentImageIndex, false);
                                        return newMap;
                                    });
                                    setLoadedImages((prev) => new Set(prev).add(currentImagePath));
                                }}
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
                                    setImageLoadingStates((prev) => {
                                        const newMap = new Map(prev);
                                        newMap.set(currentImageIndex, false);
                                        return newMap;
                                    });
                                }}
                            />
                            {isLoading && (
                                <div className="album-loading-overlay">
                                    <div className="album-spinner"></div>
                                </div>
                            )}
                        </div>
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
                            onClick={handleCloseImageViewer}
                            className="nav-button close-button"
                            aria-label="Close album"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Grid view
    return (
        <div className="album-viewer-container grid-view">
            <div className="album-grid">
                {albums.map((album) => {
                    const coverPath = getAlbumCover(album.id);
                    return (
                        <div
                            key={album.id}
                            className="album-card"
                            onClick={() => handleAlbumClick(album)}
                        >
                            <div className="album-image">
                                <img
                                    src={coverPath}
                                    alt={album.name}
                                    loading="eager"
                                    decoding="sync"
                                    width={120}
                                    height={120}
                                />
                            </div>
                            <div className="album-name">{album.name}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AlbumViewer;
