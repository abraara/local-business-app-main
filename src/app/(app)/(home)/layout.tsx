import configPromise from '@payload-config'
import { Category } from '@/payload-types';
import { getPayload } from 'payload'
import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { SearchFilters } from "./search-filters";

interface Props {
    children: React.ReactNode;
}

const Layout = async ({children}: Props) => {
     const payload = await getPayload({
          config: configPromise,
        })
      
        const data = await payload.find({
          collection: 'categories',
          depth: 1, //populate subcategories
          pagination: false,
          where: {
            parent: {
              exists: false,
          }
        }
        });

        const formattedData = data.docs.map((doc) => ({
            ...doc,
            subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
                //'depth 1' doc will be a type of Category
                ...(doc as Category),
            })),
        }));

        console.log('Formatted Data:', formattedData);

    return (
        <div className="flex flex-col min-h-screen">
                <Navbar />
                <SearchFilters data={formattedData} />
            <div className="flex-1 bg-[#f4f4f4]">
                {children}
            </div>
            <Footer />
        </div>
    )
}

export default Layout;