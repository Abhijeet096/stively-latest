"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share2, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

interface BlogInteractionsProps {
  blogId: string;
  slug: string;
  initialLikes: number;
  title: string;
}

export default function BlogInteractions({ blogId, slug, initialLikes, title }: BlogInteractionsProps) {
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    checkIfLiked();
  }, [slug]);

  function checkIfLiked() {
    const liked = localStorage.getItem(`liked-${slug}`);
    setHasLiked(liked === "true");
  }

  async function handleLike() {
    if (hasLiked) return;

    try {
      const res = await fetch(`/api/blogs/${blogId}/like`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setLikeCount(data.likes);
        setHasLiked(true);
        localStorage.setItem(`liked-${slug}`, "true");
        toast.success("Thanks for liking! ❤️");
      }
    } catch (error) {
      toast.error("Failed to like");
    }
  }

  function handleShare(platform: string) {
    const url = window.location.href;
    const text = title;

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    };

    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  }

  return (
    <div className="flex items-center gap-4 py-6 border-t border-b">
      {/* Like Button */}
      <Button
        onClick={handleLike}
        variant={hasLiked ? "default" : "outline"}
        disabled={hasLiked}
        className="flex items-center gap-2"
      >
        <Heart
          size={18}
          className={hasLiked ? "fill-current text-red-500" : ""}
        />
        <span>{likeCount}</span>
        <span className="hidden sm:inline">
          {hasLiked ? "Liked" : "Like"}
        </span>
      </Button>

      {/* Share Button */}
      <div className="relative group">
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 size={18} />
          <span className="hidden sm:inline">Share</span>
        </Button>
        
        {/* Share Dropdown */}
        <div className="absolute left-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          <div className="flex flex-col gap-1 min-w-[120px]">
            <button
              onClick={() => handleShare("twitter")}
              className="px-3 py-2 text-sm hover:bg-gray-100 rounded text-left"
            >
              Twitter
            </button>
            <button
              onClick={() => handleShare("facebook")}
              className="px-3 py-2 text-sm hover:bg-gray-100 rounded text-left"
            >
              Facebook
            </button>
            <button
              onClick={() => handleShare("linkedin")}
              className="px-3 py-2 text-sm hover:bg-gray-100 rounded text-left"
            >
              LinkedIn
            </button>
            <button
              onClick={() => handleShare("whatsapp")}
              className="px-3 py-2 text-sm hover:bg-gray-100 rounded text-left"
            >
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}