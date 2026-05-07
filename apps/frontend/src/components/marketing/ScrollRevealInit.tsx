"use client";

import { useEffect } from "react";

export function ScrollRevealInit() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );

    document
      .querySelectorAll(
        ".reveal, .session-card, .price-card-el, .course-card-el, .step-el, .problem-card-el",
      )
      .forEach((el) => {
        el.classList.add("reveal");
        io.observe(el);
      });

    return () => io.disconnect();
  }, []);

  return null;
}
