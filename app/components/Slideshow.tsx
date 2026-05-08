"use client"
import React, { useEffect, useState } from 'react';

export const Slideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "Funds for Students",
      subtitle: "Sejong Scholarship Foundation of America (SSFA)",
      description: "Enabling today's scholars and empowering tomorrow's leaders through education-focused support.",
      badge: "Established in 1997",
      backgroundClass:
        "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_50%),linear-gradient(120deg,var(--color-blue)_0%,#1f5f82_45%,#0f3d57_100%)]",
    },
    {
      title: "Investing in Potential",
      subtitle: "Opportunity Through Community",
      description: "We believe education should be accessible, and community support can remove barriers for driven students.",
      badge: "Community Powered",
      backgroundClass:
        "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%),linear-gradient(120deg,#2B7FAD_0%,#4d8f33_55%,#2f6720_100%)]",
    },
    {
      title: "Supporting Future Talent",
      subtitle: "Scholarships, Events, and Outreach",
      description: "From fundraising events to scholarship awards, SSFA helps students pursue their goals with confidence.",
      badge: "Serving Students Nationwide",
      backgroundClass:
        "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.3),transparent_55%),linear-gradient(120deg,#2B7FAD_0%,#FFAB03_50%,#d88d00_100%)]",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5500);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  return (
    <section className="relative w-full h-full min-h-[700px] overflow-hidden text-white">
      {slides.map((slide, index) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          } ${slide.backgroundClass}`}
          aria-hidden={index !== currentSlide}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-transparent" />

      <div className="relative z-10 flex h-full min-h-[700px] items-end md:items-center px-6 md:px-12 lg:px-20 py-14">
        <div className="max-w-3xl animate-[impactSectionEnter_0.7s_ease-out]">
          <span className="inline-flex items-center rounded-full border border-white/40 bg-white/15 px-4 py-1 text-xs md:text-sm font-semibold tracking-wide mb-5">
            {slides[currentSlide].badge}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
            {slides[currentSlide].title}
          </h1>
          <h2 className="text-lg md:text-2xl font-medium text-white/90 mb-4">
            {slides[currentSlide].subtitle}
          </h2>
          <p className="text-base md:text-lg text-white/85 max-w-2xl leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </div>
      </div>

      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="group absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full border border-white/40 bg-black/25 backdrop-blur-sm hover:bg-black/45 hover:scale-110 active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
      >
        <span className="absolute inset-0 rounded-full animate-pulse bg-white/10 opacity-50 group-hover:opacity-0 transition-opacity duration-300" />
        <span className="relative block text-lg font-semibold transition-transform duration-300 group-hover:-translate-x-0.5 group-active:-translate-x-1">
          &lt;
        </span>
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="group absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full border border-white/40 bg-black/25 backdrop-blur-sm hover:bg-black/45 hover:scale-110 active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
      >
        <span className="absolute inset-0 rounded-full animate-pulse bg-white/10 opacity-50 group-hover:opacity-0 transition-opacity duration-300" />
        <span className="relative block text-lg font-semibold transition-transform duration-300 group-hover:translate-x-0.5 group-active:translate-x-1">
          &gt;
        </span>
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              index === currentSlide ? "w-8 bg-white" : "w-2.5 bg-white/55 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

