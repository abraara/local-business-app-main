"use client";

import { formatCurrency, generateTenantUrl } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronDownIcon, LinkIcon, VerifiedIcon } from "lucide-react";
import { useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { RichText } from "@payloadcms/richtext-lexical/react";

const CartButton = dynamic(() => import("../components/cart-button").then((mod) => mod.CartButton), {
    ssr: false,
    loading: () => (
        <Button className="flex-1 bg-gray-200">Add to Cart</Button>
    ),
});

interface ProductViewProps {
    productId: string;
    tenantSlug: string;
}

type ReviewFilter = 'newest' | 'helpful' | 'highest' | 'lowest';

export const ProductView = ({ productId, tenantSlug }: ProductViewProps) => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.products.getOne.queryOptions({ id: productId }));
    const { data: reviewsData } = useSuspenseQuery(
        trpc.reviews.getByProduct.queryOptions({ productId })
    );
    
    // State management
    const [currentImage, setCurrentImage] = useState(0);
    const [showZoom, setShowZoom] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const [isCopied, setIsCopied] = useState(false);
    const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('helpful');
    const [starFilter, setStarFilter] = useState<number | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    
    // Refs
    const imageRef = useRef<HTMLDivElement>(null);
    const reviewsRef = useRef<HTMLDivElement>(null);
    
    // Build images array
    const images = [
        data.cover?.url,
        data.image?.url,
        data.image2?.url,
        data.image3?.url,
        data.image4?.url,
        data.image5?.url
    ].filter(Boolean) as string[];
    
    if (images.length === 0) {
        images.push("/placeholder.jpg");
    }

    // Handlers
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current || !showZoom) return;
        
        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        setZoomPosition({ 
            x: Math.max(0, Math.min(100, x)), 
            y: Math.max(0, Math.min(100, y)) 
        });
    };

    const handleShareClick = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Product link copied to clipboard!");
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    const handleWriteReview = () => {
        if (data.isPurchased) {
            window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/library/${productId}`;
        } else {
            toast.error("You need to purchase this product before reviewing it");
        }
    };

    const handleStarFilterClick = (stars: number) => {
        setStarFilter(starFilter === stars ? null : stars);
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Touch handlers for swipe
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0]?.clientX ?? null);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0]?.clientX ?? null);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && currentImage < images.length - 1) {
            setCurrentImage(currentImage + 1);
        }
        if (isRightSwipe && currentImage > 0) {
            setCurrentImage(currentImage - 1);
        }
    };

    // Sort and filter reviews
    const getSortedReviews = () => {
        if (!reviewsData?.docs) return [];
        
        return [...reviewsData.docs]
            .filter(review => !starFilter || review.rating === starFilter)
            .sort((a, b) => {
                switch (reviewFilter) {
                    case "newest":
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    case "highest":
                        return b.rating - a.rating;
                    case "lowest":
                        return a.rating - b.rating;
                    case "helpful":
                    default:
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
            });
    };

    const sortedReviews = getSortedReviews();

    return (
        <div className="max-w-[1500px] mx-auto px-4 py-8">
            <div className="grid grid-cols-12 gap-8">
                {/* Left Column - Image Gallery */}
                <div className="col-span-12 lg:col-span-6 relative">
                    <div className="flex gap-4">
                        {/* Desktop Thumbnails */}
                        <div className="hidden md:flex flex-col gap-2 w-16">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImage(idx)}
                                    className={`border rounded overflow-hidden transition-all ${
                                        idx === currentImage 
                                            ? 'border-orange-500 shadow-md' 
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="relative aspect-square">
                                        <Image
                                            src={img}
                                            alt={`View ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        {/* Main Image */}
                        <div className="flex-1">
                            <div 
                                ref={imageRef}
                                className="relative aspect-square bg-white overflow-hidden group"
                                onMouseEnter={() => setShowZoom(true)}
                                onMouseLeave={() => setShowZoom(false)}
                                onMouseMove={handleMouseMove}
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                            >
                                {/* Image Container with Zoom */}
                                <div
                                    className="absolute inset-0 transition-transform duration-500 ease-out cursor-zoom-in"
                                    style={{
                                        transform: showZoom 
                                            ? `scale(1.5) translate(${50 - zoomPosition.x}%, ${50 - zoomPosition.y}%)` 
                                            : 'scale(1)',
                                        transformOrigin: 'center',
                                        cursor: showZoom ? 'zoom-out' : 'zoom-in'
                                    }}
                                >
                                    <Image
                                        src={images[currentImage] || "/placeholder.jpg"}
                                        alt={`${data.name} - Image ${currentImage + 1}`}
                                        fill
                                        className="object-cover"
                                        priority
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        quality={100}
                                    />
                                </div>
                                
                                {/* Zoom Indicator Overlay */}
                                <div 
                                    className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
                                        showZoom ? 'opacity-100' : 'opacity-0'
                                    }`}
                                >
                                    <div 
                                        className="absolute w-20 h-20 rounded-full border-2 border-white/80 bg-black/20 backdrop-blur-sm"
                                        style={{
                                            left: `${zoomPosition.x}%`,
                                            top: `${zoomPosition.y}%`,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    >
                                        <div className="absolute inset-0 rounded-full border border-black/30" />
                                    </div>
                                </div>
                                
                                {/* Image indicators for mobile */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 lg:hidden">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImage(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${
                                                idx === currentImage 
                                                    ? 'bg-white w-6' 
                                                    : 'bg-white/60'
                                            }`}
                                            aria-label={`Go to image ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            {/* Mobile Thumbnails */}
                            <div className="flex md:hidden gap-2 mt-4 overflow-x-auto">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImage(idx)}
                                        className={`border rounded p-1 flex-shrink-0 ${
                                            idx === currentImage 
                                                ? 'border-orange-500' 
                                                : 'border-gray-300'
                                        }`}
                                    >
                                        <div className="relative w-12 h-12">
                                            <Image
                                                src={img}
                                                alt={`View ${idx + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    </div>
                    
                    {/* Zoom Icon */}
                    {showZoom && (
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg z-10">
                            <ChevronDownIcon 
                                className="w-6 h-6 text-gray-600 cursor-pointer" 
                                onClick={() => setShowZoom(false)} 
                            />
                        </div>
                    )}
                
                {/* Right Column - Product Info */}
                <div className="col-span-12 lg:col-span-6 flex flex-col h-full">
                    <div className="flex-grow">
                        <h1 className="text-3xl font-medium mb-3">{data.name}</h1>
                        
                        <div className="mb-4">
                            <span className="text-gray-500">Sold by: </span>
                            <Link href={generateTenantUrl(tenantSlug)} className="text-gray-900 underline font-medium hover:text-orange-600 transition-colors">
                                {data.tenant.name}
                            </Link>
                        </div>
                    {/* Ratings Box - Always shown */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-4 border border-gray-200 shadow-sm">
                        {data.reviewCount > 0 ? (
                            <>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-3xl font-semibold text-gray-900">{data.reviewRating.toFixed(1)}</span>
                                    <div className="flex items-center">
                                        <StarRating rating={data.reviewRating} iconClassName="w-5 h-5" />
                                        <div className="relative group inline-block ml-2">
                                        <ChevronDownIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer hidden lg:inline-block transition-colors" />
                                        
                                        {/* Enhanced Rating Distribution Popover */}
                                        <div className="invisible group-hover:visible absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                            <div className="p-4 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <StarRating rating={data.reviewRating} iconClassName="w-5 h-5" />
                                                    <span className="text-lg font-medium">{data.reviewRating.toFixed(1)} out of 5</span>
                                                </div>
                                                <p className="text-sm text-gray-600">{data.reviewCount} global ratings</p>
                                                
                                                {starFilter && (
                                                    <div className="bg-orange-50 border border-orange-200 rounded p-2 text-sm mb-2">
                                                        <span className="text-orange-800">Filtering by: {starFilter} star reviews</span>
                                                        <button
                                                            onClick={() => setStarFilter(null)}
                                                            className="ml-2 text-orange-600 hover:text-orange-800 underline"
                                                        >
                                                            Clear filter
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                <div className="space-y-2 pt-2">
                                                    {[5, 4, 3, 2, 1].map((stars) => (
                                                        <div 
                                                            key={stars} 
                                                            onClick={() => handleStarFilterClick(stars)}
                                                            className={`flex items-center gap-2 p-1 -m-1 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                                                                starFilter === stars ? 'bg-orange-50' : ''
                                                            }`}
                                                        >
                                                            <span className={`text-sm w-12 ${
                                                                starFilter === stars 
                                                                    ? 'text-orange-600 font-medium' 
                                                                    : 'text-blue-600 hover:text-orange-600'
                                                            }`}>
                                                                {stars} star
                                                            </span>
                                                            <Progress
                                                                value={data.ratingDistribution[stars] || 0}
                                                                className="flex-1 h-4"
                                                            />
                                                            <span className={`text-sm w-10 text-right ${
                                                                starFilter === stars ? 'text-orange-600 font-medium' : ''
                                                            }`}>
                                                                {data.ratingDistribution[stars] || 0}%
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <div className="pt-3 border-t">
                                                    <button 
                                                        onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                                        className="text-sm text-blue-600 hover:text-orange-600 hover:underline"
                                                    >
                                                        See all customer reviews
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                    
                                </div>
                                <div className="text-sm text-gray-500 mb-2">{data.reviewCount} customer reviews</div>
                                <Button 
                                    onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                    variant="outline"
                                    className="w-full hover:bg-gray-50 hover:text-orange-600 cursor-pointer transition-colors"
                                >
                                    Read all reviews
                                </Button>
                            </>
                        ) : (
                            <div className="text-center py-2">
                                <div className="flex justify-center mb-3">
                                    <StarRating rating={0} iconClassName="w-6 h-6 text-gray-300" />
                                </div>
                                <p className="text-gray-600 font-medium mb-2">No reviews yet</p>
                                <p className="text-sm text-gray-500 mb-1">Be the first to share your thoughts!</p>
                                {/* <Button 
                                    onClick={handleWriteReview}
                                    variant="outline"
                                    className="w-full hover:bg-gray-50 hover:text-orange-600 cursor-pointer transition-colors"
                                >
                                    Write a review
                                </Button> */}
                            </div>
                        )}
                    </div>
                        
                    </div>
                    
                    {/* Purchase Box - Aligned to bottom */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 w-full mt-auto border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-2xl font-semibold text-gray-900">{formatCurrency(data.price)}</div>
                                <div className="text-sm text-gray-500 mt-1">One-time purchase</div>
                            </div>
                           
                        </div>
                            <div className="mb-4">
                                <div className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    {/* TODO: Replace with actual stock status*/}
                                    In Stock
                                </div>
                            </div>
                        <div className="flex items-center">
                            <CartButton 
                                isPurchased={data.isPurchased} 
                                tenantSlug={tenantSlug} 
                                productId={productId} 
                            />
                            
                            <div className="px-2">
                                <Button
                                    variant="elevated"
                                    onClick={handleShareClick}
                                    disabled={isCopied}
                                    className="flex-1 hover:bg-gray-50 cursor-pointer"
                                >
                                    {isCopied ? (
                                        <>
                                            <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <LinkIcon className="w-4 h-4 mr-2" />
                                            <span>Share</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span>{data.refundPolicy === "no-refunds" ? "Final sale" : `${data.refundPolicy} guarantee`}</span>
                                </div>
                                <Link href={generateTenantUrl(tenantSlug)} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                    {data.tenant.name}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Full Width Description Section */}
            <div className="mt-12 border-t pt-8">
                <h2 className="text-xl font-bold mb-4">Product Details</h2>
                <div className="prose max-w-none">
                    <h3 className="font-bold text-base mb-2">About this item</h3>
                    <div className="text-sm text-gray-700">
                        {data.description ? (
                            <RichText data={data.description} />
                        ) : (
                            <p className="text-muted-foreground">No description provided</p>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Reviews Section */}
            <div ref={reviewsRef} className="mt-12 border-t pt-8">
                <h2 className="text-xl font-bold mb-6">Customer reviews</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Rating Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <StarRating rating={data.reviewRating} iconClassName="w-5 h-5" />
                            <span className="text-lg font-medium">{data.reviewRating.toFixed(1)} out of 5</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{data.reviewCount} global ratings</p>
                        
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((stars) => (
                                <button
                                    key={stars}
                                    onClick={() => handleStarFilterClick(stars)}
                                    className={`flex items-center gap-2 w-full hover:bg-gray-50 p-1 -m-1 rounded transition-colors ${
                                        starFilter === stars ? 'bg-gray-100' : ''
                                    }`}
                                >
                                    <span className={`text-sm w-12 ${
                                        starFilter === stars 
                                            ? 'text-orange-600 font-medium' 
                                            : 'text-blue-600 hover:text-orange-600'
                                    }`}>
                                        {stars} star
                                    </span>
                                    <Progress
                                        value={data.ratingDistribution[stars] || 0}
                                        className="flex-1 h-4"
                                    />
                                    <span className={`text-sm w-10 text-right ${
                                        starFilter === stars 
                                            ? 'text-orange-600 font-medium' 
                                            : ''
                                    }`}>
                                        {data.ratingDistribution[stars] || 0}%
                                    </span>
                                </button>
                            ))}
                        </div>
                        
                        {starFilter && (
                            <div className="mt-2">
                                <button
                                    onClick={() => setStarFilter(null)}
                                    className="text-sm text-blue-600 hover:text-orange-600 hover:underline"
                                >
                                    Clear filter
                                </button>
                            </div>
                        )}
                        
                        <hr className="my-6" />
                        
                        <div>
                            <h3 className="font-medium mb-2">Review this product</h3>
                            <p className="text-sm text-gray-600 mb-4">Share your thoughts with other customers</p>
                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={handleWriteReview}
                            >
                                Write a customer review
                            </Button>
                        </div>
                    </div>
                    
                    {/* Reviews List */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-sm font-medium">Sort by:</span>
                            <select
                                value={reviewFilter}
                                onChange={e => setReviewFilter(e.target.value as ReviewFilter)}
                                className="border rounded px-2 py-1 text-sm"
                            >
                                <option value="helpful">Most Helpful</option>
                                <option value="newest">Newest</option>
                                <option value="highest">Highest Rated</option>
                                <option value="lowest">Lowest Rated</option>
                            </select>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-medium mb-4">Top reviews</h3>
                            
                            <div className="space-y-6">
                                {sortedReviews.length > 0 ? (
                                    sortedReviews.map((review) => {
                                        const userName = review.user?.name || review.user?.email?.split('@')[0] || 'Customer';
                                        const initials = userName
                                            .split(' ')
                                            .map((n: string) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2);

                                        return (
                                            <div key={review.id} className="border-b pb-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-medium">{initials}</span>
                                                    </div>
                                                    <span className="font-medium text-sm">{userName}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 mb-2">
                                                    <StarRating rating={review.rating} iconClassName="w-4 h-4" />
                                                    <span className="font-medium text-sm">{review.heading}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                                                    <span>Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}</span>
                                                    <span>•</span>
                                                    <span className="text-orange-600 flex items-center gap-1">
                                                        <VerifiedIcon className="w-3 h-3" />
                                                        Verified Purchase
                                                    </span>
                                                </div>
                                                
                                                <p className="text-sm text-gray-700 mb-3">
                                                    {review.description}
                                                </p>
                                                
                                                <div className="flex items-center gap-4 text-sm">
                                                    <button className="text-gray-600 hover:text-gray-800">
                                                        Helpful
                                                    </button>
                                                    <span className="text-gray-400">|</span>
                                                    <button className="text-gray-600 hover:text-gray-800">
                                                        Report
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="mb-4">
                                            {starFilter 
                                                ? `No ${starFilter}-star reviews yet.`
                                                : "No reviews yet. Be the first to review this product!"
                                            }
                                        </p>
                                        {starFilter && (
                                            <Button 
                                                variant="outline" 
                                                onClick={() => setStarFilter(null)}
                                                className="mr-2"
                                            >
                                                Clear filter
                                            </Button>
                                        )}
                                        <Button variant="outline" onClick={handleWriteReview}>
                                            Write a review
                                        </Button>
                                    </div>
                                )}
                            </div>
                            
                            {reviewsData && reviewsData.docs.length > 5 && (
                                <div className="mt-6">
                                    <Button variant="outline" className="w-full">
                                        See all {reviewsData.totalDocs} reviews
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ProductViewSkeleton = () => {
    return (
        <div className="max-w-[1500px] mx-auto px-4 py-8">
            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-6">
                    <div className="aspect-square bg-gray-100 animate-pulse" />
                </div>
                <div className="col-span-12 lg:col-span-6">
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3 mb-4" />
                    <div className="h-12 bg-gray-200 rounded animate-pulse w-1/4" />
                </div>
            </div>
        </div>
    );
};