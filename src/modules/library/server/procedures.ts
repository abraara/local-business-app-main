import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { Media, Tenant } from '@/payload-types';
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";

// Function to clean rich text content by removing problematic null references
const cleanRichTextContent = (content: any): any => {
    if (!content || typeof content !== 'object') return content;
    
    // If it's an array, clean each element
    if (Array.isArray(content)) {
        return content.map(item => cleanRichTextContent(item))
            .filter(item => {
                // Remove nodes that are just for images/links with null URLs
                if (item?.type === 'upload' && !item?.value?.url) return false;
                if (item?.type === 'link' && !item?.url) return false;
                return true;
            });
    }
    
    // Create a new object to avoid mutating the original
    const cleaned: any = {};
    
    for (const [key, value] of Object.entries(content)) {
        // Skip null URLs, hrefs, or src properties
        if (value === null && (key === 'url' || key === 'href' || key === 'src')) {
            // For required fields, provide empty string instead of null
            cleaned[key] = '';
            continue;
        }
        
        // Recursively clean nested objects and arrays
        if (typeof value === 'object' && value !== null) {
            cleaned[key] = cleanRichTextContent(value);
        } else {
            cleaned[key] = value;
        }
    }
    
    return cleaned;
};

export const libraryRouter = createTRPCRouter({
    getOne: protectedProcedure.input(z.object({
        productId: z.string(),

        })).query(async ({ ctx, input }) => {         
        const ordersData = await ctx.db.find({
           collection: "orders",
           limit: 1, // We want just one order to check if the product is purchased
           pagination: false,
           where: {
               and: [
                   {
                       product: {
                            equals: input.productId,
                          },
                          user: {
                              equals: ctx.session.user.id,
                          },
                    },
                ],
            },
        });

        const order = ordersData.docs[0];

        if (!order) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Order not found for the given product and user.',
            });
        }


        const product = await ctx.db.findByID({
            collection: "products",
                id: input.productId,
        });

        if (!product) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Product not found.',
            });
        }

        // Clean the content field if it exists
        if (product.content) {
            product.content = cleanRichTextContent(product.content);
        }

        return product;
    }),
    getMany: protectedProcedure.input(z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),

        })).query(async ({ ctx, input }) => {         
        const ordersData = await ctx.db.find({
           collection: "orders",
           depth: 0, // We want just ids
           page: input.cursor,
           limit: input.limit,
           where: {
                user: {
                    equals: ctx.session.user.id,
                },
            },
        });

        const productIds = ordersData.docs.map((order) => order.product);

        const productsData = await ctx.db.find({
            collection: "products",
            pagination: false,
            where: {
                id: {
                    in: productIds,
                },
            },
        });

        //TODO: Optimize this part to avoid multiple queries
        const dataWithSummarizedReviews = await Promise.all(productsData.docs.map(async (doc) => {
            const reviewsData = await ctx.db.find({
                collection: "reviews",
                pagination: false,
                where: {
                    product: {
                        equals: doc.id,
                    }
                }
            });

            return {
                ...doc,
                reviewCount: reviewsData.totalDocs,
                reviewRating: 
                    reviewsData.docs.length === 0
                        ? 0
                        : reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) / reviewsData.totalDocs,
            };
        }));

        return {
            ...productsData,
            docs: dataWithSummarizedReviews.map((doc) => ({
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