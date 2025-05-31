interface Props {
    params: Promise<{ category: string }>;
}

const Page = async ({ params }: Props) => {
    const { category } = await params;
    return (
        <div>
            <h1>Category: { category }</h1>
            <p>This is the category page. Add your content here.</p>
        </div>
    );
};

export default Page;