import type { SearchParams } from "nuqs/server";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc, getQueryClient } from "@/trpc/server";
import { ProductListView } from "@/modules/products/ui/views/product-list-view";
import { LoadProductFilters } from "@/modules/products/search-params";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

interface Props {
    searchParams: Promise<SearchParams>;
    params: Promise<{ slug: string }>;
};  

export const dynamic = "force-dynamic"; 

const Page = async ({ searchParams, params }: Props) => {
    const filters = await LoadProductFilters(searchParams);
    const { slug } = await params;

    const queryClient = getQueryClient();
    await queryClient.prefetchInfiniteQuery(trpc.products.getMany.infiniteQueryOptions({ tenantSlug: slug, ...filters, limit: DEFAULT_LIMIT }));
    // Get the dehydrated state once
    const dehydratedState = dehydrate(queryClient);

    return (
        <HydrationBoundary state={dehydratedState}>
            <ProductListView tenantSlug={slug} narrowView />
        </HydrationBoundary>
    );
};

export default Page;
