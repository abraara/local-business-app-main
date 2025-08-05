import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ProductListView } from "@/modules/products/ui/views/product-list-view";
import type { SearchParams } from "nuqs/server";
import { LoadProductFilters } from "@/modules/products/search-params";
import { DEFAULT_LIMIT } from "@/constants";

interface Props {
    params: Promise<{ subcategory: string }>,
    searchParams: Promise<SearchParams>,
};

export const dynamic = "force-dynamic"; 

const Page = async ({params, searchParams}: Props) => {
    const {subcategory} = await params;
    const filters = await LoadProductFilters(searchParams);

    const queryClient = getQueryClient();
    await queryClient.prefetchInfiniteQuery(trpc.products.getMany.infiniteQueryOptions({ category: subcategory, ...filters, limit: DEFAULT_LIMIT }));
    // Get the dehydrated state once
    const dehydratedState = dehydrate(queryClient);

    return (
        <HydrationBoundary state={dehydratedState}>
            <ProductListView category={subcategory} />
        </HydrationBoundary>
    );
};

export default Page;