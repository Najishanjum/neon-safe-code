import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Flat black base */}
      <div className="absolute inset-0 bg-background" />

      {/* Hard grid */}
      <div className="absolute inset-0 bg-cyber-grid [background-size:48px_48px] opacity-40 animate-grid-flow" />

      {/* Blocky color slabs */}
      <motion.div
        className="absolute -top-24 -left-16 w-64 h-64 bg-arcade-lime/10 border-2 border-arcade-lime/20"
        animate={{ rotate: [0, 4, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 -right-20 w-80 h-56 bg-arcade-blue/10 border-2 border-arcade-blue/20"
        animate={{ rotate: [0, -3, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-24 h-24 bg-arcade-yellow/10 border-2 border-arcade-yellow/25"
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[3px] bg-arcade-lime/20"
        initial={{ top: '-3px' }}
        animate={{ top: '100%' }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default AnimatedBackground;
