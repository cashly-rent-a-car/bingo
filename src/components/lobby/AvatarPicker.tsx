'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { AVATARS, Avatar } from '@/lib/constants/avatars';

interface AvatarPickerProps {
  selectedId: string;
  onSelect: (avatar: Avatar) => void;
}

export function AvatarPicker({ selectedId, onSelect }: AvatarPickerProps) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-white mb-4">Escolha seu avatar</h3>
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
        {AVATARS.map((avatar) => (
          <motion.button
            key={avatar.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(avatar)}
            className={cn(
              'w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl',
              'transition-all duration-200',
              selectedId === avatar.id
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-white shadow-lg'
                : 'bg-white/10 hover:bg-white/20'
            )}
            title={avatar.name}
          >
            {avatar.emoji}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

interface AvatarDisplayProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarDisplay({ avatarId, size = 'md', className }: AvatarDisplayProps) {
  const avatar = AVATARS.find((a) => a.id === avatarId);

  const sizes = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-24 h-24 text-5xl',
  };

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center',
        sizes[size],
        className
      )}
    >
      {avatar?.emoji || '👤'}
    </div>
  );
}
