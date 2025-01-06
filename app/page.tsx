'use client';

import Link from 'next/link';
import { Home, Map } from 'lucide-react';


export default function Page() {
  
 return (
   <main className="h-screen w-full">
     <nav className="flex justify-between items-center p-4 rounded-t-xl" style={{ background: 'var(--background)' }}>
       <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg">
         <Home size={24} />
       </Link>
       <strong> Project </strong>
       <Link href="/map" className="p-2 hover:bg-slate-100  rounded-lg">
         <Map size={24} />
       </Link>
     </nav>
   </main>
 );
}