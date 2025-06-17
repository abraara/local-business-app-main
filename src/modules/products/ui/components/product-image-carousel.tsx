import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";

interface ProductImageCarouselProps {
    name: string;
    cover?: string | null;
    image?: string | null;
    image2?: string | null;
    image3?: string | null;
    image4?: string | null;
    image5?: string | null;
}

export const ProductImageCarousel = ({
    name,
    cover,
    image,
    image2,
    image3,
    image4,
    image5,
}: ProductImageCarouselProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
    
    // Create array of available images
    const images = useMemo(() => {
        const imageArray: string[] = [];
        
        if (cover) imageArray.push(cover);
        if (image) imageArray.push(image);
        if (image2) imageArray.push(image2);
        if (image3) imageArray.push(image3);
        if (image4) imageArray.push(image4);
        if (image5) imageArray.push(image5);
        
        if (imageArray.length === 0) {
            imageArray.push("/placeholder.jpg");
        }
        
        return imageArray;
    }, [cover, image, image2, image3, image4, image5]);

    // Preload adjacent images for smoother transitions
    useEffect(() => {
        const nextIndex = (currentImageIndex + 1) % images.length;
        const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
        
        setLoadedImages(prev => new Set([...prev, nextIndex, prevIndex]));
    }, [currentImageIndex, images.length]);

    const handleImageChange = (newIndex: number) => {
        if (newIndex === currentImageIndex) return;
        
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentImageIndex(newIndex);
            setIsTransitioning(false);
        }, 150);
    };

    const handlePrevImage = () => {
        const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
        handleImageChange(newIndex);
    };

    const handleNextImage = () => {
        const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
        handleImageChange(newIndex);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrevImage();
            if (e.key === 'ArrowRight') handleNextImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentImageIndex]);

    return (
        <div className="relative bg-gradient-to-b from-gray-50 to-white rounded-lg overflow-hidden">
            {/* Main Image Container */}
            <div className="relative aspect-square md:aspect-[6/3] bg-white">
                <div className={`absolute inset-0 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <Image
                        src={images[currentImageIndex] || "/placeholder.jpg"}
                        alt={`${name} - Image ${currentImageIndex + 1}`}
                        fill
                        className="object-cover"
                        priority={currentImageIndex === 0}
                        quality={90}
                    />
                </div>
                
                {/* Gradient Overlays for depth */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/5 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/5 to-transparent" />
                </div>
                
                {/* Navigation Arrows - Only show if more than 1 image */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            aria-label="Previous image"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            aria-label="Next image"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </>
                )}
                
                {/* Image Counter Badge */}
                {images.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {images.length}
                    </div>
                )}
            </div>
            
            {/* Thumbnail Strip - Only show if more than 1 image */}
            {images.length > 1 && (
                <div className="bg-white border-t">
                    <div className="flex gap-2 p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {images.map((imageUrl, index) => (
                            <button
                                key={index}
                                onClick={() => handleImageChange(index)}
                                className={`relative flex-shrink-0 transition-all duration-200 ${
                                    index === currentImageIndex 
                                        ? 'ring-2 ring-black ring-offset-2 scale-105' 
                                        : 'hover:ring-2 hover:ring-gray-400 hover:ring-offset-2'
                                }`}
                            >
                                <div className={`relative w-20 h-20 rounded-lg overflow-hidden ${
                                    index === currentImageIndex ? '' : 'opacity-70 hover:opacity-100'
                                }`}>
                                    <Image
                                        src={imageUrl || "/placeholder.jpg"}
                                        alt={`${name} - Thumbnail ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        loading={loadedImages.has(index) ? "eager" : "lazy"}
                                    />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Modern Dots Indicator for Mobile */}
            {images.length > 1 && (
                <div className="flex justify-center gap-2 pb-4 sm:hidden">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleImageChange(index)}
                            className={`transition-all duration-300 ${
                                index === currentImageIndex 
                                    ? 'w-8 h-2 bg-black rounded-full' 
                                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400 rounded-full'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};