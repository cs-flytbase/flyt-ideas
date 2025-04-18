"use client";

import { SignIn } from "@clerk/nextjs";
 
export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-primary h-10 w-10 rounded" />
          </div>
          <h1 className="text-2xl font-bold">Sign in to Reddit at Home</h1>
          <p className="text-muted-foreground mt-2">
            Collaborate on ideas and discover new tools
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90',
              footerActionLink: 'text-primary hover:text-primary/90',
              socialButtonsIconButton: 'border border-gray-300 shadow-sm'
            }
          }}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
