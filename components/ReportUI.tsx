'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import useTypewriter from '@/lib/useTypewriter';
import { Download, X } from 'lucide-react';

interface ReportUIProps {
  report: string;
  onClose: () => void;
}

const ReportUI: React.FC<ReportUIProps> = ({ report, onClose }) => {
  const { displayedText, isTyping } = useTypewriter(report, 2);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when displayedText updates
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [displayedText]);

  // GSAP animation for entrance
  useEffect(() => {
    const timeline = gsap.timeline();

    // Animate the background opacity
    if (containerRef.current) {
      timeline.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    }

    // Animate the modal
    if (modalRef.current) {
      timeline.fromTo(
        modalRef.current,
        { x: '100%', rotate: 45, opacity: 0 },
        { x: '0%', rotate: -2, opacity: 1, duration: 1, ease: 'power3.out' },
        '<' // Start this animation at the same time as the background animation
      );
    }
  }, []);

  // GSAP animation for exit
  const handleClose = () => {
    const timeline = gsap.timeline({
      onComplete: onClose, // Call onClose after animation completes
    });

    // Animate the modal out
    if (modalRef.current) {
      timeline.to(modalRef.current, {
        x: '100%',
        rotate: -45,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.in',
      });
    }

    // Fade out the background
    if (containerRef.current) {
      timeline.to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.5,
          ease: 'power3.in',
        },
        '<' // Start this animation at the same time as the modal animation
      );
    }
  };

  // Download the report as a .txt file
  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Mortgage_Advisor_Report.txt';
    link.click();
    URL.revokeObjectURL(link.href); // Clean up the URL
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50"
    >
      <div
        ref={modalRef}
        className="bg-[#f4e7da] p-8 rounded-lg shadow-2xl border-4 border-[#49342a] w-[40rem] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-end gap-2">
          <button
            onClick={handleDownload}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold transition duration-300 ease-in-out flex items-center gap-1"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handleClose}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold transition duration-300 ease-in-out flex items-center gap-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-3xl font-bold font-mono text-[#49342a] mb-4">
          Mortgage Advisor Report
        </h1>
        <div
          ref={scrollContainerRef}
          className="text-lg font-mono text-[#2a2f4f] whitespace-pre-line"
        >
          {displayedText}
          {isTyping && <span className="animate-pulse">▊</span>}
        </div>
      </div>
    </div>
  );
};

export default ReportUI;
