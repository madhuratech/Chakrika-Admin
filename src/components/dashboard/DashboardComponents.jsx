import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { designTokens, getLuxuryColorClasses } from '../ui/DesignSystem'

const DashboardWidget = ({ title, value, icon, trend, trendValue, color = 'olive', onClick }) => {
  const colorClasses = getLuxuryColorClasses(color, 'default')

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`relative p-6 ${colorClasses.base} ${colorClasses.border} ${designTokens.borderRadius['2xl']} ${designTokens.shadows.luxuryShadow} hover:${colorClasses.hover?.shadow} transition-all duration-300 cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses.bg} ${designTokens.borderRadius.xl} flex items-center justify-center ${colorClasses.text}`}
        >
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>

      <div>
        <p 
          className="text-sm font-medium mb-1"
          style={{ 
            fontFamily: designTokens.typography.fontSans,
            color: designTokens.colors.text
          }}
        >
          {title}
        </p>
        <div className="flex items-baseline space-x-2">
          <h3 
            className="text-3xl font-semibold"
            style={{ 
              fontFamily: designTokens.typography.fontHeading,
              color: designTokens.colors.textH
            }}
          >
            {value}
          </h3>
        </div>
      </div>

      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorClasses.gradient} opacity-10 rounded-full -mr-10 -mt-10`}
      ></div>
    </motion.div>
  )
}

const QuickAction = ({ title, description, icon, color, onClick }) => {
  const colorClasses = getLuxuryColorClasses(color, 'hover')

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-4 bg-gradient-to-r ${colorClasses.bg} ${designTokens.borderRadius.xl} text-left transition-all duration-200`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/80 dark:bg-charcoal-black/80 ${designTokens.borderRadius.lg} flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p 
            className="font-medium"
            style={{ 
              fontFamily: designTokens.typography.fontSans,
              color: designTokens.colors.textH
            }}
          >
            {title}
          </p>
          <p 
            className="text-sm"
            style={{ 
              fontFamily: designTokens.typography.fontSans,
              color: designTokens.colors.text
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  )
}

const StatProgress = ({ label, value, max, color = 'olive' }) => {
  const colorClasses = getLuxuryColorClasses(color, 'default')

  const percentage = (value / max) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span 
          className="text-sm"
          style={{ 
            fontFamily: designTokens.typography.fontSans,
            color: designTokens.colors.text
          }}
        >
          {label}
        </span>
        <span 
          className="text-sm font-medium"
          style={{ 
            fontFamily: designTokens.typography.fontSans,
            color: designTokens.colors.textH
          }}
        >
          {value}/{max}
        </span>
      </div>
      <div className="w-full bg-gray-200/50 dark:bg-white/5 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-2 ${colorClasses.bg} rounded-full`}
        />
      </div>
    </div>
  )
}

export { DashboardWidget, QuickAction, StatProgress }