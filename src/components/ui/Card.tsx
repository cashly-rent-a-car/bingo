'use client';

import { cn } from '@/lib/utils/cn';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: 'default' | 'glass' | 'solid';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white/10 backdrop-blur-md border border-white/20',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    solid: 'bg-gray-900 border border-gray-800',
  };

  return (
    <motion.div
      className={cn(
        'rounded-2xl p-6 shadow-xl',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
