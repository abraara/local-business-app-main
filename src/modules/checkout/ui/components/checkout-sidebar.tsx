import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CircleXIcon } from "lucide-react";

interface CheckoutSidebarProps {
    total: number;
    onCheckout: () => void;
    isCanceled?: boolean;
    isPending?: boolean;
}

export const CheckoutSidebar = ({
    total,
    onCheckout,
    isCanceled,
    isPending,
}: CheckoutSidebarProps) => {
    return (
        <div className="border rounded-md bg-white overflow-hidden flex flex-col">
            <h2 className="text-lg font-semibold p-4">Order Summary</h2>
            <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-medium text-lg">Total</h4>
                <p className="font-medium text-lg">{formatCurrency(total)}</p>
            </div>
            <div className="p-4 flex items-center justify-center">
                <Button
                    onClick={onCheckout}
                    disabled={isPending}
                    className={"w-full py-2 rounded-md cursor-pointer text-white transform transition-transform duration-[600ms] ease-in-out hover:scale-95 bg-black"}
                    >
                    Checkout
                </Button>
            </div>
            {isCanceled && (
                <div className="p-4 flex justify-center items-center border-t">
                    <div className="bg-red-100 border w-full border-red-400 font-medium px-4 py-3 rounded flex items-center">
                        <div className="flex items-center">
                            <CircleXIcon className="size-6 mr-2 fill-red-500 text-red-100" />
                            <span>Checkout failed. Please try again later.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}