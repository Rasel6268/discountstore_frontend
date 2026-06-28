export default function sitemap(){
    return [
        {
            url: "https://discountstore.com",
            lastModified: new Date(),
            priority: 1,
        },

        {
            url: "https://discountstore.com/shop",
            lastModified: new Date(),
            priority: 0.9,
        },
    ];
}