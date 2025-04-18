# Setting Up Google Authentication for Reddit at Home

This guide walks you through setting up Google as a social authentication option in your Clerk-powered Reddit at Home application.

## Changes Already Made

The following updates have been made to your codebase:

1. Added Google support to your sign-in page (`/sign-in/[[...sign-in]]/page.tsx`)
2. Added Google support to your sign-up page (`/sign-up/[[...sign-up]]/page.tsx`)
3. Created a GoogleOneTap component for seamless authentication (`/components/google-one-tap.tsx`)

## Steps to Complete the Setup

### For Development Environment

1. **Configure Google in Clerk Dashboard (Development)**
   - Log in to your [Clerk Dashboard](https://dashboard.clerk.dev/)
   - Navigate to the SSO connections page
   - Select "Add connection" and select "For all users"
   - In the "Choose provider" dropdown, select "Google"
   - Select "Add connection"
   
   For development, Clerk provides preconfigured shared OAuth credentials, so no further setup is needed.

### For Production Environment

1. **Create a Google Developer Project**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Select a project or create a new one
   - From the left sidebar menu (≡), select "APIs & Services" → "Credentials"
   - Next to "Credentials", select "Create Credentials" → "OAuth client ID"
   - Select "Web application" as the application type
   
2. **Configure JavaScript Origins**
   - Under "Authorized JavaScript origins", add:
     - Your production domain (e.g., `https://your-domain.com`)
     - If you have a www version, add that too (e.g., `https://www.your-domain.com`)
   
3. **Configure Redirect URIs**
   - Under "Authorized Redirect URIs", paste the URI provided by Clerk in your dashboard
   - Ensure this matches exactly with what Clerk provides
   
4. **Save Your Credentials**
   - Click "Create" and save your Client ID and Client Secret securely
   
5. **Complete Setup in Clerk**
   - Return to your Clerk Dashboard
   - Navigate to SSO connections
   - Open the Google connection
   - Toggle "Use custom credentials" ON
   - Enter your Client ID and Client Secret
   - Click "Save"

## Using Google One Tap Authentication

The `GoogleOneTapButton` component can be added to any page to enable one-click sign-in, for example:

```tsx
import { GoogleOneTapButton } from "@/components/google-one-tap";

export default function HomePage() {
  return (
    <div>
      {/* Your page content */}
      <GoogleOneTapButton />
    </div>
  );
}
```

## Important Notes

### Switching to Production

Before going to production, ensure your Google OAuth app's publishing status is set to "In production":

1. Go to the Google Cloud Console → "APIs & Services" → "OAuth consent screen"
2. Check that the publishing status is "In production" (not "Testing")
3. Complete Google's verification process for your app

### Security Features

- Email subaddresses (containing +, =, or #) are blocked by default for security
- Use SP-initiated flow (not IdP-initiated) for better security
- Consider implementing MFA for enhanced protection

## Troubleshooting

- If Google isn't appearing as an option, ensure you've completed the Clerk dashboard setup
- For sign-in issues, check your Google console for errors in the OAuth flow
- Remember that Google doesn't allow authentication in WebViews or embedded browsers
