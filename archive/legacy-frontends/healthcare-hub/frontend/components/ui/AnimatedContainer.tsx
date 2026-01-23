"use client";

import React, { useEffect, useRef } from 'react';

interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideIn' | 'scaleIn' | 'bounceIn';
  duration?: number;
  delay?: number;
  className?: string;
}

export function AnimatedContainer({
  children,
  animation = 'fadeIn',
  duration = 300,
  delay = 0,
  className = '',
}: AnimatedContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const timer = setTimeout(() => {
      element.style.animation = `${animation} ${duration}ms ease-out`;
      element.style.opacity = '1';
    }, delay);

    return () => clearTimeout(timer);
  }, [animation, duration, delay]);

  return (
    <div
      ref={ref}
      className={`opacity-0 ${className}`}
      style={{
        animationFillMode: 'forwards',
      }}
    >
      {children}
    </div>
  );
}
