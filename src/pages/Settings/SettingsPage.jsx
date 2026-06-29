/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatsCard } from '../../components/ui/StatsCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { SlideOverForm } from '../../components/ui/SlideOverForm'
import { SearchBar } from '../../components/ui/SearchBar'
import { DataTable } from '../../components/tables/DataTable'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Store, Edit, Trash2, Shield, Mail, Phone, Globe } from 'lucide-react'
import ImageUploader from '../../components/ui/ImageUploader'
import { apiService } from '../../services/api'
import toast from 'react-hot-toast'

const SETTINGS_META = {
  store_name: { name: 'Store Name', category: 'Basic' },
  store_email: { name: 'Store Email', category: 'Contact' },
  store_phone: { name: 'Store Phone', category: 'Contact' },
  timezone: { name: 'Timezone', category: 'Regional' },
  currency: { name: 'Currency', category: 'Regional' },
  language: { name: 'Language', category: 'Regional' },
  store_logo: { name: 'Store Logo', category: 'Branding' },
}

const KEY_TO_INFO = {
  store_name: 'storeName',
  store_email: 'storeEmail',
  store_phone: 'storePhone',
  timezone: 'timezone',
  currency: 'currency',
  language: 'language',
  store_logo: 'storeLogo',
}

const SettingsPage = () => {
  const [storeInfo, setStoreInfo] = useState({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeLogo: '',
    timezone: '',
    currency: '',
    language: '',
  })
  const [settingsData, setSettingsData] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSetting, setSelectedSetting] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await apiService.get('/settings')
      const items = response.data || []

      const info = { ...storeInfo }
      const mapped = items.map(item => {
        const meta = SETTINGS_META[item.setting_key] || {
          name: item.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          category: 'Other',
        }
        const infoKey = KEY_TO_INFO[item.setting_key]
        if (infoKey) {
          info[infoKey] = item.setting_value
        }
        return {
          id: item.id,
          name: meta.name,
          value: item.setting_value,
          category: meta.category,
          editable: true,
          setting_key: item.setting_key,
        }
      })

      setStoreInfo(info)
      setSettingsData(mapped)
    } catch (err) {
      console.error('Failed to fetch settings:', err)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const filteredSettings = settingsData.filter(setting => {
    const matchesSearch = setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleEdit = (setting) => {
    setSelectedSetting(setting)
    setEditValue(setting.value)
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleDelete = (setting) => {
    setSelectedSetting(setting)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    setSelectedSetting(null)
    setIsDeleteDialogOpen(false)
    toast.success('Setting deleted successfully')
  }

  const validateForm = () => {
    const errors = {}
    if (!editValue.trim()) {
      errors.value = 'Setting value is required and cannot be blank'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!selectedSetting) return
    if (!validateForm()) {
      toast.error('Please correct the validation errors')
      return
    }
    try {
      setSaving(true)
      await apiService.put(`/settings/${selectedSetting.setting_key}`, { setting_value: editValue })
      toast.success('Setting updated successfully')
      setIsFormOpen(false)
      setSelectedSetting(null)
      setEditValue('')
      await fetchSettings()
    } catch (err) {
      console.error('Failed to update setting:', err)
      toast.error('Failed to update setting')
    } finally {
      setSaving(false)
    }
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setSelectedSetting(null)
    setEditValue('')
    setFormErrors({})
  }

  const closeDelete = () => {
    setIsDeleteDialogOpen(false)
    setSelectedSetting(null)
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Basic': 'bg-blue-100/50 text-blue-600 dark:text-blue-400',
      'Contact': 'bg-green-100/50 text-green-600 dark:text-green-400',
      'Regional': 'bg-purple-100/50 text-purple-600 dark:text-purple-400',
      'Branding': 'bg-amber-100/50 text-amber-600 dark:text-amber-400',
    }
    return colors[category] || 'bg-gray-100/50 text-text'
  }

  const columns = [
    {
      id: 'name',
      header: 'Setting Name',
      accessor: (row) => row.name,
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100/50 dark:bg-white/5 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-text" />
          </div>
          <div>
            <p className="font-medium text-text-h">{row.name}</p>
            <p className="text-sm text-text">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'value',
      header: 'Value',
      accessor: (row) => row.value,
      cell: (row) => (
        <span className="text-text">{row.value}</span>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessor: (row) => row.category,
      cell: (row) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(row.category)}`}>
          {row.category}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-text hover:text-deep-olive hover:bg-deep-olive/10 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-text hover:text-red-600 hover:bg-red-100/50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Configure your store settings, including business information, regional preferences, and system configurations."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Store Name"
          value={storeInfo.storeName || '-'}
          icon={<Store className="w-6 h-6" />}
          color="olive"
          trend="up"
          trendValue="0"
        />
        <StatsCard
          title="Store Email"
          value={storeInfo.storeEmail || '-'}
          icon={<Mail className="w-6 h-6" />}
          color="gold"
          trend="up"
          trendValue="0"
        />
        <StatsCard
          title="Store Phone"
          value={storeInfo.storePhone || '-'}
          icon={<Phone className="w-6 h-6" />}
          color="charcoal"
          trend="up"
          trendValue="0"
        />
        <StatsCard
          title="Timezone"
          value={storeInfo.timezone || '-'}
          icon={<Globe className="w-6 h-6" />}
          color="olive"
          trend="up"
          trendValue="0"
        />
      </div>

      <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <SearchBar
            placeholder="Search settings..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-md"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-olive" />
        </div>
      ) : filteredSettings.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredSettings}
          emptyState={
            <EmptyState
              title="No settings found"
              description="Try adjusting your search or filters to find what you're looking for."
              icon="⚙️"
            />
          }
        />
      ) : (
        <EmptyState
          title="No settings found"
          description="Try adjusting your search or filters to find what you're looking for."
          icon="⚙️"
        />
      )}

      <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-text-h mb-6">Store Branding</h3>
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gray-100/50 dark:bg-white/5 rounded-xl overflow-hidden border border-border/40">
            {storeInfo.storeLogo ? (
              <img src={storeInfo.storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-deep-olive/10 text-deep-olive">CS</div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-text-h mb-2">Store Logo</h4>
            <p className="text-sm text-text mb-4">Upload your store logo (recommended size: 200x200px)</p>
            <div className="max-w-xs">
              <ImageUploader
                images={storeInfo.storeLogo ? [storeInfo.storeLogo] : []}
                onChange={async (imgs) => {
                  try {
                    const newLogo = imgs[0] || '';
                    await apiService.put('/settings/store_logo', { setting_value: newLogo });
                    toast.success('Store logo updated');
                    fetchSettings();
                  } catch {
                    toast.error('Failed to update store logo');
                  }
                }}
                multiple={false}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-text-h mb-6">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-100/50 dark:bg-white/5 rounded-xl">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-text" />
              <span className="text-text-h">Two-Factor Authentication</span>
            </div>
            <button className="px-4 py-2 bg-green-100/50 text-green-600 dark:text-green-400 rounded-lg font-medium">
              Enabled
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-100/50 dark:bg-white/5 rounded-xl">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-text" />
              <span className="text-text-h">Session Timeout</span>
            </div>
            <button className="px-4 py-2 bg-gray-100/50 text-text rounded-lg font-medium">
              30 minutes
            </button>
          </div>
        </div>
      </div>

      <SlideOverForm
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedSetting ? 'Edit Setting' : 'Add New Setting'}
        subtitle="Configure the system preferences for your store panel"
        size="sm"
      >
        <div className="space-y-6 pb-20">
          <div>
            <label className="block text-xs font-semibold text-text-h mb-2">Setting Name</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-100/50 dark:bg-white/5 border border-border/60 rounded-xl focus:outline-none text-text-h font-medium"
              value={selectedSetting?.name || ''}
              disabled
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-h mb-2">Setting Value <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                formErrors.value ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
              }`}
              placeholder="Enter setting value"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
            {formErrors.value && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.value}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-h mb-2">Category</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-100/50 dark:bg-white/5 border border-border/60 rounded-xl focus:outline-none text-text-h font-medium"
              value={selectedSetting?.category || ''}
              disabled
            />
          </div>

          {/* Sticky Footer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-charcoal-black/90 backdrop-blur-md px-8 py-4 border-t border-border/50 flex justify-end gap-3 z-20">
            <button
              type="button"
              onClick={closeForm}
              className="px-6 py-2.5 text-xs text-text hover:text-text-h border border-border/60 rounded-xl transition-colors font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-deep-olive to-green-700 hover:from-green-700 hover:to-deep-olive text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Setting'}
            </button>
          </div>
        </div>
      </SlideOverForm>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDelete}
        onConfirm={confirmDelete}
        title="Delete Setting"
        description={`Are you sure you want to delete setting "${selectedSetting?.name}"? This action cannot be undone.`}
        confirmText="Delete Setting"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

export default SettingsPage

