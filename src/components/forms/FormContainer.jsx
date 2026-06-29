import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { designTokens } from '../ui/DesignSystem'

const FormContainer = ({ isOpen, onClose, title, onSubmit, children, submitText = 'Save', isSubmitting = false }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white/95 dark:bg-charcoal-black/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <h2 
                  className="text-2xl font-semibold"
                  style={{ 
                    fontFamily: designTokens.typography.fontHeading,
                    color: designTokens.colors.textH
                  }}
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-gray-100/50 dark:bg-white/5 hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors"
                  style={{ color: designTokens.colors.text }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={onSubmit} className="p-6">
                {children}
                
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-border/50">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-100/50 dark:bg-white/5 text-text rounded-xl hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors font-medium"
                    style={{ 
                      fontFamily: designTokens.typography.fontSans,
                      color: designTokens.colors.text
                    }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      fontFamily: designTokens.typography.fontSans
                    }}
                  >
                    {isSubmitting ? 'Saving...' : submitText}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default FormContainer
