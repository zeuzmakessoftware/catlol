import { useEffect, useState } from "react";

const useTypewriter = (text: string, typingSpeed: number = 14) => {
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
        }, typingSpeed);
  
        return () => clearInterval(timer);
      }
    }, [text, typingSpeed]);
  
    return { displayedText, isTyping };
};

export default useTypewriter;