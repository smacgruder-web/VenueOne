import { motion } from 'framer-motion';

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden>
      <div className="absolute inset-0 bg-[#060C18]" />
      <motion.div
        className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full opacity-30 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #0EA5A0 0%, transparent 70%)' }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-24 h-[420px] w-[420px] rounded-full opacity-25 blur-[90px]"
        style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)' }}
        animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 left-1/3 h-[360px] w-[360px] rounded-full opacity-20 blur-[80px]"
        style={{ background: 'radial-gradient(circle, #7B5CF5 0%, transparent 70%)' }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245,166,35,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}