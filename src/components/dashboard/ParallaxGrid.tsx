import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export function ParallaxGrid() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const springConfig = { stiffness: 50, damping: 20 };
  const offsetX = useSpring(0, springConfig);
  const offsetY = useSpring(0, springConfig);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
      offsetX.set(x);
      offsetY.set(y);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [offsetX, offsetY]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Main grid layer */}
      <motion.div
        className="absolute inset-0"
        style={{
          x: offsetX,
          y: offsetY,
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Secondary finer grid */}
      <motion.div
        className="absolute inset-0"
        style={{
          x: useSpring(mousePos.x * 0.5, springConfig),
          y: useSpring(mousePos.y * 0.5, springConfig),
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.015) 1px, transparent 1px)
          `,
          backgroundSize: '10px 10px',
        }}
      />
      
      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, #050505 70%)',
        }}
      />
      
      {/* Corner accents */}
      <svg className="absolute top-4 left-4 w-16 h-16 opacity-30">
        <path
          d="M0 16 L0 0 L16 0"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="1"
        />
      </svg>
      <svg className="absolute top-4 right-4 w-16 h-16 opacity-30">
        <path
          d="M48 0 L64 0 L64 16"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="1"
        />
      </svg>
      <svg className="absolute bottom-4 left-4 w-16 h-16 opacity-30">
        <path
          d="M0 48 L0 64 L16 64"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="1"
        />
      </svg>
      <svg className="absolute bottom-4 right-4 w-16 h-16 opacity-30">
        <path
          d="M48 64 L64 64 L64 48"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
