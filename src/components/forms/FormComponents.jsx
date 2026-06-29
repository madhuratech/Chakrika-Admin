import { motion } from 'framer-motion'
import { designTokens } from '../ui/DesignSystem'

const FormField = ({ label, type = 'text', placeholder, value, onChange, required = false }) => {
  return (
    <div>
      <label 
        className="block text-sm font-medium mb-2"
        style={{ 
          fontFamily: designTokens.typography.fontSans,
          color: designTokens.colors.textH
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30 transition-all duration-200"
        style={{ 
          fontFamily: designTokens.typography.fontSans,
          color: designTokens.colors.text
        }}
        required={required}
      />
    </div>
  )
}

const FormTextarea = ({ label, placeholder, value, onChange, rows = 4, required = false }) => {
  return (
    <div>
      <label 
        className="block text-sm font-medium mb-2"
        style={{ 
          fontFamily: designTokens.typography.fontSans,
          color: designTokens.colors.textH
        }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30 resize-none transition-all duration-200"
        style={{ 
          fontFamily: designTokens.typography.fontSans,
          color: designTokens.colors.text
        }}
        required={required}
      />
    </div>
  )
}

const FormSelect = ({ label, options, value, onChange, required = false }) => {
  return (
    <div>
      <label 
        className="block text-sm font-medium mb-2"
        style={{ 
          fontFamily: designTokens.typography.fontSans,
          color: designTokens.colors.textH
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30 transition-all duration-200"
        style={{ 
          fontFamily: designTokens.typography.fontSans,
          color: designTokens.colors.text
        }}
        required={required}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )
}

const FormGroup = ({ children, className = '' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg ${className}`}
    >
      {children}
    </motion.div>
  )
}

export { FormField, FormTextarea, FormSelect, FormGroup }