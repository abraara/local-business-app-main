import { useCart } from "../../hooks/use-cart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn, generateTenantUrl } from "@/lib/utils";
import { ShoppingCartIcon } from "lucide-react";

interface CheckoutButtonProps {
    className?: string;
    hideIfEmpty?: boolean;
    tenantSlug: string;
};

export const CheckoutButton = ({
    className,
    hideIfEmpty = false,
    tenantSlug,
}: CheckoutButtonProps) => {
    const { totalItems } = useCart(tenantSlug);

    if (hideIfEmpty && totalItems === 0) {
        return null;
    }
    return (
        <Button
            variant="elevated"
            asChild
            className={cn("py-2 rounded", className)}
        >
            <Link href={`${generateTenantUrl(tenantSlug)}/checkout`}>
                <ShoppingCartIcon className="mr-2 h-4 w-4" />
                {totalItems > 0 ? `Checkout (${totalItems})` : "Checkout"}
            </Link>
        </Button>
    );
};