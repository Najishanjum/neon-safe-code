import { motion } from 'framer-motion';
import { Shield, Key, ArrowRight, Terminal, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const codeLines = [
    '> Initializing secure vault...',
    '> Encryption: AES-256-GCM',
    '> Status: PROTECTED',
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">Developer-First Security</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-foreground">Your Credentials,</span>
              <br />
              <span className="text-primary neon-text">Fortified.</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              A developer-focused password vault with zero-knowledge architecture. 
              Store, manage, and access your credentials with the security you deserve.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth?mode=signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto neon-glow bg-primary text-primary-foreground hover:bg-primary/90 group"
                >
                  Start Securing
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-border hover:border-primary hover:bg-primary/10 hover:text-primary"
                >
                  Access Vault
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-8 mt-12 pt-8 border-t border-border"
            >
              <div>
                <div className="text-2xl font-bold text-primary">256-bit</div>
                <div className="text-sm text-muted-foreground">AES Encryption</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">Zero</div>
                <div className="text-sm text-muted-foreground">Knowledge</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Private</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right content - Animated terminal */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="gradient-border">
              <div className="glass-card rounded-xl overflow-hidden">
                {/* Terminal header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
                    <Terminal className="w-3 h-3" />
                    cybervault.secure
                  </div>
                </div>

                {/* Terminal body */}
                <div className="p-6 min-h-[300px]">
                  {codeLines.map((line, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.3 }}
                      className="font-mono text-sm mb-2"
                    >
                      <span className="text-primary">{line}</span>
                    </motion.div>
                  ))}
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="mt-6 pt-4 border-t border-border"
                  >
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                      <Key className="w-4 h-4 text-secondary" />
                      <span>Stored credentials: <span className="text-primary">Ready</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-secondary" />
                      <span>Vault status: <span className="text-green-400">Active</span></span>
                    </div>
                  </motion.div>

                  {/* Blinking cursor */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="mt-4 flex items-center"
                  >
                    <span className="text-primary mr-2">&gt;</span>
                    <span className="w-2 h-5 bg-primary cursor-blink" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -right-8 w-16 h-16 glass-card rounded-xl flex items-center justify-center"
            >
              <Shield className="w-8 h-8 text-primary" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -left-6 w-12 h-12 glass-card rounded-xl flex items-center justify-center"
            >
              <Key className="w-6 h-6 text-secondary" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
