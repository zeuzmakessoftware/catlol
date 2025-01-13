'use client';

import React, { useRef, useState, useEffect } from 'react';
import useTypewriter from '@/lib/useTypewriter';
import ReportUI from '@/components/ReportUI';
import { gsap } from 'gsap';
import { Camera } from 'lucide-react';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const speechBubbleRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [rawResponse, setRawResponse] = useState('');
  const { displayedText, isTyping } = useTypewriter(rawResponse);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [interactionLog, setInteractionLog] = useState<{ prompt: string; response: string }[]>([]);
  const [mortgageReport, setMortgageReport] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [promptCount, setPromptCount] = useState(0);

  useEffect(() => {
    if (cameraRef.current && stream) {
      cameraRef.current.srcObject = stream;
      cameraRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [stream]);

  useEffect(() => {
    if (showSpeechBubble) {
      animateSpeechBubble();
    }
  }, [showSpeechBubble]);

  const animateSpeechBubble = () => {
    if (speechBubbleRef.current) {
      gsap.fromTo(
        speechBubbleRef.current,
        { autoAlpha: 0, scale: 0.8, y: 50 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.9, ease: 'power3.out' }
      );
    }
  };

  const fetchMortgageReport = async (log: { prompt: string; response: string }[]) => {
    try {
      const response = await fetch('/api/mortgageReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interactions: log }),
      });
  
      if (!response.ok) throw new Error('Failed to fetch mortgage report');
  
      const data = await response.json();
      setMortgageReport(data.report);
  
      setRawResponse(
        "Meow! I’ve carefully reviewed your inputs and prepared a detailed mortgage report for you! 😺 Click the video to view it. If you wish to try the app again, you can reload the page. 🐾"
      );
    } catch (error) {
      console.error('Error fetching mortgage report:', error);
      setRawResponse(
        "*sad meow* I couldn’t prepare the mortgage report. Something went wrong! Try reloading the page to try again. 😿"
      );
    }
  };
  
  const generateResponse = async (isInitialGreeting = false) => {
    try {
      setIsLoading(true);
      setRawResponse('');
  
      const inputText = isInitialGreeting
        ? "Say hi and introduce yourself as a cat mortgage advisor!"
        : userInput || "Tell me about mortgages";
  
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputText }),
      });
  
      if (!response.body) throw new Error('No response body');
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedResponse = '';
  
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;
        setRawResponse((prev) => prev + chunk);
      }
  
      setInteractionLog((prev) => {
        const updatedLog = [...prev, { prompt: inputText, response: accumulatedResponse }];
        if (updatedLog.length === 10) {
          fetchMortgageReport(updatedLog);
          return [];
        }
        return updatedLog;
      });
  
      if (interactionLog.length === 10) {
        fetchMortgageReport(interactionLog);
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
  
    if (mortgageReport) {
      setShowReport(true);
      return;
    }

    setPromptCount((prev) => prev + 1);
    setUserInput('');
    const video = videoRef.current;
  
    if (!isPlaying) {
      setIsPlaying(true);
      setShowSpeechBubble(true);
  
      const randomPoints = [1.5, 4.3, 7.7];
      const randomStart = randomPoints[Math.floor(Math.random() * randomPoints.length)];
  
      video.currentTime = randomStart;
      video.play();

      animateSpeechBubble();
  
      if (isFirstClick) {
        setRawResponse(
          "Hi there! I'm your friendly cat mortgage advisor. Introduce yourself or click the camera to get a purrfessional mortgage roast that'll have you feline assessed! :3"
        );
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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const playVideo = () => {
    if (videoRef.current) {
      setIsPlaying(true);
      const randomPoints = [1.5, 4.3, 7.7];
      const randomStart = randomPoints[Math.floor(Math.random() * randomPoints.length)];
      videoRef.current.currentTime = randomStart;
      videoRef.current.play();

      setTimeout(() => {
        videoRef.current?.pause();
        videoRef.current!.currentTime = 0;
        setIsPlaying(false);
      }, 2200);
    }
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = cameraRef.current.videoWidth;
      canvas.height = cameraRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(cameraRef.current, 0, 0);
      const photo = canvas.toDataURL('image/jpeg'); // The photo is already in base64 format
  
      stopCamera();
      setIsLoading(true);
      setShowSpeechBubble(true);
  
      try {
        const playVideoInterval = setInterval(playVideo, 7500);
  
        const response = await fetch('/api/vision', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: photo.split(',')[1] }), // Send only the base64-encoded string
        });
  
        const roastData = await response.json();
        clearInterval(playVideoInterval);
  
        if (roastData.choices && roastData.choices[0]?.message?.content) {
          roastData.choices[0].message.content += ' Click me to dive into your mortgage questions!';
          setRawResponse(roastData.choices[0].message.content);
        } else {
          setRawResponse("Meow! Sorry, I couldn't come up with a roast right now! 😿");
        }
      } catch (error) {
        console.error('Error:', error);
        setRawResponse("*sad meow* Something went wrong with the roast! 😿");
      } finally {
        setIsLoading(false);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center h-screen relative gap-8">
      {showReport && (
        <ReportUI report={mortgageReport} onClose={() => setShowReport(false)} />
      )}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <video
              ref={cameraRef}
              autoPlay
              playsInline
              muted
              className="rounded-lg mb-4"
              style={{ width: '400px', height: '300px' }}
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={capturePhoto}
                className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 text-white"
              >
                Capture
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showSpeechBubble && (
        <div
          ref={speechBubbleRef}
          className="relative px-6 py-4 bg-green-600 rounded-xl shadow-sm speech-bubble border-4 border-green-900 
                    max-w-[24rem] max-w-[36rem] md:max-w-[28rem] sm:max-w-[22rem] hue-rotate-[-5deg] brightness-[1.1] saturate-[1.4]"
        >
          <div className="bg-green-500 rounded-lg p-4 shadow-inner max-h-[14rem] overflow-y-auto 
                          lg:p-5 lg:max-h-[16rem] md:p-4 md:max-h-[12rem] sm:p-3 sm:max-h-[10rem]">
            <p className="text-lg font-semibold text-black min-h-[4rem] font-mono tracking-tighter 
                           sm:min-h-[3rem]">
              {isLoading ? "Thinking... =^･ｪ･^=" : displayedText}
              {(isTyping || isLoading) && <span className="animate-pulse">▊</span>}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-4 md:mt-3 sm:mt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask cat about mortgages..."
                className="flex-1 px-4 py-2 bg-[#FDE2F3] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 
                          font-mono placeholder-[#2A2F4F]/50 text-[#2A2F4F] 
                          lg:text-lg md:text-base sm:text-sm sm:px-3 sm:py-1.5"
                disabled={isLoading}
              />
              {promptCount < 2 && (
                <button
                  type="button"
                  className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 
                            text-white border-[2px] border-green-400 transition duration-300 ease-in-out 
                            lg:px-5 lg:py-2 md:px-4 md:py-2 sm:px-3 sm:py-1.5"
                  onClick={startCamera}
                >
                  <Camera className="w-6 h-6 text-green-950 lg:w-7 lg:h-7 md:w-6 md:h-6 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      )}


      <video
        ref={videoRef}
        src="/gato.mp4"
        className="cursor-pointer rounded-xl hover:scale-105 transition-transform duration-300 ease-in-out"
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
