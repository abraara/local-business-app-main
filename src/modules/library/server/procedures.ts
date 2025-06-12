import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { Media, Tenant } from '@/payload-types';
import { DEFAULT_LIMIT } from "@/constants";

export const libraryRouter = createTRPCRouter({
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

        return {
            ...productsData,
            docs: productsData.docs.map((doc) => ({
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