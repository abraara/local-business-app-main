import { useCart } from "@/modules/checkout/hooks/use-cart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
    tenantSlug: string;
    productId: string;
};

export const CartButton = ({ tenantSlug, productId }: Props) => {
    const cart = useCart(tenantSlug);

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