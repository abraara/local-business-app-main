import { LibraryView } from "@/modules/library/ui/views/library-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { DEFAULT_LIMIT } from "@/constants";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const dynamic = "force-dynamic"; 

const Page = async () => {
    const queryClient = getQueryClient();
    await queryClient.prefetchInfiniteQuery(trpc.library.getMany.infiniteQueryOptions({
        limit: DEFAULT_LIMIT,
    }));
    // Get the dehydrated state once
    const dehydratedState = dehydrate(queryClient);
    return (
        <HydrationBoundary state={dehydratedState}>
            <LibraryView />
        </HydrationBoundary>
    ) 
}

export default Page;