import { motion } from 'framer-motion';
import { Shield, Eye, Fingerprint, Zap, Database, Code } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Zero-Knowledge Architecture',
    description: 'Your master password never leaves your device. We can\'t see your data, even if we wanted to.',
  },
  {
    icon: Eye,
    title: 'Secure Reveal',
    description: 'View passwords with a single click. Auto-hide after a configurable timeout.',
  },
  {
    icon: Fingerprint,
    title: 'Social Media Integration',
    description: 'Store and manage all your social media profiles with easy one-click access.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Instant access to your vault. No loading screens, no waiting.',
  },
  {
    icon: Database,
    title: 'Image Attachments',
    description: 'Attach profile images or screenshots to your credentials for easy identification.',
  },
  {
    icon: Code,
    title: 'Developer First',
    description: 'Built by developers, for developers. Clean interface, keyboard shortcuts.',
  },
];

const FeatureSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">Security meets </span>
            <span className="text-primary neon-text">simplicity</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every feature designed with security and developer experience in mind.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="glass-card rounded-xl p-6 h-full transition-all hover:border-primary/50 group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-all group-hover:bg-primary/20">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
