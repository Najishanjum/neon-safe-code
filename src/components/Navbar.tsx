import { motion } from 'framer-motion';
import { Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NavbarProps {
  user?: { email: string } | null;
}

const Navbar = ({ user }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    } else {
      navigate('/');
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-foreground"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-arcade-lime border-2 border-foreground shadow-brutal-sm flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display italic uppercase text-xl tracking-tight">
            <span className="text-foreground">Cyber</span>
            <span className="text-arcade-lime">Vault</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {user.email}
              </span>
              <Button
                size="sm"
                onClick={handleLogout}
                className="rounded-none border-2 border-foreground bg-arcade-red text-foreground font-black uppercase shadow-brutal-sm hover:bg-arcade-red/90 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-none font-black uppercase text-arcade-blue hover:bg-arcade-blue hover:text-secondary-foreground"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button
                  size="sm"
                  className="rounded-none border-2 border-foreground bg-arcade-lime text-primary-foreground font-black uppercase shadow-brutal-sm hover:bg-arcade-lime/90 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Status strip */}
      <div className="bg-background border-t-2 border-foreground/20 px-6 py-2 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <span>Zero-Knowledge Vault Core</span>
          <span className="text-arcade-lime">AES-256 · Online</span>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
