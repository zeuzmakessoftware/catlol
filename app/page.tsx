'use client';

import React, { useRef, useState } from 'react';

// Custom hook for typewriter effect
const useTypewriter = (text: string, typingSpeed: number = 14) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  React.useEffect(() => {
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
      }, typingSpeed);

      return () => clearInterval(timer);
    }
  }, [text, typingSpeed]);

  return { displayedText, isTyping };
};

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [rawResponse, setRawResponse] = useState('');
  const { displayedText, isTyping } = useTypewriter(rawResponse);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstClick, setIsFirstClick] = useState(true);

  const generateResponse = async (isInitialGreeting = false) => {
    try {
      setIsLoading(true);
      setRawResponse('');

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

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        setRawResponse((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Error:', error);
      setRawResponse("*sad meow* My whiskers are tingling with API issues... try again later? :3");
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
        setRawResponse("Hi there! I'm your friendly cat mortgage advisor. Click me again to start a conversation!");
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
    e.preventDefault();
    await handleVideoClick();
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
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about mortgages..."
              className="w-full px-4 py-2 bg-[#FDE2F3] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 font-mono placeholder-[#2A2F4F]/50 text-[#2A2F4F]"
              disabled={isLoading}
            />
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
