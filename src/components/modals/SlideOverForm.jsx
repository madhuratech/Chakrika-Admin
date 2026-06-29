import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const SlideOverForm = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={`w-screen ${sizeClasses[size]}`}
            >
              <div className="flex h-full flex-col bg-white/95 dark:bg-charcoal-black/95 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                  <h2 className="text-xl font-semibold text-text-h">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-gray-100/50 dark:bg-white/5 hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-text" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default SlideOverForm