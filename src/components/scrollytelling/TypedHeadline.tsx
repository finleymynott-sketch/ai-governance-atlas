import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypedHeadlineProps {
  text: string;
  isActive: boolean;
  className?: string;
  onComplete?: () => void;
  typingSpeed?: number;
}

/**
 * Headline with typewriter effect
 * Types out letter by letter when active, with a blinking cursor
 */
export const TypedHeadline = ({
  text,
  isActive,
  className = '',
  onComplete,
  typingSpeed = 50,
}: TypedHeadlineProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText('');
      setIsTyping(false);
      setShowCursor(true);
      return;
    }

    setIsTyping(true);
    setShowCursor(true);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        onComplete?.();
        
        // Hide cursor after a delay
        setTimeout(() => {
          setShowCursor(false);
        }, 1000);
      }
    }, typingSpeed);

    return () => {
      clearInterval(interval);
    };
  }, [isActive, text, typingSpeed, onComplete]);

  // Cursor blink animation while typing
  useEffect(() => {
    if (!isTyping && !showCursor) return;

    const blinkInterval = setInterval(() => {
      // Only blink when typing is complete and cursor still showing
      if (!isTyping) {
        setShowCursor((prev) => !prev);
      }
    }, 500);

    return () => clearInterval(blinkInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping]); // showCursor intentionally excluded - interval toggles it

  return (
    <h2 className={className}>
      <span>{displayedText}</span>
      <AnimatePresence>
        {(isTyping || showCursor) && (
          <motion.span
            className="inline-block w-0.5 h-[1em] ml-0.5 bg-current align-middle"
            initial={{ opacity: 1 }}
            animate={{ opacity: isTyping ? 1 : showCursor ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>
    </h2>
  );
};

/**
 * Simple typing hook for custom implementations
 */
export const useTypingEffect = (
  text: string,
  isActive: boolean,
  speed = 50
): { displayedText: string; isComplete: boolean } => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText('');
      setIsComplete(false);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isActive, text, speed]);

  return { displayedText, isComplete };
};

