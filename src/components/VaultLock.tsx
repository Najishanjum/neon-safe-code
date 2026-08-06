import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, ShieldCheck, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AnimatedBackground from '@/components/AnimatedBackground';

interface VaultLockProps {
  mode: 'setup' | 'unlock';
  loading: boolean;
  error: string | null;
  onSubmit: (passphrase: string) => void;
  onSignOut: () => void;
}

const VaultLock = ({ mode, loading, error, onSubmit, onSignOut }: VaultLockProps) => {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [show, setShow] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (passphrase.length < 8) {
      setLocalError('Master passphrase must be at least 8 characters');
      return;
    }
    if (mode === 'setup' && passphrase !== confirmPassphrase) {
      setLocalError('Passphrases do not match');
      return;
    }

    onSubmit(passphrase);
  };

  const message = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="gradient-border">
          <div className="glass-card rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                {mode === 'setup' ? (
                  <ShieldCheck className="w-8 h-8 text-primary" />
                ) : (
                  <Lock className="w-8 h-8 text-primary" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {mode === 'setup' ? 'Set Your Master Passphrase' : 'Unlock Your Vault'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {mode === 'setup'
                  ? 'This passphrase encrypts every credential in your browser before it is saved.'
                  : 'Enter your master passphrase to decrypt your credentials.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="passphrase">Master passphrase</Label>
                <div className="relative">
                  <Input
                    id="passphrase"
                    type={show ? 'text' : 'password'}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="pr-10 code-input"
                    placeholder="••••••••••••"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {mode === 'setup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm passphrase</Label>
                  <Input
                    id="confirm"
                    type={show ? 'text' : 'password'}
                    value={confirmPassphrase}
                    onChange={(e) => setConfirmPassphrase(e.target.value)}
                    className="code-input"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              )}

              {message && <p className="text-sm text-destructive">{message}</p>}

              {mode === 'setup' && (
                <div className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    Your passphrase is never sent anywhere and cannot be reset. If you lose it,
                    your stored credentials can never be decrypted again.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full neon-glow bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : mode === 'setup' ? (
                  'Encrypt My Vault'
                ) : (
                  'Unlock'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onSignOut}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VaultLock;
