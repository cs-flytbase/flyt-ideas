"use client";

import { GoogleOneTap } from "@clerk/nextjs";

export function GoogleOneTapButton() {
  return (
    <GoogleOneTap 
      // Google One Tap will display automatically when a user visits your site
      // No handlers needed as Clerk handles the auth flow
    />
  );
}
