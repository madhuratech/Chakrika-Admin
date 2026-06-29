import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react'
import { designTokens } from '../ui/DesignSystem'

const DataTable = ({ columns, data, emptyState, onRowClick, sortable = true }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [searchTerm, setSearchTerm] = useState('')

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aValue = columns.find(col => col.id === sortConfig.key)?.accessor(a) || a[sortConfig.key]
    const bValue = columns.find(col => col.id === sortConfig.key)?.accessor(b) || b[sortConfig.key]
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const filteredData = sortedData.filter(row => {
    return columns.some(column => {
      const value = column.accessor ? column.accessor(row) : row[column.id]
      return String(value).toLowerCase().includes(searchTerm.toLowerCase())
    })
  })

  const handleSort = (key) => {
    if (!sortable) return
    
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key) => {
    if (!sortable) return null
    if (sortConfig.key !== key) {
      return <ChevronUp className="w-4 h-4" style={{ color: designTokens.colors.text }} />
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" style={{ color: designTokens.colors.deepOlive }} />
    ) : (
      <ChevronDown className="w-4 h-4" style={{ color: designTokens.colors.deepOlive }} />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg overflow-hidden"
    >
      {data.length > 0 && (
        <div className="p-6 border-b border-border/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: designTokens.colors.text }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30 w-full lg:w-64"
                style={{ 
                  fontFamily: designTokens.typography.fontSans,
                  color: designTokens.colors.text
                }}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm" style={{ color: designTokens.colors.text }}>
              <Filter className="w-4 h-4" />
              <span>{filteredData.length} results</span>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100/50 dark:bg-white/5">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`px-6 py-4 text-left text-sm font-semibold ${designTokens.typography.weights.semibold} ${designTokens.colors.textH} ${column.id === 'actions' ? 'text-right' : ''}`}
                  onClick={() => handleSort(column.id)}
                >
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <span>{column.header}</span>
                    {getSortIcon(column.id)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredData.map((row, index) => (
              <motion.tr
                key={row.id || index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`hover:bg-gray-100/30 dark:hover:bg-white/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-6 py-4 ${column.id === 'actions' ? 'text-right' : ''}`}
                    style={{ 
                      fontFamily: designTokens.typography.fontSans,
                      color: designTokens.colors.text
                    }}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="p-12">
          {emptyState}
        </div>
      )}
    </motion.div>
  )
}

export { DataTable }