import { ReviewsGetOneOutput } from "@/modules/reviews/types";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { StarPicker } from "@/components/star-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


interface Props {
    productId: string;
    initialData?: ReviewsGetOneOutput;
}

const HEADING_MAX_LENGTH = 100; // Set your desired max length here

const formSchema = z.object({
    rating: z.number().min(1, { message: "Rating is required" }).max(5),
    description: z.string().min(1, { message: "Description is required" }),
    heading: z.string()
        .min(1, { message: "Heading is required" })
        .max(HEADING_MAX_LENGTH, { message: `Heading must be ${HEADING_MAX_LENGTH} characters or less` }),
});

export const ReviewForm = ({ productId, initialData }: Props) => {
    const [isPreview, setIsPreview] = useState(!!initialData);

    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const createReview = useMutation(trpc.reviews.create.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.reviews.getOne.queryOptions({ productId }));
            setIsPreview(true);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    }));
    const updateReview = useMutation(trpc.reviews.update.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.reviews.getOne.queryOptions({ productId }));
            setIsPreview(true);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    }));

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rating: initialData?.rating ?? 0,
            description: initialData?.description ?? "",
            heading: initialData?.heading ?? "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (initialData) {
            updateReview.mutate({
                reviewId: initialData.id,
                rating: values.rating,
                description: values.description,
                heading: values.heading,
            })
        } else {
            createReview.mutate({
                productId,
                rating: values.rating,
                description: values.description,
                heading: values.heading,
            });
        }
    };

    const headingValue = form.watch("heading");

    return (
        <Form { ...form }>
            <form
            onSubmit={form.handleSubmit(onSubmit)} 
            className="flex flex-col gap-y-4"
            >
                <p className="font-medium">
                    {isPreview ? "Edit your review" : "Liked it? Share your thoughts!"}
                </p>
                <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <StarPicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={isPreview}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="heading"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="relative">
                                    <Textarea
                                        placeholder="Write a short heading for your review..."
                                        disabled={isPreview}
                                        {...field}
                                        maxLength={HEADING_MAX_LENGTH}
                                        className="resize-none h-12"
                                    />
                                    {!isPreview && (
                                        <span className="absolute bottom-2 right-2 text-xs text-gray-500">
                                            {headingValue.length}/{HEADING_MAX_LENGTH}
                                        </span>
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    placeholder="Write your review here..."
                                    disabled={isPreview}
                                    {...field}
                                    className="resize-none h-32"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {!isPreview && (
                    <Button
                        variant={"elevated"}
                        disabled={createReview.isPending || updateReview.isPending}
                        type="submit"
                        size={"lg"}
                        className="bg-black text-white hover:bg-gray-700 cursor-pointer w-fit"
                    >
                        {initialData ? "Update Review" : "Submit Review"}
                    </Button>
                )}
            </form>
            {isPreview && (
                <Button
                    variant={"elevated"}
                    onClick={() => setIsPreview(false)}
                    size={"lg"}
                    type="button"
                    className="w-fit mt-4 cursor-pointer"
                >
                    Edit Review
                </Button>
            )}
        </Form>
    );
}

export const ReviewFormSkeleton = () => {
    return (
        <div
            className="flex flex-col gap-y-4"
            >
                <p className="font-medium">
                    Liked it? Share your thoughts!
                </p>
                                <StarPicker
                                    disabled
                                />
                                <Textarea
                                    placeholder="Write your review here..."
                                    disabled
                                    className="resize-none h-32"
                                />
                    <Button
                        variant={"elevated"}
                        disabled
                        type="button"
                        size={"lg"}
                        className="bg-black text-white hover:bg-gray-700 cursor-pointer w-fit"
                    >
                        Submit Review
                    </Button>
            </div>
    )
};