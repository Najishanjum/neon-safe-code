import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Key, Trash2, Edit2, Eye, EyeOff, Copy, Check, Loader2,
  Instagram, Github, Linkedin, Twitter, Facebook, Youtube, Globe, Upload, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';
import VaultLock from '@/components/VaultLock';
import {
  deriveKey,
  generateSalt,
  createVerifier,
  checkVerifier,
  encryptString,
  decryptString,
  isEncrypted,
} from '@/lib/crypto';

interface Credential {
  id: string;
  title: string;
  email: string;
  password: string;
  created_at: string;
  image_url?: string;
  website_url?: string;
  instagram_url?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  google_url?: string;
  facebook_url?: string;
  youtube_url?: string;
}

const socialMediaLinks = [
  { key: 'website_url', label: 'Website', icon: Globe, placeholder: 'https://example.com' },
  { key: 'instagram_url', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'github_url', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
  { key: 'linkedin_url', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'twitter_url', label: 'Twitter/X', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { key: 'facebook_url', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
  { key: 'youtube_url', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@channel' },
] as const;

const Vault = () => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Encryption state — the derived key lives only in memory for this session.
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [lockMode, setLockMode] = useState<'checking' | 'setup' | 'unlock'>('checking');
  const [lockLoading, setLockLoading] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formSocialLinks, setFormSocialLinks] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      const { data: keyRow } = await supabase
        .from('vault_keys')
        .select('salt, verifier')
        .eq('user_id', session.user.id)
        .maybeSingle();

      setLockMode(keyRow ? 'unlock' : 'setup');
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setCryptoKey(null);
        navigate('/auth');
      } else {
        setUser({ id: session.user.id, email: session.user.email || '' });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  /** Derives the key from the passphrase, then unlocks or initialises the vault. */
  const handlePassphrase = async (passphrase: string) => {
    if (!user) return;
    setLockLoading(true);
    setLockError(null);

    try {
      if (lockMode === 'setup') {
        const salt = generateSalt();
        const key = await deriveKey(passphrase, salt);
        const verifier = await createVerifier(key);

        const { error } = await supabase
          .from('vault_keys')
          .insert({ user_id: user.id, salt, verifier });

        if (error) throw error;

        setCryptoKey(key);
        await fetchCredentials(user.id, key);
        toast({
          title: "Vault encrypted",
          description: "Your credentials are now encrypted before they leave this device.",
        });
      } else {
        const { data: keyRow, error } = await supabase
          .from('vault_keys')
          .select('salt, verifier')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (!keyRow) {
          setLockMode('setup');
          return;
        }

        const key = await deriveKey(passphrase, keyRow.salt);
        const valid = await checkVerifier(key, keyRow.verifier);
        if (!valid) {
          setLockError('Incorrect master passphrase');
          return;
        }

        setCryptoKey(key);
        await fetchCredentials(user.id, key);
      }
    } catch (error: any) {
      setLockError(error.message || 'Could not unlock the vault');
    } finally {
      setLockLoading(false);
    }
  };

  const handleLockSignOut = async () => {
    setCryptoKey(null);
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const fetchCredentials = async (userId: string, key?: CryptoKey | null) => {
    const activeKey = key ?? cryptoKey;
    if (!activeKey) return;

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
      const decrypted = await Promise.all(
        (data || []).map(async (row) => ({
          ...row,
          email: await decryptString(activeKey, row.email),
          password: await decryptString(activeKey, row.password),
        }))
      );

      // Transparently upgrade any rows saved before encryption was enabled.
      const legacy = (data || []).filter((row) => !isEncrypted(row.email) || !isEncrypted(row.password));
      if (legacy.length > 0) {
        await Promise.all(
          legacy.map(async (row) =>
            supabase
              .from('credentials')
              .update({
                email: await encryptString(activeKey, row.email),
                password: await encryptString(activeKey, row.password),
              })
              .eq('id', row.id)
          )
        );
      }

      setCredentials(decrypted);
    }
    setLoading(false);
  };


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setImageUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('credential-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('credential-images')
        .getPublicUrl(fileName);

      setFormImageUrl(publicUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !cryptoKey) return;

    setFormLoading(true);

    try {
      const credentialData = {
        title: formTitle.trim(),
        // Encrypted in the browser — the database never sees the real values.
        email: await encryptString(cryptoKey, formEmail.trim()),
        password: await encryptString(cryptoKey, formPassword),
        image_url: formImageUrl || null,
        website_url: formSocialLinks.website_url || null,
        instagram_url: formSocialLinks.instagram_url || null,
        github_url: formSocialLinks.github_url || null,
        linkedin_url: formSocialLinks.linkedin_url || null,
        twitter_url: formSocialLinks.twitter_url || null,
        google_url: formSocialLinks.google_url || null,
        facebook_url: formSocialLinks.facebook_url || null,
        youtube_url: formSocialLinks.youtube_url || null,
      };

      if (editingCredential) {
        const { error } = await supabase
          .from('credentials')
          .update(credentialData)
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
            ...credentialData,
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
    setFormImageUrl(credential.image_url || '');
    setFormSocialLinks({
      website_url: credential.website_url || '',
      instagram_url: credential.instagram_url || '',
      github_url: credential.github_url || '',
      linkedin_url: credential.linkedin_url || '',
      twitter_url: credential.twitter_url || '',
      google_url: credential.google_url || '',
      facebook_url: credential.facebook_url || '',
      youtube_url: credential.youtube_url || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCredential(null);
    setFormTitle('');
    setFormEmail('');
    setFormPassword('');
    setFormImageUrl('');
    setFormSocialLinks({});
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
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

  const getSocialIcon = (url: string) => {
    if (url.includes('instagram')) return Instagram;
    if (url.includes('github')) return Github;
    if (url.includes('linkedin')) return Linkedin;
    if (url.includes('twitter') || url.includes('x.com')) return Twitter;
    if (url.includes('facebook')) return Facebook;
    if (url.includes('youtube')) return Youtube;
    return Globe;
  };

  const getActiveSocialLinks = (credential: Credential) => {
    const links: { url: string; icon: typeof Globe }[] = [];
    if (credential.website_url) links.push({ url: credential.website_url, icon: Globe });
    if (credential.instagram_url) links.push({ url: credential.instagram_url, icon: Instagram });
    if (credential.github_url) links.push({ url: credential.github_url, icon: Github });
    if (credential.linkedin_url) links.push({ url: credential.linkedin_url, icon: Linkedin });
    if (credential.twitter_url) links.push({ url: credential.twitter_url, icon: Twitter });
    if (credential.facebook_url) links.push({ url: credential.facebook_url, icon: Facebook });
    if (credential.youtube_url) links.push({ url: credential.youtube_url, icon: Youtube });
    return links;
  };

  const filteredCredentials = credentials.filter((cred) =>
    cred.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cred.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || lockMode === 'checking') return null;

  if (!cryptoKey) {
    return (
      <VaultLock
        mode={lockMode}
        loading={lockLoading}
        error={lockError}
        onSubmit={handlePassphrase}
        onSignOut={handleLockSignOut}
      />
    );
  }

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
              <DialogContent className="glass-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {editingCredential ? 'Edit Credential' : 'Add New Credential'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Profile Image</Label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-lg bg-muted/50 border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {formImageUrl ? (
                          <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={imageUploading}
                          className="border-border hover:border-primary"
                        >
                          {imageUploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Upload Image
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG</p>
                      </div>
                    </div>
                  </div>

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

                  {/* Social Media Links */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <Label className="text-sm font-medium">Social Media Links</Label>
                    {socialMediaLinks.map(({ key, label, icon: Icon, placeholder }) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <Input
                          value={formSocialLinks[key] || ''}
                          onChange={(e) => setFormSocialLinks(prev => ({ ...prev, [key]: e.target.value }))}
                          className="code-input text-sm"
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
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
                {filteredCredentials.map((credential, index) => {
                  const socialLinks = getActiveSocialLinks(credential);
                  
                  return (
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
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                              {credential.image_url ? (
                                <img 
                                  src={credential.image_url} 
                                  alt={credential.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Key className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {credential.title}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {credential.email}
                              </p>
                            </div>
                          </div>

                          {/* Password row */}
                          <div className="flex items-center gap-2 mt-3">
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

                          {/* Social Links */}
                          {socialLinks.length > 0 && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                              {socialLinks.map(({ url, icon: Icon }, i) => (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg bg-muted/30 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                >
                                  <Icon className="w-4 h-4" />
                                </a>
                              ))}
                            </div>
                          )}
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
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Vault;