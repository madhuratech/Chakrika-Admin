import { designTokens } from '../ui/DesignSystem'

const FormField = ({ label, name, type = 'text', value, onChange, error, placeholder, required = false, options = [], multiline = false, ...props }) => {
  const baseClasses = "w-full px-4 py-3 bg-white/80 dark:bg-charcoal-black/80 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30 transition-all duration-200"
  
  const errorClasses = error ? 'border-red-500 dark:border-red-500' : ''
  
  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={`${baseClasses} ${errorClasses} ${multiline ? 'min-h-[100px] resize-y' : ''}`}
            style={{ 
              fontFamily: designTokens.typography.fontSans,
              color: designTokens.colors.text
            }}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${baseClasses} ${errorClasses} ${multiline ? 'min-h-[100px] resize-y' : ''}`}
            rows={multiline ? 4 : 1}
            style={{ 
              fontFamily: designTokens.typography.fontSans,
              color: designTokens.colors.text
            }}
            {...props}
          />
        )
      case 'checkbox':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name={name}
              checked={value}
              onChange={onChange}
              className="w-5 h-5 text-deep-olive bg-white/80 dark:bg-charcoal-black/80 border border-border/50 rounded focus:ring-2 focus:ring-deep-olive/20"
              {...props}
            />
            <span 
              className="text-sm"
              style={{ 
                fontFamily: designTokens.typography.fontSans,
                color: designTokens.colors.text
              }}
            >
              {label}
            </span>
          </label>
        )
      default:
        return (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${baseClasses} ${errorClasses}`}
            style={{ 
              fontFamily: designTokens.typography.fontSans,
              color: designTokens.colors.text
            }}
            {...props}
          />
        )
    }
  }

  if (type === 'checkbox') {
    return renderInput()
  }

  return (
    <div className="space-y-2">
      <label 
        className="block text-sm font-medium"
        style={{ 
          fontFamily: designTokens.typography.fontSans,
          color: designTokens.colors.textH
        }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {renderInput()}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export default FormField
