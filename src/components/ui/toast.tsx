"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export type ToastProps = {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
};

export function Toast({ message, type, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        className={`fixed top-20 sm:right-4 sm:left-auto left-4 right-4 sm:max-w-[320px] transform-none sm:transform sm:translate-x-0 z-50 px-4 py-3 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white flex flex-col sm:flex-row items-start sm:items-center gap-2`}
      >
        <div className="flex-1 break-words pr-6">{message}</div>
        <button 
          onClick={onClose} 
          className="text-white hover:text-white/80 absolute right-2 top-2 sm:relative sm:right-0 sm:top-0"
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}