import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import {  Media, Tenant } from '@/payload-types';
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { CheckoutMetadata, ProductMetadata } from "../types";
import { stripe } from "@/lib/stripe";
import { PLATFORM_FEE_PERCENTAGE } from "@/constants";
import { generateTenantUrl } from "@/lib/utils";

export const checkoutRouter = createTRPCRouter({
    verify: protectedProcedure.mutation(async ({ ctx }) => {
        const user = await ctx.db.findByID({
            collection: "users",
            id: ctx.session.user.id,
            depth: 0, // use.tenants[0] is going to be a string
        });

        if (!user) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'User not found',
            });
        }

        const tenantId = user.tenants?.[0]?.tenant as string; //This is an ID because of depth: 0
        const tenant = await ctx.db.findByID({
            collection: "tenants",
            id: tenantId,
        });

        if (!tenant) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Tenant not found',
            });
        }

        const accountLink = await stripe.accountLinks.create({
            account: tenant.stripeAccountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL!}/admin`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL!}/admin`,
            type: 'account_onboarding',
        });

        if (!accountLink.url) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Failed to create account verification link',
            });
        }

        return { url: accountLink.url };
    }),
    purchase: protectedProcedure.input(z.object({
        productIds: z.array(z.string()).min(1),
        tenantSlug: z.string().min(1),
    })).mutation(async ({ ctx, input }) => {
        const products = await ctx.db.find({
            collection: "products",
            depth: 2, // Ensure depth is set to 2 to include tenant and image
            where: {
                and: [
                    {
                        id: {
                            in: input.productIds,
                        },
                    },
                    {
                        "tenant.slug": {
                            equals: input.tenantSlug,
                        },
                    },
                    {
                        isArchived: {
                            not_equals: true, 
                        },
                    },
                ],
            },
        });
        if (products.totalDocs !== input.productIds.length) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Products not found',
            });
        }

        const tenantsData = await ctx.db.find({
            collection: "tenants",
            limit: 1,
            pagination: false,
            where: {
                slug: {
                    equals: input.tenantSlug,
                },
            },
        });

        const tenant = tenantsData.docs[0];

        if (!tenant) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Tenant not found',
            });
        }

        if (!tenant.stripeDetailsSubmitted) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Tenant not allowed to sell products. Please verify your Stripe account details.',
            });
        }

       const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = products.docs.map((product) => {
            // Ensure price is a valid number and convert to cents
            const priceInCents = Math.round((product.price || 0) * 100);
            
            // Validate that the price is a positive integer
            if (!Number.isInteger(priceInCents) || priceInCents <= 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Invalid price for product ${product.name}: ${product.price}`,
                });
            }

            return {
                quantity: 1,
                price_data: {
                    unit_amount: priceInCents, // Now guaranteed to be a valid integer
                    currency: 'cad',
                    product_data: {
                        name: product.name,
                        metadata: {
                            stripeAccountId: tenant.stripeAccountId,
                            id: product.id,
                            name: product.name,
                            price: product.price,
                        } as ProductMetadata
                    }
                }
            };
        });

        const totalAmount = products.docs.reduce((acc, item) => acc + item.price * 100, 0); 
        const platformFeeAmount = Math.round(totalAmount * (PLATFORM_FEE_PERCENTAGE / 100)); // Calculate platform fee in cents

        const domain = generateTenantUrl(input.tenantSlug);

        const checkout = await stripe.checkout.sessions.create({
            customer_email: ctx.session.user.email,
            success_url: `${domain}/checkout?success=true`,
            cancel_url: `${domain}/checkout?cancel=true`,
            line_items: lineItems,
            mode: 'payment',
            invoice_creation: {
                enabled: true,
            },
            metadata: {
                userId: ctx.session.user.id,
            } as CheckoutMetadata,
            payment_intent_data: {
                application_fee_amount: platformFeeAmount,
            }
        },
        {
            stripeAccount: tenant.stripeAccountId, 
        });

        if (!checkout.url) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create checkout session',
            });
        }

        return { url: checkout.url };
    }),

    getProducts: baseProcedure.input(z.object({
        ids: z.array(z.string()),

        })).query(async ({ ctx, input }) => {
            const data = await ctx.db.find({
                collection: "products",
                depth: 2, // Ensure depth is set to 2 to include tenant and image
                where: {
                    and: [
                        {
                            isArchived: {
                                not_equals: true,
                            },
                        },
                        {
                            id: {
                                in: input.ids,
                            },
                        },
                    ],
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