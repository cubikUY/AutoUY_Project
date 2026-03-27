import Link from "next/link";

interface DealerCardProps {
  id: string;
  businessName: string;
  logoUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  website?: string | null;
  verified?: boolean;
  vehicleCount?: number;
}

export default function DealerCard({
  id,
  businessName,
  logoUrl,
  phone,
  whatsapp,
  address,
  city,
  website,
  verified,
  vehicleCount = 0,
}: DealerCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start gap-5">
          {/* Logo */}
          <div className="w-20 h-20 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={businessName} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-2xl font-bold text-neutral-300">
                {businessName.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
                {businessName}
              </h3>
              {verified && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-500 shrink-0">
                  <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
              {city && (
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-neutral-400">
                    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.93 11.93 0 00.757.433 8.018 8.018 0 00.307.15zM10 11a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" />
                  </svg>
                  {city}
                </span>
              )}
              {vehicleCount > 0 && (
                <span className="flex items-center gap-1 font-medium text-primary-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.5 3a.5.5 0 000 1h3a.5.5 0 000-1h-3zM11 3a.5.5 0 000 1h3a.5.5 0 000-1h-3z" />
                    <path fillRule="evenodd" d="M4 5.5A1.5 1.5 0 015.5 4h9A1.5 1.5 0 0116 5.5V7c0 .414.336.75.75.75H17a1 1 0 011 1v2a1 1 0 01-1 1h-.25A.75.75 0 0016 12.5v1.25a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 014 13.75V12.5a.75.75 0 00-.75-.75H3a1 1 0 01-1-1v-2a1 1 0 011-1h.25A.75.75 0 004 7V5.5zm10.5 7a.5.5 0 100-1 .5.5 0 000 1zm-9 0a.5.5 0 100-1 .5.5 0 000 1z" clipRule="evenodd" />
                  </svg>
                  {vehicleCount} vehículos
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {phone && (
              <a 
                href={`tel:${phone.replace(/\D/g, "")}`}
                className="flex items-center gap-3 text-sm text-neutral-600 hover:text-primary-600 text-nowrap transition-colors group/tel"
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover/tel:text-primary-600 group-hover/tel:bg-primary-50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-8.284 0-15-6.716-15-15V3.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium underline decoration-transparent group-hover/tel:decoration-primary-600 transition-colors tracking-tight text-xs uppercase">{phone}</span>
              </a>
          )}
          {whatsapp && (
              <a 
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-neutral-600 hover:text-green-600 text-nowrap transition-colors group/wa"
              >
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 group-hover/wa:bg-green-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.107l-.696 2.54 2.597-.681c.812.444 1.756.68 2.846.681 3.18 0 5.766-2.586 5.767-5.766 0-3.18-2.586-5.767-5.771-5.767zm3.435 8.204c-.145.412-.729.743-1.002.791-.255.045-.59.063-1.428-.276-1.157-.468-1.91-1.636-1.967-1.714-.058-.078-.466-.62-.466-1.139 0-.519.271-.774.368-.873.097-.099.213-.124.283-.124.07 0 .141.001.203.003.067.002.155-.026.242.185.089.213.303.738.33.791.027.054.045.117.009.185-.036.071-.054.116-.108.18-.054.062-.116.104-.165.158-.049.073-.1.152-.043.25.046.074.205.337.441.547.284.254.551.411.666.471.107.056.173.048.24-.029l.189-.253c.091-.12.181-.137.26-.1.082.036.516.244.605.289.088.045.147.067.168.103.021.036.021.21-.124.622z" />
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 2.136.67 4.116 1.81 5.74L2 22l4.37-1.75A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zM4 12c0-4.418 3.582-8 8-8s8 3.582 8-8-3.582 8-8 8a7.963 7.963 0 01-4.74-1.564l-.24-.176-2.433.973.973-2.432-.176-.24A7.964 7.964 0 014 12z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium underline decoration-transparent group-hover/wa:decoration-green-600 transition-colors uppercase tracking-tight text-xs">{whatsapp}</span>
              </a>
          )}
          {address && (
              <div className="flex items-center gap-3 text-sm text-neutral-600 col-span-full">
                <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.93 11.93 0 00.757.433 8.018 8.018 0 00.307.15zM10 11a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="truncate">{address}</span>
              </div>
          )}
          {website && (
              <div className="flex items-center gap-3 text-sm text-neutral-600 col-span-full">
                <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M11 3a1 1 0 011 1v1h2V4a3 3 0 00-3-3h-2a3 3 0 00-3 3v1h2V4a1 1 0 011-1z" />
                    <path d="M5 6a2 2 0 00-2 2v1h14V8a2 2 0 00-2-2H5zM3 11v7a2 2 0 002 2h10a2 2 0 002-2v-7H3z" />
                  </svg>
                </div>
                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors truncate">
                  {website.replace(/^https?:\/\//, '')}
                </a>
              </div>
          )}
        </div>

        <div className="mt-8">
          <Link
            href={`/automotoras/${id}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 px-6 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-primary-900/10 hover:shadow-primary-900/20 active:scale-[0.98]"
          >
            Ver perfil y stock
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
