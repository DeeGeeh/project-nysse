'use client';

export default function Page() {
 return (
   <main className="h-screen w-full bg-slate-100">
     <nav className="bg-white shadow-sm rounded-t-xl p-4 flex justify-between items-center">
       <a href="/" className="p-2 hover:bg-slate-100 rounded-lg">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
           <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
           <polyline points="9 22 9 12 15 12 15 22" />
         </svg>
       </a>
       <a href="/map" className="p-2 hover:bg-slate-100 rounded-lg">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
           <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
           <line x1="8" y1="2" x2="8" y2="18" />
           <line x1="16" y1="6" x2="16" y2="22" />
         </svg>
       </a>
     </nav>
   </main>
 );
}