import { motion } from 'framer-motion';
import { Shield, Key, ArrowRight, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const codeLines = [
    '> Initializing secure vault...',
    '> Encryption: AES-256-GCM',
    '> Status: PROTECTED',
  ];

  const tags = [
    { label: 'Zero Knowledge', color: 'bg-arcade-yellow', rotate: '-rotate-2' },
    { label: 'Encrypted', color: 'bg-arcade-red', rotate: 'rotate-1' },
    { label: 'Dev First', color: 'bg-arcade-blue', rotate: '-rotate-1' },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-40 pb-16">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] mb-6">
              <span className="block text-foreground">Your</span>
              <span className="block text-arcade-lime" style={{ textShadow: '6px 6px 0 #000' }}>
                Credentials
              </span>
              <span className="block text-foreground">Fortified</span>
            </h1>

            <div className="flex flex-wrap gap-3 mb-8">
              {tags.map((t) => (
                <span
                  key={t.label}
                  className={`tape-tag text-xs text-primary-foreground ${t.color} ${t.rotate}`}
                >
                  {t.label}
                </span>
              ))}
            </div>

            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg font-medium">
              A developer-focused password vault with zero-knowledge architecture. Store, manage,
              and access your credentials with the security you deserve.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth?mode=signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-none border-2 border-foreground bg-arcade-lime text-primary-foreground font-black uppercase shadow-brutal hover:bg-arcade-lime/90 hover:translate-x-[-3px] hover:translate-y-[-3px] transition-transform group"
                >
                  Start Securing
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-none border-2 border-foreground bg-background text-foreground font-black uppercase shadow-brutal hover:bg-arcade-blue hover:text-secondary-foreground hover:translate-x-[-3px] hover:translate-y-[-3px] transition-transform"
                >
                  Access Vault
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-12">
              {[
                { v: '256-bit', l: 'AES Encryption', c: 'bg-arcade-lime' },
                { v: 'Zero', l: 'Knowledge', c: 'bg-arcade-blue' },
                { v: '100%', l: 'Private', c: 'bg-arcade-yellow' },
              ].map((s) => (
                <div
                  key={s.l}
                  className={`brutal-block ${s.c} text-primary-foreground p-3`}
                >
                  <div className="font-display italic text-xl">{s.v}</div>
                  <div className="text-[11px] font-bold uppercase tracking-wide">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Terminal panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="brutal-card">
              <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-foreground bg-arcade-blue">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-arcade-red border border-foreground" />
                  <div className="w-3 h-3 bg-arcade-yellow border border-foreground" />
                  <div className="w-3 h-3 bg-arcade-lime border border-foreground" />
                </div>
                <div className="flex items-center gap-2 text-xs font-black uppercase text-secondary-foreground">
                  <Terminal className="w-3 h-3" />
                  cybervault.secure
                </div>
              </div>

              <div className="p-6 min-h-[300px] font-mono">
                {codeLines.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.25 }}
                    className="text-sm mb-2 text-arcade-lime"
                  >
                    {line}
                  </motion.div>
                ))}

                <div className="mt-6 pt-4 border-t-2 border-foreground/20 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Key className="w-4 h-4 text-arcade-yellow" />
                    <span>
                      Stored credentials: <span className="text-arcade-lime">Ready</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-arcade-blue" />
                    <span>
                      Vault status: <span className="text-arcade-lime">Active</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center">
                  <span className="text-arcade-lime mr-2">&gt;</span>
                  <span className="w-2 h-5 bg-arcade-lime cursor-blink" />
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-8 -right-6 w-16 h-16 bg-arcade-yellow border-2 border-foreground shadow-brutal-sm flex items-center justify-center"
            >
              <Shield className="w-8 h-8 text-primary-foreground" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
