import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Sort, Where } from "payload";
import { z } from "zod";
import { Category, Media, Tenant } from '@/payload-types';
import { sortValues } from "../search-params";
import { DEFAULT_LIMIT } from "@/constants";

export const productsRouter = createTRPCRouter({
    getOne: baseProcedure.input(
        z.object({
        id: z.string(),
    })
    ).query(async ({ ctx, input }) => {
        const product = await ctx.db.findByID({
            collection: "products",
            id: input.id,
            depth: 2, // Ensure depth is set to 2 to include tenant and image
        });
        return {
            ...product,
            cover: product.cover as Media || null, // Ensure cover is of type Media or null
            image: product.image as Media || null, // Ensure image is of type Media or null
            image2: product.image2 as Media || null, // Ensure image2 is of type Media or null
            image3: product.image3 as Media || null, // Ensure image3 is of type Media or null
            image4: product.image4 as Media || null, // Ensure image4 is of type Media or null
            image5: product.image5 as Media || null, // Ensure image5 is of type Media or null
            tenant: product.tenant as Tenant & { image: Media | null }, // Ensure tenant is of type Tenant with optional image
        }
    }),
    getMany: baseProcedure.input(z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        category: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
        tenantSlug: z.string().nullable().optional(),

        })).query(async ({ ctx, input }) => {
            const where: Where = {};
            let sort: Sort = "-createdAt";

            if (input.sort === "curated") {
                sort = "-createdAt";
            }
            if (input.sort === "trending") {
                sort = "-createdAt";
            } 
            if (input.sort === "hot_and_new") {
                sort = "+createdAt";
            } 

            if (input.minPrice && input.maxPrice) {
                where.price = {
                    greater_than_equal: input.minPrice,
                    less_than_equal: input.maxPrice
                };
            } else if (input.minPrice) {
                where.price = {
                    greater_than_equal: input.minPrice,
                };
            } else if (input.maxPrice) {
                where.price = { 
                    less_than_equal: input.maxPrice,
                };
            }

            if (input.tenantSlug) {
                where["tenant.slug"] = {
                    equals: input.tenantSlug,
                };
            }

            if (input.category) {
                const categoriesData = await ctx.db.find({
                    collection: "categories",
                    limit: 1,
                    depth: 1, 
                    pagination: false,
                    where: {
                        slug: {
                            equals: input.category,
                        }
                    }
                });

                const formattedData = categoriesData.docs.map((doc) => ({
                            ...doc,
                            subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
                                //'depth 1' doc will be a type of Category
                                ...(doc as Category),
                            })),
                        }));


                const subcategoriesSlugs = []        
                const parentCategory = formattedData[0];

                if (parentCategory) {
                    subcategoriesSlugs.push(...parentCategory.subcategories.map((subcategory) => subcategory.slug))
                    where["category.slug"] = {
                        in: [parentCategory.slug, ...subcategoriesSlugs],
                    }
                }
            }

            if (input.tags && input.tags.length > 0) {
                where["tags.name"] = {
                    in: input.tags,
                };
            }

        const data = await ctx.db.find({
           collection: "products",
           depth: 2, // Ensure depth is set to 2 to include tenant and image
           where,
           sort,
           page: input.cursor,
           limit: input.limit,
        });
        return {
            ...data,
            docs: data.docs.map((doc) => ({
                ...doc,
                image: doc.image as Media || null, // Ensure image is of type Media or null
                cover: doc.cover as Media || null, // Ensure cover is of type Media or null
                image2: doc.image2 as Media || null, // Ensure image2 is of type Media or null
                image3: doc.image3 as Media || null, // Ensure image3 is of type Media or null
                image4: doc.image4 as Media || null, // Ensure image4 is of type Media or null
                image5: doc.image5 as Media || null, // Ensure image5 is of type Media or null
                tenant: doc.tenant as Tenant & { image?: Media } || null, // Ensure tenant is of type Tenant with optional image
            })),
        };
    }),
});