import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { SearchParams } from "nuqs/server";
import { LoadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/ui/views/product-list-view";
import { DEFAULT_LIMIT } from "@/constants";

interface Props {
    params: Promise<{ category: string }>,
    searchParams: Promise<SearchParams>,
};

export const dynamic = "force-dynamic"; 

const Page = async ({params, searchParams}: Props) => {
    const {category} = await params;
    const filters = await LoadProductFilters(searchParams);

    const queryClient = getQueryClient();
    await queryClient.prefetchInfiniteQuery(trpc.products.getMany.infiniteQueryOptions({ category, ...filters, limit: DEFAULT_LIMIT }));
    // Get the dehydrated state once
    const dehydratedState = dehydrate(queryClient);

    return (
        <HydrationBoundary state={dehydratedState}>
            <ProductListView category={category} />
        </HydrationBoundary>
    );
};

export default Page;