"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch user profile
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setBio(data.user?.bio || "");
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  // Handle bio update
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio })
    });
    if (res.ok) {
      setMessage("Bio updated successfully!");
    } else {
      setMessage("Failed to update bio.");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label htmlFor="bio" className="block font-medium mb-2">Bio</label>
          <Textarea
            id="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={5}
            className="w-full"
            placeholder="Tell us about yourself..."
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={saving || loading}>
          {saving ? "Saving..." : "Save Bio"}
        </Button>
        {message && (
          <div className="text-sm mt-2 text-center text-green-600 dark:text-green-400">{message}</div>
        )}
      </form>
    </div>
  );
}
