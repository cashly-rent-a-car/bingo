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

  const shareText = `🎱 Vem jogar Bingo comigo!\nEntre com o PIN: ${pin}\n👉 ${magicLink}`;
  const shareTextEncoded = encodeURIComponent(shareText);

  const handleCopyPin = async () => {
    await copyToClipboard(pin);
    setCopied('pin');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyLink = async () => {
    await copyToClipboard(shareText);
    setCopied('link');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${shareTextEncoded}`, '_blank');
  };

  const handleTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(magicLink)}&text=${encodeURIComponent(`🎱 Vem jogar Bingo comigo! PIN: ${pin}`)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Bingou! - Bingo Online', text: shareText, url: magicLink });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await handleCopyLink();
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

      {/* Botões de compartilhamento */}
      <div className="flex flex-wrap gap-2 sm:ml-auto justify-center">
        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="p-2 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 transition-colors"
          title="Compartilhar no WhatsApp"
        >
          <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
        </button>

        {/* Telegram */}
        <button
          onClick={handleTelegram}
          className="p-2 rounded-lg bg-[#0088cc]/20 hover:bg-[#0088cc]/30 transition-colors"
          title="Compartilhar no Telegram"
        >
          <TelegramIcon className="w-5 h-5 text-[#0088cc]" />
        </button>

        {/* Copiar */}
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          title="Copiar convite"
        >
          {copied === 'link' ? (
            <CheckIcon className="w-5 h-5 text-green-400" />
          ) : (
            <CopyIcon className="w-5 h-5 text-white/60" />
          )}
        </button>

        {/* Share nativo (mobile) */}
        <button
          onClick={handleNativeShare}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors sm:hidden"
          title="Mais opções"
        >
          <ShareIcon className="w-5 h-5 text-white/60" />
        </button>
      </div>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
