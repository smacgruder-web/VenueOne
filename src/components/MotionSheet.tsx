import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface MotionSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function MotionSheet({ open, onClose, children }: MotionSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-h-[85dvh] overflow-y-auto rounded-t-[20px] border-t border-[#F5A62333] p-5 pb-[max(2rem,env(safe-area-inset-bottom))] sm:p-6"
            style={{
              background: 'linear-gradient(180deg, #141c2e 0%, #111827 100%)',
              boxShadow: '0 -8px 40px rgba(245,166,35,0.12)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#2A3547]" />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}