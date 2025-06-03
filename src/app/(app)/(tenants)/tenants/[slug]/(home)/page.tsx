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

const Page = async ({ searchParams, params }: Props) => {
    const filters = await LoadProductFilters(searchParams);
    const { slug } = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchInfiniteQuery(trpc.products.getMany.infiniteQueryOptions({ tenantSlug: slug, ...filters, limit: DEFAULT_LIMIT }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductListView tenantSlug={slug} narrowView />
        </HydrationBoundary>
    );
};

export default Page;
