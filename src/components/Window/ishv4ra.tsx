import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import React, { useEffect, useState, useCallback } from 'react';
import { photoCollections, photoData } from '../../data/photos';
import './ishv4ra.css';

interface PhotoCollection {
    id: string;
    name: string;
    path: string;
    photoCount: number;
}

interface Photo {
    id: string;
    name: string;
    path: string;
    collection: string;
}

interface Ishv4raProps {
    onOpenCollection?: (collection: PhotoCollection) => void;
}

type ViewMode = 'grid' | 'imageViewer';

const Ishv4ra: React.FC<Ishv4raProps> = ({ onOpenCollection }) => {
    const collections: PhotoCollection[] = photoCollections;
    const [lastClickTime, setLastClickTime] = useState(0);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [currentCollection, setCurrentCollection] = useState<PhotoCollection | null>(null);
    const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
    // preloadedImages state removed - all images are now preloaded globally

    // Function to get the first photo from a collection
    const getFirstPhotoFromCollection = (collectionId: string) => {
        const firstPhoto = photoData.find(photo => photo.collection === collectionId);
        return firstPhoto;
    };

    // Get photos for current collection
    const getPhotosForCollection = (collectionId: string) => {
        return photoData.filter(photo => photo.collection === collectionId);
    };

    // Note: Image preloading is now handled globally in Desktop component

    // Note: All images are now preloaded globally, so no need for adjacent preloading

    const handleCollectionClick = useCallback((collection: PhotoCollection) => {
        const now = Date.now();
        // Prevent rapid double-clicks
        if (now - lastClickTime > 300) {
            setLastClickTime(now);
            setCurrentCollection(collection);
            setViewMode('imageViewer');
            // Set to first photo in collection
            const firstPhoto = getFirstPhotoFromCollection(collection.id);
            if (firstPhoto) {
                setCurrentPhoto(firstPhoto);
            }
        }
    }, [lastClickTime]);

    const handleNavigate = useCallback((direction: 'prev' | 'next') => {
        if (!currentPhoto || !currentCollection) return;
        
        const photos = getPhotosForCollection(currentCollection.id);
        const currentIndex = photos.findIndex(p => p.id === currentPhoto.id);
        
        if (direction === 'prev' && currentIndex > 0) {
            setCurrentPhoto(photos[currentIndex - 1]);
        } else if (direction === 'next' && currentIndex < photos.length - 1) {
            setCurrentPhoto(photos[currentIndex + 1]);
        }
    }, [currentPhoto, currentCollection]);

    const handleBackToGrid = useCallback(() => {
        setViewMode('grid');
        setCurrentCollection(null);
        setCurrentPhoto(null);
    }, []);

    if (viewMode === 'imageViewer' && currentPhoto && currentCollection) {
        const photos = getPhotosForCollection(currentCollection.id);
        const currentIndex = photos.findIndex(p => p.id === currentPhoto.id);
        const hasPrev = currentIndex > 0;
        const hasNext = currentIndex < photos.length - 1;
        
        // Debug logging

        return (
            <div className="ishv4ra-container image-viewer">
                {/* Header */}
                <div className="image-viewer-header">
                    {/* Empty header for now */}
                </div>

                {/* Image Container */}
                <div className="image-container">
                    <div className="image-wrapper">
                        <img 
                            src={currentPhoto.path}
                            alt={currentPhoto.name}
                            className="main-image"
                            onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.style.display = 'none';
                                const parent = img.parentElement;
                                if (parent) {
                                    parent.innerHTML = `
                                        <div class="error-message">
                                            <div>Image Failed to Load</div>
                                            <div class="error-sub-message">Check the image path: ${currentPhoto.path}</div>
                                        </div>
                                    `;
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Footer with Navigation Buttons */}
                <div className="image-viewer-footer">
                    <div className="button-group">
                        <button 
                            onClick={() => handleNavigate('prev')}
                            disabled={!hasPrev}
                            className="nav-button prev-button"
                        >
                            {FaChevronLeft({})}
                        </button>
                        <button 
                            onClick={() => handleNavigate('next')}
                            disabled={!hasNext}
                            className="nav-button next-button"
                        >
                            {FaChevronRight({})}
                        </button>
                        <button 
                            onClick={handleBackToGrid}
                            className="nav-button close-button"
                        >
                            {FaTimes({})}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ishv4ra-container">
            <div className="album-grid">
                {collections.map(collection => {
                    const firstPhoto = getFirstPhotoFromCollection(collection.id);
                    
                    return (
                        <div
                            key={collection.id}
                            className="album-card"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCollectionClick(collection);
                            }}
                        >
                            <div className="album-image">
                                {firstPhoto ? (
                                    <img 
                                        src={firstPhoto.path} 
                                        alt={firstPhoto.name}
                                    />
                                ) : (
                                    <div className="folder-icon">📁</div>
                                )}
                            </div>
                            <div className="album-info">
                                <div className="album-name">{collection.name}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}; export default Ishv4ra; // By John Michael