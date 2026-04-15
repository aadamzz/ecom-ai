import Link from "next/link";
import { categories } from "@/data/products";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-bold tracking-tighter text-lg">NØRD</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              AI-Powered Fashion Store
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Categories</h4>
            <ul className="mt-2 space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Information</h4>
            <ul className="mt-2 space-y-2">
              <li><span className="text-sm text-muted-foreground">About Us</span></li>
              <li><span className="text-sm text-muted-foreground">Contact</span></li>
              <li><span className="text-sm text-muted-foreground">Returns</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">AI Stylist</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Click the chat icon in the bottom right corner to talk with our AI stylist.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-xs text-muted-foreground">
          © 2026 NØRD. Portfolio project — not a real store.
        </div>
      </div>
    </footer>
  );
}
