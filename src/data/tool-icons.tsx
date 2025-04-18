import React from "react";

// Tool icons as React components
export const toolIcons: Record<string, React.ReactNode> = {
  figma: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3a3 3 0 0 1 3 3m-3-3a3 3 0 0 0-3 3m3-3v1M9 3a3 3 0 0 0-3 3m3-3a3 3 0 0 1 3 3m-3-3v1M3 9a3 3 0 0 1 3-3M3 9a3 3 0 0 0 3 3M3 9H2m19 0a3 3 0 0 0-3-3m3 3a3 3 0 0 1-3 3m3-3h1M9 21a3 3 0 0 1-3-3m3 3a3 3 0 0 0 3-3m-3 3v-1m6 1a3 3 0 0 0 3-3m-3 3a3 3 0 0 1-3-3m3 3v-1m-9-9a3 3 0 0 0-3 3m3-3a3 3 0 0 1 3 3m-3-3v1m12-1a3 3 0 0 1 3 3m-3-3a3 3 0 0 0-3 3m3-3v1" />
    </svg>
  ),
  github: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
  notion: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 7h10" />
      <path d="M7 12h10" />
      <path d="M7 17h10" />
    </svg>
  ),
  slack: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="13" y="2" width="3" height="8" rx="1.5" />
      <path d="M19 8.5V10" />
      <rect x="8" y="14" width="3" height="8" rx="1.5" />
      <path d="M5 15.5V14" />
      <rect x="14" y="13" width="8" height="3" rx="1.5" />
      <path d="M15.5 19H14" />
      <rect x="2" y="8" width="8" height="3" rx="1.5" />
      <path d="M8.5 5H10" />
    </svg>
  ),
  google: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" x2="12" y1="2" y2="12" />
    </svg>
  ),
  linear: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
};
