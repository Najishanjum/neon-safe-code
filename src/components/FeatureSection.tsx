import { motion } from 'framer-motion';
import { Shield, Eye, Fingerprint, Zap, Database, Code } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Zero-Knowledge Architecture',
    description: "Your master password never leaves your device. We can't see your data, even if we wanted to.",
    color: 'bg-arcade-lime',
  },
  {
    icon: Eye,
    title: 'Secure Reveal',
    description: 'View passwords with a single click. Auto-hide after a configurable timeout.',
    color: 'bg-card',
  },
  {
    icon: Fingerprint,
    title: 'Social Media Integration',
    description: 'Store and manage all your social media profiles with easy one-click access.',
    color: 'bg-arcade-blue',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Instant access to your vault. No loading screens, no waiting.',
    color: 'bg-arcade-yellow',
  },
  {
    icon: Database,
    title: 'Image Attachments',
    description: 'Attach profile images or screenshots to your credentials for easy identification.',
    color: 'bg-card',
  },
  {
    icon: Code,
    title: 'Developer First',
    description: 'Built by developers, for developers. Clean interface, keyboard shortcuts.',
    color: 'bg-arcade-red',
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
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl mb-4">
            <span className="text-foreground">Security meets </span>
            <span className="text-arcade-lime" style={{ textShadow: '5px 5px 0 #000' }}>
              simplicity
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
            Every feature designed with security and developer experience in mind.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const isDark = feature.color === 'bg-card';
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <div
                  className={`brutal-block ${feature.color} ${
                    isDark ? 'text-foreground' : 'text-primary-foreground'
                  } p-6 h-full`}
                >
                  <div
                    className={`w-12 h-12 border-2 border-foreground flex items-center justify-center mb-4 ${
                      isDark ? 'bg-arcade-lime' : 'bg-background'
                    }`}
                  >
                    <feature.icon
                      className={`w-6 h-6 ${isDark ? 'text-primary-foreground' : 'text-arcade-lime'}`}
                    />
                  </div>
                  <h3 className="text-lg mb-2">{feature.title}</h3>
                  <p className={`text-sm font-medium ${isDark ? 'text-muted-foreground' : 'opacity-80'}`}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
