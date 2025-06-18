import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const reviewsRouter = createTRPCRouter({
    getOne: protectedProcedure.input(z.object({
        productId: z.string(),
        })).query(async ({ ctx, input }) => {
        const product = await ctx.db.findByID({
           collection: "products",
           id: input.productId,
        });

        if (!product) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Product not found",
            });
        }

        const reviewsData = await ctx.db.find({
            collection: "reviews",
            limit: 1,
            where: {
                and: [
                    { product: { equals: product.id } },
                    { user: { equals: ctx.session.user.id } },
                ],
            },
        });

        const review = reviewsData.docs[0];

        if (!review) {
            return null;
        }

        return review;
    }),
    
    getByProduct: baseProcedure.input(z.object({
        productId: z.string(),
        cursor: z.number().default(1),
        limit: z.number().default(10),
    })).query(async ({ ctx, input }) => {
        const reviews = await ctx.db.find({
            collection: "reviews",
            where: {
                product: {
                    equals: input.productId,
                },
            },
            depth: 1, // To populate user data
            sort: '-createdAt',
            page: input.cursor,
            limit: input.limit,
        });
        
        // Transform the user data to protect privacy
        const transformedReviews = {
            ...reviews,
            docs: reviews.docs.map(review => {
                // Type assertion for the populated user
                const user = review.user as any;
                
                return {
                    ...review,
                    user: {
                        id: typeof user === 'string' ? user : user?.id || '',
                        name: typeof user === 'object' ? user?.name || null : null,
                        email: typeof user === 'object' && user?.email 
                            ? user.email.split('@')[0] + '@***' 
                            : null,
                    },
                };
            }),
        };
        
        return transformedReviews;
    }),
    
    create: protectedProcedure.input(z.object({
        productId: z.string(),
        rating: z.number().min(1, {message: "Rating is required"}).max(5),
        description: z.string().min(1, {message: "Description is required"}),
    })).mutation(async ({ ctx, input }) => {
        const product = await ctx.db.findByID({
            collection: "products",
            id: input.productId,
        });

        if (!product) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Product not found",
            });
        }

        const existingReviewsData = await ctx.db.find({
            collection: "reviews",
            where: {
                and: [
                    { product: { equals: input.productId } },
                    { user: { equals: ctx.session.user.id } },
                ],
            },
        });

        if (existingReviewsData.totalDocs > 0) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "You have already reviewed this product.",
            });
        }

        const review = await ctx.db.create({
            collection: "reviews",
            data: {
                product: product.id,
                user: ctx.session.user.id,
                rating: input.rating,
                description: input.description,
            },
        });

        return review;
    }),
    
    update: protectedProcedure.input(z.object({
        reviewId: z.string(),
        rating: z.number().min(1, {message: "Rating is required"}).max(5),
        description: z.string().min(1, {message: "Description is required"}),
    })).mutation(async ({ ctx, input }) => {
        const existingReview = await ctx.db.findByID({
            depth: 0,
            collection: "reviews",
            id: input.reviewId,
        });

        if (!existingReview) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Review not found",
            });
        }

        if (existingReview.user !== ctx.session.user.id) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You are not allowed to update this review.",
            });
        }

        const updatedReview = await ctx.db.update({
            collection: "reviews",
            id: input.reviewId,
            data: {
                rating: input.rating,
                description: input.description,
            },
        });

        return updatedReview;
    }),
});