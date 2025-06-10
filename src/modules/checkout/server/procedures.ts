import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import {  Media, Tenant } from '@/payload-types';
import { TRPCError } from "@trpc/server";

export const checkoutRouter = createTRPCRouter({
    
    getProducts: baseProcedure.input(z.object({
        ids: z.array(z.string()),

        })).query(async ({ ctx, input }) => {
            const data = await ctx.db.find({
                collection: "products",
                depth: 2, // Ensure depth is set to 2 to include tenant and image
                where: {
                    id: {
                        in: input.ids,
                    },
                },
            });

            if (data.totalDocs !== input.ids.length) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Products not found',
                });
            }

            return {
                ...data,
                totalPrice: data.docs.reduce((acc, product) => acc + product.price, 0), // Calculate total price
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