'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminSocket } from '@/hooks/useAdminSocket';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// Chave para localStorage
const AUTH_KEY = 'bingo_admin_auth';
const AUTH_EXPIRY = 60 * 60 * 1000; // 1 hora

function getStoredAuth(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(AUTH_KEY);
  if (!stored) return false;
  try {
    const { expiry } = JSON.parse(stored);
    if (Date.now() > expiry) {
      localStorage.removeItem(AUTH_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function setStoredAuth(): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    expiry: Date.now() + AUTH_EXPIRY,
  }));
}

export default function AdminPage() {
  const { isConnected, isAuthenticated, authError, stats, authenticate } = useAdminSocket();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStoredAuth, setHasStoredAuth] = useState(false);

  // Verifica autenticação armazenada na montagem
  useEffect(() => {
    const stored = getStoredAuth();
    setHasStoredAuth(stored);
  }, []);

  // Auto-autentica se tem auth armazenada
  useEffect(() => {
    if (isConnected && hasStoredAuth && !isAuthenticated) {
      authenticate('8533'); // Senha padrão
    }
  }, [isConnected, hasStoredAuth, isAuthenticated, authenticate]);

  // Salva auth quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      setStoredAuth();
      setIsSubmitting(false);
    }
  }, [isAuthenticated]);

  // Reset submitting quando erro
  useEffect(() => {
    if (authError) {
      setIsSubmitting(false);
    }
  }, [authError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setIsSubmitting(true);
    authenticate(password);
  };

  // Tela de login
  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Admin</h1>
            <p className="text-white/60 text-sm">
              {isConnected ? 'Digite a senha para acessar' : 'Conectando...'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={authError || undefined}
              disabled={!isConnected || isSubmitting}
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!isConnected || isSubmitting || !password.trim()}
            >
              {isSubmitting ? 'Verificando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );

  // Tela de dashboard
  const renderDashboard = () => (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin</h1>
            <p className="text-white/40 text-sm">Dashboard em tempo real</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white/60 text-sm">
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Dashboard Content */}
        <AnimatePresence mode="wait">
          {stats ? (
            <AdminDashboard key="dashboard" stats={stats} />
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="text-white/40">Carregando dados...</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {isAuthenticated ? (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {renderDashboard()}
        </motion.div>
      ) : (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {renderLogin()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
