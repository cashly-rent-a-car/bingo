'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { isValidPin } from '@/lib/utils/pin-generator';

export default function EntrarPage() {
  const router = useRouter();
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    // Aceita apenas números
    const digit = value.replace(/\D/g, '').slice(-1);

    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError('');

    // Move para o próximo input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Se completou, verifica
    if (index === 3 && digit) {
      const fullPin = newPin.join('');
      if (isValidPin(fullPin)) {
        router.push(`/sala/${fullPin}`);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace volta para o input anterior
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);

    if (pasted.length === 4) {
      const newPin = pasted.split('');
      setPin(newPin);

      if (isValidPin(pasted)) {
        router.push(`/sala/${pasted}`);
      }
    }
  };

  const handleSubmit = () => {
    const fullPin = pin.join('');
    if (isValidPin(fullPin)) {
      router.push(`/sala/${fullPin}`);
    } else {
      setError('PIN inválido. Digite 4 números.');
    }
  };

  const isComplete = pin.every((d) => d !== '');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8 relative">
          <button
            onClick={() => router.back()}
            className="absolute left-0 top-0 text-white/60 hover:text-white transition-colors"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-black text-white mb-2">Entrar na Sala</h1>
          <p className="text-white/60">Digite o PIN de 4 dígitos</p>
        </div>

        <Card className="p-6 space-y-6">
          {/* PIN Input */}
          <div className="flex justify-center gap-3">
            {pin.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  w-16 h-20 text-center text-3xl font-black
                  bg-white/10 border-2 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-purple-500
                  transition-all duration-200
                  ${digit ? 'border-purple-500 text-white' : 'border-white/20 text-white/50'}
                  ${error ? 'border-red-500' : ''}
                `}
              />
            ))}
          </div>

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-red-400"
            >
              {error}
            </motion.p>
          )}

          {/* Botão entrar */}
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={!isComplete}
          >
            🚀 Entrar na Sala
          </Button>

          {/* Dica */}
          <p className="text-center text-white/40 text-sm">
            Peça o PIN para quem criou a sala
          </p>
        </Card>
      </motion.div>
    </main>
  );
}
