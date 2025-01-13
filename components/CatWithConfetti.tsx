'use client';

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { gsap } from 'gsap';

// Define the type for the props
interface CatWithConfettiProps {
  confettiCount?: number; // Optional prop with default value
}

export interface CatWithConfettiRef {
  activateConfetti: () => void;
}

const CatWithConfetti = forwardRef<CatWithConfettiRef, CatWithConfettiProps>(
  ({ confettiCount = 50 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const activateConfetti = () => {
      console.log('Activating confetti');
      const container = containerRef.current;
      if (!container) return;

      // Generate confetti elements
      const confettiElements = Array.from({ length: confettiCount }).map(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.position = 'absolute';
        confetti.style.width = `${Math.random() * 100 + 10}px`; // Random size
        confetti.style.height = `${Math.random() * 100 + 10}px`;
        confetti.style.backgroundImage = 'url("/caticon.png")'; // Path to your PNG file
        confetti.style.backgroundSize = 'cover';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.top = '-10%';
        container.appendChild(confetti);
        return confetti;
      });

      // Animate confetti
      confettiElements.forEach((confetti) => {
        gsap.to(confetti, {
          y: '100vh',
          x: `+=${Math.random() * 100 - 50}vw`, // Add some horizontal variation
          rotation: Math.random() * 360,
          scale: 0, // Gradually shrink to size 0
          duration: Math.random() * 2 + 3, // Random fall duration
          ease: 'power3.out',
          onComplete: () => {
            confetti.remove(); // Clean up after animation
          },
        });
      });
    };

    // Expose the activateConfetti function to the parent via the ref
    useImperativeHandle(ref, () => ({
      activateConfetti,
    }));

    return (
        <div
          ref={containerRef}
          className="fixed top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        />
    );
  }
);

CatWithConfetti.displayName = 'CatWithConfetti';

export default CatWithConfetti;
