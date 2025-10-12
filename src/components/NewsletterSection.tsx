"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("🎉 Successfully subscribed to newsletter!");
        setEmail("");
      } else {
        toast.error(data.message || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Never Miss an Update</h2>
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Subscribe to get the latest articles delivered straight to your inbox
        </p>
        <form 
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-6 py-3 rounded-lg text-slate-900 flex-1"
            disabled={loading}
            required
          />
          <Button 
            type="submit"
            size="lg" 
            className="bg-white text-purple-600 hover:bg-purple-50"
            disabled={loading}
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
}