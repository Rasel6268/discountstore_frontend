import Link from "next/link";
import { redirect } from "next/navigation";
import { FaHome, FaShoppingCart, FaTruck } from "react-icons/fa";

export default async function CatchAllPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  // Seamless redirect: if anyone visits /product/:id, automatically route to /shop/:id
  if (Array.isArray(slug) && slug.length >= 2 && slug[0] === "product") {
    redirect(`/shop/${slug[1]}/`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-extrabold shadow-inner">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          The page you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition shadow-sm"
          >
            <FaHome /> Return Home
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium transition"
          >
            <FaShoppingCart /> Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
