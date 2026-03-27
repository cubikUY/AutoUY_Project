"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface SearchPaginationProps {
  totalPages: number;
}

export default function SearchPagination({ totalPages }: SearchPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `/buscar?${params.toString()}`;
  };

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push("...");
    }
  }

  // Remove duplicate ellipses
  const uniquePages = pages.filter((p, i) => pages.indexOf(p) === i);

  return (
    <div className="flex justify-center items-center gap-1.5 mt-10">
      <button
        disabled={currentPage === 1}
        onClick={() => router.push(getPageUrl(currentPage - 1))}
        className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:border-primary-300 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Anterior
      </button>

      <div className="flex items-center gap-1.5">
        {uniquePages.map((p, i) => (
          <button
            key={i}
            disabled={p === "..."}
            onClick={() => typeof p === "number" && router.push(getPageUrl(p))}
            className={`rounded-lg min-w-[40px] border h-10 px-2 text-sm font-medium transition-colors ${
              p === currentPage
                ? "border-primary-600 bg-primary-600 text-white"
                : p === "..."
                ? "border-transparent text-neutral-400"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-600"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        disabled={currentPage === totalPages}
        onClick={() => router.push(getPageUrl(currentPage + 1))}
        className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:border-primary-300 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </div>
  );
}
