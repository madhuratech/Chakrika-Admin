import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-600 dark:text-red-400',
          borderColor: 'border-red-200 dark:border-red-800',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        }
      case 'info':
        return {
          icon: AlertTriangle,
          iconColor: 'text-blue-600 dark:text-blue-400',
          borderColor: 'border-blue-200 dark:border-blue-800',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
        }
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-gray-600 dark:text-gray-400',
          borderColor: 'border-gray-200 dark:border-gray-800',
          confirmButton: 'bg-gray-600 hover:bg-gray-700 text-white',
        }
    }
  }

  const config = getTypeConfig()
  const Icon = config.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`relative w-full max-w-md bg-white/95 dark:bg-charcoal-black/95 backdrop-blur-xl border ${config.borderColor} rounded-2xl shadow-2xl p-6`}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100/50 dark:bg-white/5 hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-text" />
              </button>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 bg-gray-100/50 dark:bg-white/5 rounded-xl flex items-center justify-center ${config.iconColor}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-h">{title}</h3>
                </div>
              </div>
              
              <p className="text-text mb-6">{message}</p>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100/50 dark:bg-white/5 text-text rounded-xl hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors font-medium"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className={`flex-1 px-4 py-2 ${config.confirmButton} rounded-xl transition-colors font-medium`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmDialog