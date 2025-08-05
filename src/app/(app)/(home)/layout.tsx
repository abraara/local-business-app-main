import { getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { trpc } from "@/trpc/server";
import { Footer } from "@/modules/home/ui/components/footer";
import { Navbar } from "@/modules/home/ui/components/navbar";
import { SearchFilters, SearchFiltersLoading } from "@/modules/home/ui/components/search-filters";
import { Suspense } from "react";

interface Props {
    children: React.ReactNode;
}

const Layout = async ({children}: Props) => {
const queryClient = getQueryClient();
 await queryClient.prefetchQuery(
        trpc.categories.getMany.queryOptions()
    );
    
    // Get the dehydrated state once
    const dehydratedState = dehydrate(queryClient);
    return (
        <div className="flex flex-col min-h-screen">
                <Navbar />
                <HydrationBoundary state={dehydratedState}>
                    <Suspense fallback={<SearchFiltersLoading />}>
                        <SearchFilters  />
                    </Suspense>
                </HydrationBoundary>
            <div className="flex-1 bg-[#f4f4f4]">
                {children}
            </div>
            <Footer />
        </div>
    )
}

export default Layout;