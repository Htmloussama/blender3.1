import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface CharacterRevealTextProps {
  text: string;
}

export default function CharacterRevealText({ text }: CharacterRevealTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position of the parent container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.35"],
  });

  // Split by words to ensure excellent reading flow and performant animation calculations
  const words = text.split(" ");

  return (
    <div 
      ref={containerRef} 
      className="flex flex-wrap text-xl md:text-3xl text-gray-400 font-sans leading-relaxed tracking-tight select-none"
    >
      {words.map((word, idx) => {
        // Calculate incremental step ranges for each individual word
        const start = idx / words.length;
        const end = (idx + 1.2) / words.length;
        const opacity = useTransform(scrollYProgress, [start, Math.min(end, 1)], [0.15, 1]);
        const color = useTransform(
          scrollYProgress, 
          [start, Math.min(end, 1)], 
          ["rgba(156, 163, 175, 0.2)", "rgba(255, 255, 255, 1)"]
        );

        return (
          <motion.span 
            key={idx} 
            style={{ opacity, color }} 
            className="mr-2.5 mb-1.5 inline-block font-sans font-light"
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}
