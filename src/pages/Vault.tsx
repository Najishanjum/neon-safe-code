import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Key, Trash2, Edit2, Eye, EyeOff, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';

interface Credential {
  id: string;
  title: string;
  email: string;
  password: string;
  created_at: string;
}

const Vault = () => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser({ id: session.user.id, email: session.user.email || '' });
      fetchCredentials(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser({ id: session.user.id, email: session.user.email || '' });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchCredentials = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('credentials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch credentials",
        variant: "destructive",
      });
    } else {
      setCredentials(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormLoading(true);

    try {
      if (editingCredential) {
        const { error } = await supabase
          .from('credentials')
          .update({
            title: formTitle.trim(),
            email: formEmail.trim(),
            password: formPassword,
          })
          .eq('id', editingCredential.id);

        if (error) throw error;

        toast({
          title: "Updated",
          description: "Credential updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('credentials')
          .insert({
            user_id: user.id,
            title: formTitle.trim(),
            email: formEmail.trim(),
            password: formPassword,
          });

        if (error) throw error;

        toast({
          title: "Added",
          description: "Credential added to your vault",
        });
      }

      resetForm();
      setDialogOpen(false);
      fetchCredentials(user.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('credentials')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete credential",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Credential removed from vault",
      });
      fetchCredentials(user.id);
    }
  };

  const handleEdit = (credential: Credential) => {
    setEditingCredential(credential);
    setFormTitle(credential.title);
    setFormEmail(credential.email);
    setFormPassword(credential.password);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCredential(null);
    setFormTitle('');
    setFormEmail('');
    setFormPassword('');
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setVisiblePasswords((current) => {
            const updated = new Set(current);
            updated.delete(id);
            return updated;
          });
        }, 5000);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const filteredCredentials = credentials.filter((cred) =>
    cred.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cred.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar user={user} />

      <main className="pt-28 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Your <span className="text-primary neon-text">Vault</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                {credentials.length} credential{credentials.length !== 1 ? 's' : ''} stored
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="neon-glow bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Credential
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {editingCredential ? 'Edit Credential' : 'Add New Credential'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title / Website</Label>
                    <Input
                      id="title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="code-input"
                      placeholder="e.g., GitHub"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="form-email">Email / Username</Label>
                    <Input
                      id="form-email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="code-input"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="form-password">Password</Label>
                    <Input
                      id="form-password"
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="code-input"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {formLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingCredential ? (
                      'Update Credential'
                    ) : (
                      'Save Credential'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mb-6"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 code-input"
              placeholder="Search credentials..."
            />
          </motion.div>

          {/* Credentials list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredCredentials.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-xl p-12 text-center"
            >
              <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? 'No matches found' : 'Your vault is empty'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Add your first credential to get started'}
              </p>
            </motion.div>
          ) : (
            <motion.div layout className="space-y-4">
              <AnimatePresence>
                {filteredCredentials.map((credential, index) => (
                  <motion.div
                    key={credential.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card rounded-xl p-5 group hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Key className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground truncate">
                              {credential.title}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {credential.email}
                            </p>
                          </div>
                        </div>

                        {/* Password row */}
                        <div className="flex items-center gap-2 mt-3 ml-13">
                          <code className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded font-mono">
                            {visiblePasswords.has(credential.id) 
                              ? credential.password 
                              : '••••••••••••'}
                          </code>
                          <button
                            onClick={() => togglePasswordVisibility(credential.id)}
                            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {visiblePasswords.has(credential.id) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(credential.password, credential.id)}
                            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {copiedId === credential.id ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(credential)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(credential.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Vault;
