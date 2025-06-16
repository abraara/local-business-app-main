import type { Stripe } from 'stripe';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { ExpandedLineItem } from '@/modules/checkout/types';

export async function POST(request: Request) {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            await (await request.blob()).text(),
            request.headers.get('stripe-signature') as string,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (error! instanceof Error) {
            console.log(error);
        }
        console.error('❌ Error message:', errorMessage);
        return NextResponse.json({ message: "Webhook Error: " + errorMessage }, { status: 400 });
    }

    console.log('✅ Success:', event.id);

    const permittedEvents: string[] = [
        'checkout.session.completed',
        'account.updated',
    ];

    const payload = await getPayload({ config });

    if (permittedEvents.includes(event.type)) {
       let data;

       try {
            switch (event.type) {
                case 'checkout.session.completed':
                    data = event.data.object as Stripe.Checkout.Session;
                    
                    if (!data.metadata?.userId) {
                        throw new Error('User ID is required');
                    }

                    const user = await payload.findByID({
                        collection: 'users',
                        id: data.metadata.userId,
                    });

                    if (!user) {
                        throw new Error('User not found');
                    }
                    
                    const expandedSession = await stripe.checkout.sessions.retrieve(
                        data.id, {
                            expand: ['line_items.data.price.product'],
                        },
                        {
                            stripeAccount: event.account,
                        }
                    );

                    if (!expandedSession.line_items?.data || expandedSession.line_items.data.length === 0) {
                        throw new Error('No line items found in the session');
                    }
                    const lineItems = expandedSession.line_items.data as ExpandedLineItem[];

                    for (const item of lineItems) {
                        await payload.create({
                            collection: 'orders',
                            data: {
                                user: user.id,
                                product: item.price.product.metadata.id,
                                stripeCheckoutSessionId: data.id,
                                stripeAccountId: event.account,
                                name: item.price.product.name,
                            },
                        });
                    }
                    break;
                case 'account.updated':
                    data = event.data.object as Stripe.Account;
                    await payload.update({
                        collection: 'tenants',
                        where: {
                            stripeAccountId: { equals: data.id },
                        },
                        data: {
                            stripeDetailsSubmitted: data.details_submitted,
                        },
                    });
                    break;
                default:
                    throw new Error(`Unhandled event type: ${event.type}`);
            }
        } catch (error) {
            console.error('Error processing event:', error);
            return NextResponse.json({ message: "Webhook Error: " + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
        }
    }

    return NextResponse.json({ message: "Received" }, { status: 200 });
};