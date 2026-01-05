// src/data/books.ts
export type Book = {
  id: string;
  title: string;
  author: string;
  cover: string; // Use actual image URLs or local paths
  status: 'reading' | 'finished' | 'wishlist';
  rating?: number; // 1 to 5 stars
  review?: string; // Short thought like a tweet
};

export const bookData: Book[] = [
  {
    id: "1",
    title: "Four Thousand Weeks",
    author: "Oliver Burkeman",
    cover: "https://m.media-amazon.com/images/I/71oW2lehwsL._SY466_.jpg", // Example URL
    status: "reading",
    review: "Learn to enjoy the present as much as preparing for the future."
  },
  {
    id: "2",
    title: "Atlas of the Heart",
    author: "Brené Brown",
    cover: "https://m.media-amazon.com/images/I/51UZCr8EE5L._SX342_SY445_FMwebp_.jpg", 
    status: "reading",
    review: "Understanding emotions and experiences."
  },
  {
    id: "3",
    title: "The Let Them Theory",
    author: "Mel Robbins",
    cover: "https://m.media-amazon.com/images/I/51UmNg33hCL._SY445_SX342_FMwebp_.jpg",
    status: "finished",
    rating: 4,
    review: "Others' actions are often not in your control, so don't let them control your peace."
  }
];

export default bookData;