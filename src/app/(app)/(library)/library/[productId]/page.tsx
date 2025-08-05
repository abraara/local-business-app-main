import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ProductView, ProductViewSkeleton } from "@/modules/library/ui/views/product-view";
import { Suspense } from "react";


interface Props {
    params: Promise<{ productId: string }>;
};

export const dynamic = "force-dynamic"; 

const Page = async ({ params }: Props) => {
    const { productId } = await params;
    const queryClient = getQueryClient();
     // Await both prefetch queries to ensure they complete
    await Promise.all([
        queryClient.prefetchQuery(trpc.library.getOne.queryOptions({
            productId,
        })),
        queryClient.prefetchQuery(trpc.reviews.getOne.queryOptions({
            productId,
        }))
    ]);
    
    // Get the dehydrated state once
    const dehydratedState = dehydrate(queryClient);
    return (
        <HydrationBoundary state={dehydratedState}>
            <Suspense fallback={<ProductViewSkeleton />}>
                <ProductView productId={productId} />
            </Suspense>
        </HydrationBoundary>
    )
}

export default Page;