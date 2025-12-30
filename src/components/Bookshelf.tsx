"use client";

/*
    Currently not used in the main page, but kept for potential future use.
    A component to display a bookshelf with filtering and pagination.

    Copy this snippet into src/app/page.tsx to use:
    <div className="col-span-1 md:col-span-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] md:p-8">
        <Bookshelf />
    </div>
*/
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Star, BookOpen, CheckCircle, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import bookData, { Book } from "../data/books";

const ITEMS_PER_PAGE = 3;

export default function Bookshelf() {
  const [filter, setFilter] = useState<'all' | 'reading' | 'finished'>('all');
  const [currentPage, setCurrentPage] = useState(0);

  // Filter the books first
  const filteredBooks = bookData.filter((b) => 
    filter === 'all' ? true : b.status === filter
  );

  // Calculate pages
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  
  // Slice the data for the current view
  const currentBooks = filteredBooks.slice(
    currentPage * ITEMS_PER_PAGE, 
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Reset to page 0 if user changes filter
  useEffect(() => {
    setCurrentPage(0);
  }, [filter]);

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(p => p + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(p => p - 1);
  };

  return (
    <div className="w-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Library</h2>
          <p className="text-zinc-400 text-sm">What I'm reading and learning.</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-zinc-800 self-start md:self-auto">
          {(['all', 'reading', 'finished'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs md:text-sm font-medium rounded-md transition-all ${
                filter === f 
                  ? "bg-zinc-800 text-white shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* The Shelf (Relative for positioning arrows) */}
      <div className="relative group/shelf">
        
        {/* Navigation Arrow: LEFT */}
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-white transition-all disabled:opacity-0 disabled:pointer-events-none hover:bg-zinc-800 ${
            filteredBooks.length > ITEMS_PER_PAGE ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Books Grid - Fixed to 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[180px]">
          {currentBooks.length > 0 ? (
            currentBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))
          ) : (
            <div className="col-span-3 flex items-center justify-center h-full text-zinc-500 text-sm italic border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
              No books found in this category.
            </div>
          )}
        </div>

        {/* Navigation Arrow: RIGHT */}
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className={`absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-white transition-all disabled:opacity-0 disabled:pointer-events-none hover:bg-zinc-800 ${
            filteredBooks.length > ITEMS_PER_PAGE ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Page Indicators (Dots) */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {[...Array(totalPages)].map((_, i) => (
            <div 
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentPage ? "w-6 bg-zinc-500" : "w-1.5 bg-zinc-800"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Extracted Card for cleanliness
function BookCard({ book }: { book: Book }) {
  return (
    <div className="group relative bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 transition-all hover:bg-zinc-900/80 hover:border-zinc-700 flex flex-col h-full">
      <div className="flex gap-4">
        {/* Cover */}
        <div className="relative w-20 h-28 flex-shrink-0 shadow-lg rounded-md overflow-hidden bg-zinc-800">
          <Image 
            src={book.cover} 
            alt={book.title} 
            fill 
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized 
          />
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <Badge status={book.status} />
          </div>
          
          <h3 className="text-white font-semibold text-sm leading-tight truncate pr-2" title={book.title}>
            {book.title}
          </h3>
          <p className="text-zinc-500 text-xs truncate mt-0.5">{book.author}</p>

          {book.rating && (
            <div className="flex items-center gap-0.5 mt-auto">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < book.rating! ? "text-amber-400 fill-amber-400" : "text-zinc-800 fill-zinc-800"}`} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hover Review */}
      {book.review && (
        <div className="absolute inset-0 bg-zinc-950/95 rounded-xl p-4 flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <p className="text-zinc-300 text-xs italic leading-relaxed">"{book.review}"</p>
        </div>
      )}
    </div>
  );
}

function Badge({ status }: { status: Book['status'] }) {
  const config = {
    reading: { color: "text-blue-400 bg-blue-400/10", icon: BookOpen, label: "Reading" },
    finished: { color: "text-emerald-400 bg-emerald-400/10", icon: CheckCircle, label: "Done" },
    wishlist: { color: "text-zinc-400 bg-zinc-400/10", icon: Bookmark, label: "Saved" },
  };
  const { color, icon: Icon, label } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}