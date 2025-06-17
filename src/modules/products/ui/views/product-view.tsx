"use client";

import { formatCurrency, generateTenantUrl } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { CheckIcon, LinkIcon, StarIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { Progress } from "@/components/ui/progress";
//import dynamic from "next/dynamic";
import { CartButton } from "../components/cart-button";
import { toast } from "sonner";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { ProductImageCarousel } from '@/modules/products/ui/components/product-image-carousel';

// const CartButton = dynamic(() => import("../components/cart-button").then((mod) => mod.CartButton), {
//     ssr: false,
//     loading: () => (
//                     <Button
//                     className="flex-1 bg-gray-200"
//                     >Add to Cart
//                     </Button>
//     ),
// });

interface ProductViewProps {
    productId: string;
    tenantSlug: string;
};

export const ProductView = ({ productId, tenantSlug }: ProductViewProps) => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.products.getOne.queryOptions({ id: productId }));

    const [ isCopied, setIsCopied ] = useState(false);

    return (
        <div className="px-4 lg:px-12 py-10">
            <div className="border rounded-sm bg-white overflow-hidden">
                <div className="relative aspect-[6/3] border-b">
                    <ProductImageCarousel
                        name={data.name}
                        cover={data?.cover?.url}
                        image={data?.image?.url}
                        image2={data?.image2?.url}
                        image3={data?.image3?.url}
                        image4={data?.image4?.url}
                        image5={data?.image5?.url}
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-6">
                    <div className="col-span-4">
                        <div className="p-6">
                            <h1 className="text-4xl font-medium">{data.name}</h1>
                        </div>
                        <div className="border-y flex">
                            <div className="px-6 py-4 flex items-center justify-center border-r">
                                <div className="px-2 py-1 border bg-gray-200 w-fit">
                                   <p className="text-sm font-medium">{formatCurrency(data.price)}</p>
                                </div>
                            </div>
                            <div className="px-6 py-4 flex items-center justify-center lg:border-r">
                                <Link href={generateTenantUrl(tenantSlug)} className="flex items-center gap-2 hover:underline">
                                    {data.tenant.image?.url && (
                                        <Image
                                            src={data.tenant.image.url}
                                            alt={data.tenant.name}
                                            width={20}
                                            height={20}
                                            className="rounded-full border shrink-0 size-[20px]"
                                        />
                                    )}
                                    <p className="text-base font-medium">{data.tenant.name}</p>
                                </Link>
                            </div>
                            <div className="hidden lg:flex px-6 py-4 items-center justify-center">
                                <div className="flex items-center gap-2">
                                    <StarRating rating={data.reviewRating} iconClassName="size-4" />
                                    <p className="text-base font-medium">{data.reviewCount} ratings</p>
                                </div>
                            </div>
                        </div>
                        <div className="block lg:hidden px-6 py-4 items-center justify-center border-b">
                            <div className="flex items-center gap-2">
                                <StarRating rating={data.reviewRating} iconClassName="size-4" />
                                <p className="text-base font-medium">{data.reviewCount} ratings</p>
                            </div>
                        </div>
                        <div className="p-6">
                            {data.description ? (
                                <RichText data={data.description} />
                            ) : (
                                <p className="font-medium text-muted-foreground">No description provided</p>
                            )}
                        </div>
                    </div>
                    <div className="col-span-2">
                        <div className="border-t lg:border-t-0 lg:border-l h-full">
                            <div className="flex flex-col gap-4 p-6 border-b">
                                <div className="flex flex-row items-center gap-2"> 
                                    <CartButton isPurchased={data.isPurchased} tenantSlug={tenantSlug} productId={productId} />                               
                                    <Button
                                    variant={'elevated'}
                                    className="size-10 cursor-pointer"
                                    onClick={() => {navigator.clipboard.writeText(window.location.href);
                                        toast.success("Product link copied to clipboard!");
                                        setIsCopied(true);
                                        setTimeout(() => {
                                            setIsCopied(false);
                                        }, 3000);
                                    }}
                                    disabled={isCopied}
                                    >
                                    {isCopied ? <CheckIcon className="text-green-500" /> : <LinkIcon />}
                                    </Button>
                                </div>
                                <p className="text-center font-medium">{data.refundPolicy === "no-refunds"
                                ? "No refunds"
                                : `${data.refundPolicy} money back guarantee`} </p>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Ratings</h3>
                                    <div className="flex items-center gap-x-1 font-medium">
                                        <StarIcon className="size-4 fill-black" />
                                        <p>({data.reviewRating})</p>
                                        <p className="text-base">{data.reviewCount} ratings</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-[auto_1fr_auto] gap-3 mt-4">
                                    {[5, 4, 3, 2, 1].map((stars) => (
                                        <Fragment key={stars}>
                                            <div className="font-medium">
                                                {stars} {stars === 1 ? "star" : "stars"}
                                            </div>
                                            <Progress
                                                value={data.ratingDistribution[stars] || 0}
                                                className="h-[1lh]"
                                            />
                                            <div className="font-medium">
                                                {data.ratingDistribution[stars] || 0}%
                                            </div>
                                        </Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ProductViewSkeleton = () => {
    return (
        <div className="px-4 lg:px-12 py-10">
            <div className="border rounded-sm bg-white overflow-hidden">
                <div className="relative aspect-[6/3] border-b">
                    <Image
                        src={"/placeholder.jpg"}
                        alt="Placeholder"
                        fill
                        className="object-contain object-center"
                    />
                </div>
            </div>
        </div>
    );
};
