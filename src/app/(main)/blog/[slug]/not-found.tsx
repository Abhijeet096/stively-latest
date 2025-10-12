import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6">Article not found</p>
        <Link href="/blog">
          <Button>← Back to Articles</Button>
        </Link>
      </div>
    </div>
  );
}