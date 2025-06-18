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
};

export const ProductView = ({ productId, tenantSlug }: ProductViewProps) => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.products.getOne.queryOptions({ id: productId }));
    
    // Fetch reviews for this product
    const { data: reviewsData } = useSuspenseQuery(
        trpc.reviews.getByProduct.queryOptions({ productId })
    );
    
    const [currentImage, setCurrentImage] = useState(0);
    const [showZoom, setShowZoom] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const [isCopied, setIsCopied] = useState(false);
    const [reviewFilter, setReviewFilter] = useState<'newest' | 'helpful' | 'highest' | 'lowest'>('helpful');
    const [starFilter, setStarFilter] = useState<number | null>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const reviewsRef = useRef<HTMLDivElement>(null);
    
    // Build images array
    const images: string[] = [];
    if (data.cover?.url) images.push(data.cover.url);
    if (data.image?.url) images.push(data.image.url);
    if (data.image2?.url) images.push(data.image2.url);
    if (data.image3?.url) images.push(data.image3.url);
    if (data.image4?.url) images.push(data.image4.url);
    if (data.image5?.url) images.push(data.image5.url);
    
    if (images.length === 0) {
        images.push("/placeholder.jpg");
    }

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

    return (
        <div className="max-w-[1500px] mx-auto px-4 py-8">
            <div className="grid grid-cols-12 gap-8">
                {/* Left Column - Image Gallery */}
                <div className="col-span-12 lg:col-span-6 relative">
                    <div className="flex gap-4">
                        {/* Thumbnails */}
                        <div className="hidden md:flex flex-col gap-2 w-16">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImage(index)}
                                    className={`border rounded overflow-hidden ${
                                        index === currentImage 
                                            ? 'border-orange-500 shadow-md' 
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="relative aspect-square">
                                        <Image
                                            src={img}
                                            alt={`View ${index + 1}`}
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
                                className="relative aspect-square bg-white cursor-crosshair"
                                onMouseEnter={() => setShowZoom(true)}
                                onMouseLeave={() => setShowZoom(false)}
                                onMouseMove={handleMouseMove}
                            >
                                <Image
                                    src={images[currentImage] || "/placeholder.jpg"}
                                    alt={data.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                
                                {/* Hover box */}
                                {showZoom && (
                                    <div 
                                        className="absolute w-40 h-40 border-2 border-black/40 bg-black/10 pointer-events-none hidden lg:block"
                                        style={{
                                            left: `${zoomPosition.x}%`,
                                            top: `${zoomPosition.y}%`,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    />
                                )}
                            </div>
                            
                            {/* Mobile Thumbnails */}
                            <div className="flex md:hidden gap-2 mt-4 overflow-x-auto">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImage(index)}
                                        className={`border rounded p-1 flex-shrink-0 ${
                                            index === currentImage 
                                                ? 'border-orange-500' 
                                                : 'border-gray-300'
                                        }`}
                                    >
                                        <div className="relative w-12 h-12">
                                            <Image
                                                src={img}
                                                alt={`View ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Zoom Panel - Desktop only - Positioned absolutely */}
                    {showZoom && (
                        <div className="hidden lg:block absolute left-[calc(100%+2rem)] top-0 w-[600px] h-[600px] z-50">
                            <div className="relative w-full h-full bg-white border border-gray-300 shadow-2xl rounded-lg overflow-hidden">
                                <div 
                                    className="absolute inset-0"
                                    style={{
                                        backgroundImage: `url(${images[currentImage]})`,
                                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                        backgroundSize: '250%',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Right Column - Product Info */}
                <div className="col-span-12 lg:col-span-6">
                    {/* Title */}
                    <h1 className="text-2xl font-normal mb-2">{data.name}</h1>
                    
                    {/* Brand/Store */}
                    <div className="mb-2">
                        <span className="text-sm text-gray-600">Visit the </span>
                        <Link href={generateTenantUrl(tenantSlug)} className="text-sm text-blue-600 hover:text-orange-600 hover:underline">
                            {data.tenant.name} Store
                        </Link>
                    </div>
                    
                    {/* Ratings */}
                    {data.reviewCount > 0 && (
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">{data.reviewRating.toFixed(1)}</span>
                                <StarRating rating={data.reviewRating} iconClassName="w-4 h-4" />
                                <div className="relative group inline-block">
                                    <ChevronDownIcon className="w-4 h-4 text-gray-600 hover:text-gray-800 cursor-pointer" />
                                    
                                    {/* Rating Distribution Popover */}
                                    <div className="invisible group-hover:visible absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <StarRating rating={data.reviewRating} iconClassName="w-5 h-5" />
                                                <span className="text-lg font-medium">{data.reviewRating.toFixed(1)} out of 5</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{data.reviewCount} global ratings</p>
                                            
                                            <div className="space-y-2 pt-2">
                                                {[5, 4, 3, 2, 1].map((stars) => (
                                                    <div key={stars} className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                                            className="text-sm w-12 text-blue-600 hover:text-orange-600 hover:underline text-left"
                                                        >
                                                            {stars} star
                                                        </button>
                                                        <Progress
                                                            value={data.ratingDistribution[stars] || 0}
                                                            className="flex-1 h-4"
                                                        />
                                                        <span className="text-sm w-10 text-right">
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
                            <button 
                                onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                className="text-sm text-blue-600 hover:text-orange-600 hover:underline"
                            >
                                {data.reviewCount} ratings
                            </button>
                        </div>
                    )}
                    
                    <hr className="my-4" />
                    
                    {/* Price */}
                    <div className="mb-6">
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm text-gray-600">Price:</span>
                            <span className="text-3xl font-light">{formatCurrency(data.price)}</span>
                        </div>
                    </div>
                    
                    {/* Description */}
                    <div className="mb-6">
                        <h3 className="font-bold text-base mb-2">About this item</h3>
                        <div className="text-sm text-gray-700">
                            {data.description ? (
                                <RichText data={data.description} />
                            ) : (
                                <p className="text-muted-foreground">No description provided</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Purchase Box */}
                    <div className="border border-gray-300 rounded-lg p-4">
                        <div className="text-xl mb-2">{formatCurrency(data.price)}</div>
                        <div className="text-sm text-green-700 mb-4">In Stock</div>
                        
                        <div className="space-y-3">
                            <CartButton 
                                isPurchased={data.isPurchased} 
                                tenantSlug={tenantSlug} 
                                productId={productId} 
                            />
                            
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success("Product link copied to clipboard!");
                                        setIsCopied(true);
                                        setTimeout(() => setIsCopied(false), 3000);
                                    }}
                                    disabled={isCopied}
                                    className="flex items-center gap-2"
                                >
                                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
                                    <span className="text-xs">Share</span>
                                </Button>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t text-xs text-gray-600">
                            <div className="mb-2">
                                {data.refundPolicy === "no-refunds"
                                    ? "No refunds"
                                    : `${data.refundPolicy} money back guarantee`}
                            </div>
                            <div>Sold by {data.tenant.name}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Reviews Section */}
            <div ref={reviewsRef} className="mt-12 border-t pt-8">
                <h2 className="text-xl font-bold mb-6">Customer reviews</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Rating Summary */}
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
                                    onClick={() => {
                                        setStarFilter(starFilter === stars ? null : stars);
                                        reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className={`flex items-center gap-2 w-full hover:bg-gray-50 p-1 -m-1 rounded ${
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
                                            : 'text-blue-600 hover:text-orange-600'
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
                                onClick={() => {
                                    if (data.isPurchased) {
                                        // Redirect to library page where they can review
                                        window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/library/${productId}`;
                                    } else {
                                        // Show message or redirect to product page
                                        toast.error("You need to purchase this product before reviewing it");
                                    }
                                }}
                            >
                                Write a customer review
                            </Button>
                        </div>
                    </div>
                    
                    {/* Reviews List */}
                        <div className="lg:col-span-2">
                            {/* Review Filter UI */}
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-sm font-medium">Sort by:</span>
                                <select
                                    value={reviewFilter}
                                    onChange={e => setReviewFilter(e.target.value as typeof reviewFilter)}
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
                                    {reviewsData && reviewsData.docs.length > 0 ? (
                                        // Apply review filter before mapping
                                        [...reviewsData.docs]
                                            .filter((review) => starFilter ? review.rating === starFilter : true)
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
                                                        // If you have a "helpfulCount", sort by it, else fallback to newest
                                                        return (
                                                            //b.helpfulCount || 0) - (a.helpfulCount || 0) ||
                                                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                                                }
                                            })
                                            .map((review) => {
                                                const userName = review.user?.name || review.user?.email?.split('@')[0] || 'Customer';
                                                const initials = userName
                                                    .split(' ')
                                                    .map((n: string) => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 2);

                                                // Generate a smart title from the review description
                                                const generateReviewTitle = (description: string, rating: number) => {
                                                    const firstSentence = description.match(/^[^.!?]+[.!?]?/)?.[0] || description;
                                                    if (firstSentence.length <= 60) {
                                                        return firstSentence.replace(/[.!?]$/, '');
                                                    }
                                                    const lowerDesc = description.toLowerCase();
                                                    if (rating >= 4) {
                                                        if (lowerDesc.includes('excellent')) return 'Excellent product!';
                                                        if (lowerDesc.includes('perfect')) return 'Perfect for my needs';
                                                        if (lowerDesc.includes('love')) return 'Love this product';
                                                        if (lowerDesc.includes('great')) return 'Great purchase';
                                                        if (lowerDesc.includes('recommend')) return 'Highly recommend';
                                                        if (lowerDesc.includes('quality')) return 'Great quality';
                                                        if (lowerDesc.includes('amazing')) return 'Amazing product';
                                                    }
                                                    const words = description.split(' ').slice(0, 8).join(' ');
                                                    return words + (words.length < description.length ? '...' : '');
                                                };

                                                const reviewTitle = generateReviewTitle(review.description, review.rating);

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
                                                            <span className="font-medium text-sm">{reviewTitle}</span>
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
                                            <p className="mb-4">No reviews yet. Be the first to review this product!</p>
                                            <Button variant="outline">Write a review</Button>
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