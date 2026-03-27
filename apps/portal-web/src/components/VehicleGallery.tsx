"use client";

import { useState } from "react";

interface Image {
  id: string;
  url: string;
}

interface VehicleGalleryProps {
  images: Image[];
  title: string;
}

export default function VehicleGallery({ images, title }: VehicleGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (images.length === 0) return null;

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="rounded-2xl overflow-hidden bg-white border border-neutral-200 relative group aspect-[16/9]">
        {/* Gallery Overlay Controls */}
        <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-4 pointer-events-none">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-neutral-800 hover:bg-white transition-all pointer-events-auto"
            aria-label="Anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-neutral-800 hover:bg-white transition-all pointer-events-auto"
            aria-label="Siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Counter badge */}
        <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full">
          {activeIdx + 1} / {images.length}
        </div>

        <img
          src={images[activeIdx].url}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActiveIdx(i)}
            className={`relative aspect-video w-24 rounded-lg bg-neutral-200 overflow-hidden shrink-0 border-2 transition-all ${
              i === activeIdx ? "border-primary-500 ring-2 ring-primary-100" : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <img src={img.url} className="w-full h-full object-cover" alt={`${title} mini - ${i + 1}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
