'use client';

import React, { useRef, useState, useEffect } from 'react';

// Custom hook for typewriter effect
const useTypewriter = (text: string, speed: number = 14) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (text) {
      setIsTyping(true);
      setDisplayedText('');
      let i = -1;
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prev) => prev + text.charAt(i));
          i++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, speed);

      return () => clearInterval(timer);
    }
  }, [text, speed]); // Ensure effect triggers when text changes

  return { displayedText, isTyping };
};

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const { displayedText, isTyping } = useTypewriter(currentMessage);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstClick, setIsFirstClick] = useState(true);

  const generateResponse = async (isInitialGreeting = false) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: isInitialGreeting
            ? "Say hi and introduce yourself as a cat mortgage advisor!"
            : userInput || "Tell me about mortgages",
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      console.log("API Response:", data);
      setCurrentMessage(data.message || "Oops, no response received!");
    } catch (error) {
      console.error('Error:', error);
      setCurrentMessage("*sad meow* My whiskers are tingling with API issues... try again later? :3");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoClick = async () => {
    if (!videoRef.current || isTyping || isLoading) return;

    setUserInput('');
    const video = videoRef.current;

    if (!isPlaying) {
      setIsPlaying(true);
      setShowSpeechBubble(true);

      const randomPoints = [1.5, 4.3, 7.7];
      const randomStart = randomPoints[Math.floor(Math.random() * randomPoints.length)];

      video.currentTime = randomStart;
      video.play();

      if (isFirstClick) {
        setCurrentMessage("Hi there! I'm your friendly cat mortgage advisor. How can I help you today? 😺");
        setIsFirstClick(false);
      } else {
        await generateResponse();
      }

      setTimeout(() => {
        video.pause();
        video.currentTime = 0;
        setIsPlaying(false);
      }, 2200);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    handleVideoClick();
    e.preventDefault();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen relative gap-8">
      {showSpeechBubble && (
        <div className="relative px-6 py-4 bg-green-600 rounded-xl shadow-2xl speech-bubble border-4 border-green-900 w-[32rem]">
          <div className="bg-green-500 rounded-lg p-4 shadow-inner">
            <p className="text-lg font-semibold text-[#2A2F4F] min-h-[4rem] font-mono">
              {isLoading ? "Thinking... =^･ｪ･^=" : displayedText}
              {(isTyping || isLoading) && <span className="animate-pulse">▊</span>}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask about mortgages..."
                className="flex-1 px-4 py-2 bg-[#FDE2F3] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 font-mono placeholder-[#2A2F4F]/50 text-[#2A2F4F]"
                disabled={isLoading}
              />
              <button
                type="button"
                className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 text-white"
                onClick={() => {
                  // Add your camera functionality here
                  console.log('Camera button clicked');
                }}
              >
                📸
              </button>
            </div>
          </form>
        </div>
      )}

      <video
        ref={videoRef}
        src="/gato.mp4"
        className="cursor-pointer rounded-xl"
        onClick={handleVideoClick}
        preload="metadata"
        style={{
          width: '600px',
          height: 'auto',
          objectFit: 'cover',
        }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
