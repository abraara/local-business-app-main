import { useCart } from "@/modules/checkout/hooks/use-cart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
    tenantSlug: string;
    productId: string;
    isPurchased?: boolean;
};

export const CartButton = ({ tenantSlug, productId, isPurchased }: Props) => {
    const cart = useCart(tenantSlug);

    if (isPurchased) {
        return (
            <Button
                variant={'elevated'}
                className="flex-1 font-medium"
                asChild
                >
                <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/library/${productId}`}>
                    View in Library
                </Link>
            </Button>
        )
    };

    return (
         <Button
            variant={'elevated'}
            className={cn("flex-1 bg-gray-200 hover:bg-gray-400 cursor-pointer", cart.isProductInCart(productId) && "bg-orange-200 hover:bg-orange-300")}
            onClick={() => cart.toggleProduct(productId)}
            >
            {cart.isProductInCart(productId)
                ? "Remove from Cart"
                : "Add to Cart"}
            </Button>
    );
};