"use client";

import { TriangleAlertIcon } from "lucide-react";

const ErrorPage = () => {
    return (
        <div className="px-4 lg:px-12 py-10">
         <div className="border border-black border-solid flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
                <TriangleAlertIcon className="size-8 text-red-500" />
                <p className="text-base font-medium">Oops. Something went wrong.</p>
            </div>
        </div>
    );
};
export default ErrorPage;