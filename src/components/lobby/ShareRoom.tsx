'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { copyToClipboard } from '@/lib/utils/magic-link';

interface ShareRoomProps {
  pin: string;
  magicLink: string;
}

export function ShareRoom({ pin, magicLink }: ShareRoomProps) {
  const [copied, setCopied] = useState<'pin' | 'link' | null>(null);

  const handleCopyPin = async () => {
    await copyToClipboard(pin);
    setCopied('pin');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyLink = async () => {
    await copyToClipboard(magicLink);
    setCopied('link');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = async () => {
    const text = `Vem jogar Bingo comigo! Use o PIN: ${pin} ou acesse: ${magicLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Bingo Online', text, url: magicLink });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await copyToClipboard(text);
      setCopied('link');
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* PIN em destaque */}
      <div className="text-center sm:text-left">
        <div className="text-xs text-white/60 uppercase tracking-wider mb-1">PIN da Sala</div>
        <motion.div
          className="text-4xl sm:text-5xl font-black text-white tracking-[0.3em]"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          {pin}
        </motion.div>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-2 sm:ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyPin}
        >
          {copied === 'pin' ? (
            <span className="flex items-center gap-1 text-green-400">
              <CheckIcon /> PIN
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <CopyIcon /> PIN
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
        >
          {copied === 'link' ? (
            <span className="flex items-center gap-1 text-green-400">
              <CheckIcon /> Link
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <LinkIcon /> Link
            </span>
          )}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleShare}
        >
          <ShareIcon className="w-4 h-4 mr-1" />
          Compartilhar
        </Button>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}
