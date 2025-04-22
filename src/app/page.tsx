// "use client";
// import React from 'react'
// import { useRouter } from 'next/navigation';

// const page = () => {
//   const router = useRouter();
//   router.push('/dashboard');
//   return (
//     <div className='min-h-screen w-full flex justify-center items-center'>Loading...</div>
//   )
// }

// export default page
// app/redirect-page/page.tsx
import { redirect } from 'next/navigation';

export default function RedirectPage() {
  redirect('/dashboard');
}
