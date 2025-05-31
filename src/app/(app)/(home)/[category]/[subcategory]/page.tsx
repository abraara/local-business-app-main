interface Props {
    params: Promise<{ 
        category: string;
        subcategory: string }>;
}

const Page = async ({ params }: Props) => {
    const { category, subcategory } = await params;
    return (
        <div>
            <h1>Category: { category }</h1>
            <h2>Subcategory: { subcategory }</h2>
            <p>This is the subcategory page. Add your content here.</p>
        </div>
    );
};

export default Page;