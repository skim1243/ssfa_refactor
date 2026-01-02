"use client"
import React, { useState } from 'react';

export const Slideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    "Image 1 Placeholder",
    "Image 2 Placeholder",
    "Image 3 Placeholder",
    "Image 4 Placeholder",
    "Image 5 Placeholder",
  ];

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-400 text-black">
      <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-700 bg-opacity-50 p-2 rounded-full z-10">
        &lt;
      </button>
      <div className="text-2xl">
        {slides[currentSlide]}
      </div>
      <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-700 bg-opacity-50 p-2 rounded-full z-10">
        &gt;
      </button>
    </div>
  );
};

