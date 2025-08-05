import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { SearchParams } from "nuqs/server";
import { LoadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/ui/views/product-list-view";
import { DEFAULT_LIMIT } from "@/constants";

interface Props {
    searchParams: Promise<SearchParams>,
};

const Page = async ({searchParams}: Props) => {

    const filters = await LoadProductFilters(searchParams);

    const queryClient = getQueryClient();
     // Await the prefetch to ensure it completes
    await queryClient.prefetchInfiniteQuery(
        trpc.products.getMany.infiniteQueryOptions({ 
            ...filters, 
            limit: DEFAULT_LIMIT 
        })
    );
    
    // Get the dehydrated state once
    const dehydratedState = dehydrate(queryClient);

    return (
        <HydrationBoundary state={dehydratedState}>
            <ProductListView />
        </HydrationBoundary>
    );
};

export default Page;