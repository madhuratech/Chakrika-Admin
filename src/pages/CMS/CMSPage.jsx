import { useState, useEffect } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { SlideOverForm } from '../../components/ui/SlideOverForm'
import { SearchBar } from '../../components/ui/SearchBar'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable } from '../../components/tables/DataTable'
import ImageUploader from '../../components/ui/ImageUploader'
import { apiService } from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, Image, Star, ShoppingBag, Layout, Instagram, Menu, Link, GripVertical, X, FileText } from 'lucide-react'

const PAGE_GROUPS = [
  {
    label: 'Home Page',
    tabs: [
      { key: 'heroBanners', label: 'Hero Banners', icon: Image, desc: 'Homepage carousel slides' },
      { key: 'featuredCollections', label: 'Featured Collections', icon: Star, desc: 'Homepage featured collections' },
      { key: 'shopOccasions', label: 'Shop Occasions', icon: ShoppingBag, desc: 'Occasion collection grid' },
      { key: 'brandStory', label: 'Brand Story', icon: Layout, desc: 'About brand section' },
      { key: 'bestsellers', label: 'Bestsellers Section', icon: Star, desc: 'Bestsellers header text' },
      { key: 'newArrivals', label: 'New Arrivals Section', icon: Image, desc: 'New arrivals header text' },
      { key: 'testimonials', label: 'Testimonials', icon: Star, desc: 'Customer reviews' },
      { key: 'instagram', label: 'Instagram Gallery', icon: Instagram, desc: 'Instagram gallery feed' },
    ]
  },
  {
    label: 'Navigation',
    tabs: [
      { key: 'navigationItems', label: 'Navigation Items', icon: Link, desc: 'Navbar top-level links' },
      { key: 'megaMenu', label: 'Mega Menu', icon: Menu, desc: 'Navbar dropdown menu sections with images' },
    ]
  },
]

const ALL_TABS = PAGE_GROUPS.flatMap(g => g.tabs)

const initialFormData = {
  title: '', subtitle: '', description: '', image: '', ctaText: '', link: '',
  enabled: true, customer_name: '', location: '', rating: 5, message: '', section: '',
  links: [], images: [], menu_section_key: '', collection_id: '',
}

const CMSPage = () => {
  const [sections, setSections] = useState({})
  const [collectionsList, setCollectionsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('heroBanners')
  const [formData, setFormData] = useState(initialFormData)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bestsellersHeader, setBestsellersHeader] = useState({ title: '', subtitle: '' })
  const [newArrivalsHeader, setNewArrivalsHeader] = useState({ badge: '', title: '', subtitle: '' })

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [heroRes, occRes, homepageRes, testimonialRes, instagramRes, menuRes, navRes, featuredRes, collectionsRes] = await Promise.all([
        apiService.get('/hero').catch(() => ({ data: [] })),
        apiService.get('/occasions').catch(() => ({ data: [] })),
        apiService.get('/homepage').catch(() => ({ data: [] })),
        apiService.get('/testimonials').catch(() => ({ data: [] })),
        apiService.get('/instagram').catch(() => ({ data: [] })),
        apiService.get('/menu').catch(() => ({ data: [] })),
        apiService.get('/navigations').catch(() => ({ data: [] })),
        apiService.get('/featured-collections').catch(() => ({ data: [] })),
        apiService.get('/collections').catch(() => ({ data: [] })),
      ])

      setCollectionsList(collectionsRes.data || collectionsRes || [])

      setSections({
        heroBanners: (heroRes.data || []).map(b => ({
          id: b.id, title: b.title || '', subtitle: b.subtitle || '',
          image: b.desktop_image || b.mobile_image || b.image || '',
          ctaText: b.button_text || '', link: b.button_link || '',
          display_order: b.display_order || 0,
          enabled: b.status === 'active',
        })),
        featuredCollections: (featuredRes.data || []).map(fc => ({
          id: fc.id,
          title: fc.title || fc.collection_name || `Collection #${fc.collection_id}`,
          subtitle: fc.subtitle || fc.collection_description || '',
          collection_id: fc.collection_id || '',
          image: fc.image || fc.collection_image || '',
          link: fc.link || '',
          enabled: fc.status === 'active',
          display_order: fc.display_order || 0,
        })),
        shopOccasions: (occRes.data || []).map(o => ({
          id: o.id, title: o.title || '', subtitle: o.subtitle || '',
          image: o.image || '', link: o.link || '',
          display_order: o.display_order || 0,
          enabled: o.status === 'active',
        })),
        brandStory: (homepageRes.data || []).filter(s => s.section === 'brand_story').map(s => ({
          id: s.id, title: s.title || '', subtitle: s.subtitle || '',
          description: s.description || '', image: s.image || '',
          button_text: s.button_text || '', button_link: s.button_link || '',
          display_order: 0, enabled: s.status === 'active',
        })),
        bestsellers: (homepageRes.data || []).filter(s => s.section === 'bestsellers').map(s => ({
          id: s.id, title: s.title || '', subtitle: s.subtitle || '',
          description: s.description || '', image: s.image || '',
          button_text: s.button_text || '', button_link: s.button_link || '',
          display_order: 0, enabled: s.status === 'active',
        })),
        newArrivals: (homepageRes.data || []).filter(s => s.section === 'new_arrivals').map(s => ({
          id: s.id, title: s.title || '', subtitle: s.subtitle || '',
          description: s.description || '', image: s.image || '',
          button_text: s.button_text || '', button_link: s.button_link || '',
          display_order: 0, enabled: s.status === 'active',
        })),
        testimonials: (testimonialRes.data || []).map(t => ({
          id: t.id, customer_name: t.customer_name || '',
          location: t.location || '', rating: t.rating || 5,
          message: t.message || '', display_order: t.display_order || 0,
          enabled: t.status === 'active',
        })),
        instagram: (instagramRes.data || []).map(g => ({
          id: g.id, image: g.image || '', link: g.link || '',
          display_order: g.display_order || 0, enabled: g.status === 'active',
        })),
        navigationItems: (navRes.data || []).map(n => ({
          id: n.id, title: n.label || '', label: n.label || '',
          link: n.link || '',
          menu_section_key: n.menu_section_key || '',
          display_order: n.display_order || 0,
          enabled: n.status === 'active',
        })),
        megaMenu: (menuRes.data || []).map(m => ({
          id: m.id, title: m.title || '', section_key: m.section_key || '',
          links: m.links || [], images: m.images || [],
          display_order: m.display_order || 0, enabled: m.status === 'active',
        })),
      })

      const headerItem = (homepageRes.data || []).find(s => s.section === 'bestsellers_header')
      if (headerItem) {
        setBestsellersHeader({
          id: headerItem.id,
          title: headerItem.title || '',
          subtitle: headerItem.subtitle || '',
        })
      } else {
        setBestsellersHeader({ title: '', subtitle: '' })
      }

      const newArrivalsHeaderItem = (homepageRes.data || []).find(s => s.section === 'new_arrivals_header')
      if (newArrivalsHeaderItem) {
        setNewArrivalsHeader({
          id: newArrivalsHeaderItem.id,
          badge: newArrivalsHeaderItem.title || '',
          title: newArrivalsHeaderItem.subtitle || '',
          subtitle: newArrivalsHeaderItem.description || '',
        })
      } else {
        setNewArrivalsHeader({ badge: '', title: '', subtitle: '' })
      }
    } catch {
      toast.error('Failed to load CMS data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSaveHeader = async () => {
    try {
      const payload = {
        section: 'bestsellers_header',
        title: bestsellersHeader.title,
        subtitle: bestsellersHeader.subtitle,
        status: 'active'
      }
      if (bestsellersHeader.id) {
        await apiService.put(`/homepage/${bestsellersHeader.id}`, payload)
      } else {
        await apiService.post('/homepage', payload)
      }
      toast.success('Bestsellers header updated successfully')
      fetchData()
    } catch (err) {
      toast.error('Failed to save bestsellers header')
    }
  }

  const handleSaveNewArrivalsHeader = async () => {
    try {
      const payload = {
        section: 'new_arrivals_header',
        title: newArrivalsHeader.badge,
        subtitle: newArrivalsHeader.title,
        description: newArrivalsHeader.subtitle,
        status: 'active'
      }
      if (newArrivalsHeader.id) {
        await apiService.put(`/homepage/${newArrivalsHeader.id}`, payload)
      } else {
        await apiService.post('/homepage', payload)
      }
      toast.success('New Arrivals header updated successfully')
      fetchData()
    } catch (err) {
      toast.error('Failed to save New Arrivals header')
    }
  }

  const currentItems = sections[activeTab] || []

  const filteredItems = currentItems.filter(item => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (item.title || item.customer_name || item.section_key || '').toLowerCase().includes(term) ||
           (item.subtitle || item.location || '').toLowerCase().includes(term) ||
           (item.description || item.message || '').toLowerCase().includes(term)
  })

  const resetForm = () => {
    setFormData(initialFormData)
    setFormErrors({})
  }

  const handleCreate = () => {
    setSelectedSection(null)
    resetForm()
    setIsFormOpen(true)
  }

  const handleEdit = (item) => {
    setSelectedSection(item)
    setFormData({
      title: item.title || '',
      subtitle: item.subtitle || item.location || '',
      description: item.description || item.message || '',
      image: item.image || '',
      ctaText: item.ctaText || item.button_text || '',
      link: item.link || item.button_link || '',
      display_order: item.display_order ?? 0,
      enabled: item.enabled ?? true,
      customer_name: item.customer_name || '',
      location: item.location || '',
      rating: item.rating || 5,
      message: item.message || '',
      section: item.section || '',
      links: item.links || [],
      images: item.images || [],
      menu_section_key: item.menu_section_key || '',
      collection_id: item.collection_id || '',
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleDelete = (item) => {
    setSelectedSection(item)
    setIsDeleteDialogOpen(true)
  }

  const getEndpoint = () => {
    const map = {
      heroBanners: '/hero',
      shopOccasions: '/occasions',
      brandStory: '/homepage',
      bestsellers: '/homepage',
      newArrivals: '/homepage',
      testimonials: '/testimonials',
      instagram: '/instagram',
      megaMenu: '/menu',
      navigationItems: '/navigations',
      featuredCollections: '/featured-collections',
    }
    return map[activeTab] || `/content/${activeTab}`
  }

  const confirmDelete = async () => {
    try {
      await apiService.delete(`${getEndpoint()}/${selectedSection.id}`)
      toast.success('Deleted successfully')
      fetchData()
    } catch {
      toast.error('Failed to delete')
    }
    setIsDeleteDialogOpen(false)
    setSelectedSection(null)
  }

  const toggleEnabled = async (item) => {
    try {
      await apiService.patch(`${getEndpoint()}/${item.id}/toggle-status`)
      toast.success('Status updated')
      fetchData()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const errors = {}
    if (activeTab === 'testimonials') {
      if (!formData.customer_name?.trim()) errors.customer_name = 'Customer name is required'
      if (!formData.message?.trim()) errors.message = 'Review message is required'
    } else if (activeTab === 'instagram') {
      if (!formData.image) errors.image = 'Image is required'
    } else if (activeTab === 'megaMenu') {
      if (!formData.title?.trim()) errors.title = 'Section title is required'
    } else if (activeTab === 'navigationItems') {
      if (!formData.title?.trim()) errors.title = 'Label is required'
    } else if (activeTab === 'featuredCollections') {
      if (!formData.title?.trim()) errors.title = 'Title is required'
    } else if (['bestsellers', 'newArrivals'].includes(activeTab)) {
      if (!formData.title?.trim()) errors.title = 'Product name is required'
      if (!formData.image) errors.image = 'Product image is required'
      if (!formData.ctaText?.toString().trim()) errors.ctaText = 'Price is required'
    } else {
      if (!formData.title?.trim()) errors.title = 'Title is required'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const buildPayload = () => {
    switch (activeTab) {
      case 'heroBanners':
        return {
          title: formData.title,
          subtitle: formData.subtitle,
          desktop_image: formData.image,
          mobile_image: formData.image,
          display_order: Number(formData.display_order) || 0,
          status: formData.enabled ? 'active' : 'inactive',
          button_text: null,
          button_link: null,
        }
      case 'featuredCollections':
        return {
          collection_id: formData.collection_id ? Number(formData.collection_id) : null,
          title: formData.title || null,
          subtitle: formData.subtitle || null,
          image: formData.image || null,
          link: formData.link || null,
          display_order: 0,
          status: formData.enabled ? 'active' : 'inactive',
        }
      case 'shopOccasions':
        return {
          title: formData.title,
          subtitle: formData.subtitle,
          image: formData.image,
          link: formData.link || '/collections',
          display_order: Number(formData.display_order) || 0,
          status: formData.enabled ? 'active' : 'inactive',
        }
      case 'brandStory':
        return {
          section: 'brand_story',
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          image: formData.image,
          button_text: formData.ctaText,
          button_link: formData.link,
          status: formData.enabled ? 'active' : 'inactive',
        }
      case 'bestsellers':
        return {
          section: 'bestsellers',
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          image: formData.image || null,
          button_text: formData.ctaText || null,
          button_link: formData.link || null,
          status: formData.enabled ? 'active' : 'inactive',
        }
      case 'newArrivals':
        return {
          section: 'new_arrivals',
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          image: formData.image || null,
          button_text: formData.ctaText || null,
          button_link: formData.link || null,
          status: formData.enabled ? 'active' : 'inactive',
        }
      case 'testimonials':
        return {
          customer_name: formData.customer_name,
          location: formData.location,
          rating: Number(formData.rating) || 0,
          message: formData.message,
          display_order: Number(formData.display_order) || 0,
          status: formData.enabled ? 'active' : 'inactive',
        }
      case 'instagram':
        return {
          image: formData.image,
          link: formData.link || 'https://instagram.com/chakrika',
          display_order: Number(formData.display_order) || 0,
          status: formData.enabled ? 'active' : 'inactive',
        }
      case 'megaMenu':
        return {
          section_key: formData.title,
          title: formData.title,
          links: formData.links,
          images: formData.images,
          display_order: Number(formData.display_order) || 0,
          status: formData.enabled ? 'active' : 'inactive',
        }
      case 'navigationItems':
        return {
          label: formData.title,
          link: formData.link || '/collections',
          menu_section_key: formData.menu_section_key || null,
          display_order: Number(formData.display_order) || 0,
          status: formData.enabled ? 'active' : 'inactive',
        }
      default:
        return {}
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please resolve the form errors')
      return
    }
    setIsSubmitting(true)
    try {
      const endpoint = getEndpoint()
      const payload = buildPayload()
      if (selectedSection) {
        await apiService.put(`${endpoint}/${selectedSection.id}`, payload)
        toast.success('Updated successfully')
      } else {
        await apiService.post(endpoint, payload)
        toast.success('Created successfully')
      }
      setIsFormOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      toast.error('Failed to save')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      id: 'title',
      header: activeTab === 'testimonials' ? 'Customer' : activeTab === 'instagram' ? 'Image' : activeTab === 'megaMenu' ? 'Section' : activeTab === 'navigationItems' ? 'Label' : activeTab === 'featuredCollections' ? 'Collection' : 'Title',
      accessor: (row) => row.title || row.customer_name || row.section_key || '',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100/50 dark:bg-white/5 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
            {row.image ? (
              <img src={row.image} alt="" className="w-full h-full object-cover" />
            ) : row.customer_name ? (
              <span className="text-lg">{row.customer_name.charAt(0)}</span>
            ) : (
              <span className="text-lg">{getIcon(activeTab)}</span>
            )}
          </div>
          <div>
            <p className="font-medium text-text-h">{row.title || row.customer_name || row.section_key || `#${row.id}`}</p>
            {(row.subtitle || row.location || row.section_key || (activeTab === 'navigationItems' && row.link)) && (
              <p className="text-sm text-text truncate max-w-xs">{activeTab === 'navigationItems' ? row.link : (row.subtitle || row.location || row.section_key)}</p>
            )}
          </div>
        </div>
      )
    },
    ...(activeTab === 'testimonials' ? [{
      id: 'rating',
      header: 'Rating',
      accessor: (row) => row.rating,
      cell: (row) => (
        <div className="flex text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={i < row.rating ? 'fill-current' : 'opacity-30'} />
          ))}
        </div>
      )
    }] : []),
    ...(activeTab === 'navigationItems' ? [{
      id: 'menu_section',
      header: 'Mega Menu',
      accessor: (row) => row.menu_section_key || '—',
      cell: (row) => (
        <span className="text-text text-sm">{row.menu_section_key || '—'}</span>
      )
    }] : []),
    ...(activeTab === 'megaMenu' ? [{
      id: 'links_count',
      header: 'Links',
      accessor: (row) => row.links?.length || 0,
      cell: (row) => (
        <span className="text-text text-sm">{row.links?.length || 0} links</span>
      )
    }, {
      id: 'images_count',
      header: 'Images',
      accessor: (row) => row.images?.length || 0,
      cell: (row) => (
        <span className="text-text text-sm">{row.images?.length || 0} images</span>
      )
    }] : []),
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => row.enabled,
      cell: (row) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.enabled ? 'bg-green-100/50 text-green-600' : 'bg-red-100/50 text-red-600'
        }`}>
          {row.enabled ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button onClick={() => handleEdit(row)} className="p-2 text-text hover:text-deep-olive hover:bg-deep-olive/10 rounded-lg transition-colors" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => toggleEnabled(row)} className="p-2 text-text hover:text-green-600 hover:bg-green-100/50 rounded-lg transition-colors" title="Toggle Status">
            {row.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          </button>
          <button onClick={() => handleDelete(row)} className="p-2 text-text hover:text-red-600 hover:bg-red-100/50 rounded-lg transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  const getIconComponent = (key) => {
    const icons = {
      heroBanners: Image,
      featuredCollections: Star,
      shopOccasions: ShoppingBag,
      brandStory: Layout,
      bestsellers: Star,
      newArrivals: Image,
      testimonials: Star,
      instagram: Instagram,
      megaMenu: Menu,
      navigationItems: Link
    }
    return icons[key] || FileText
  }

  const getIcon = (key, className = "w-5 h-5") => {
    const IconComponent = getIconComponent(key)
    return <IconComponent className={className} />
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="CMS Pages" description="Manage all your website content from one place." />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-deep-olive" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="CMS Pages"
        description="Manage all sections of your customer-facing website — organized by page."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg space-y-6 lg:sticky lg:top-8">
          {PAGE_GROUPS.map(group => (
            <div key={group.label} className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-text-muted font-bold px-1">{group.label}</h3>
              <div className="flex flex-col gap-1.5">
                {group.tabs.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer flex items-center gap-3 text-sm justify-start ${
                        isActive
                          ? 'bg-gradient-to-r from-deep-olive to-green-700 text-white shadow-md'
                          : 'bg-transparent text-text hover:bg-gray-100/70 dark:hover:bg-white/5'
                      }`}
                      title={tab.desc}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Tab Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Header & Controls Card */}
          <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-text-h flex items-center gap-2">
                <span>{getIcon(activeTab)}</span>
                <span>{ALL_TABS.find(t => t.key === activeTab)?.label}</span>
              </h2>
              <p className="text-xs text-text-muted mt-1">{ALL_TABS.find(t => t.key === activeTab)?.desc}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 md:flex-initial md:justify-end">
              <SearchBar
                placeholder={`Search ${activeTab === 'testimonials' ? 'customers' : 'titles'}...`}
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-full sm:max-w-xs"
              />
              {['featuredCollections', 'bestsellers', 'newArrivals'].includes(activeTab) && currentItems.length >= 4 ? (
                <span className="text-xs text-text-muted italic px-3 py-2 bg-gray-100 dark:bg-white/5 rounded-xl font-medium">Max 4 items reached</span>
              ) : (
                <button
                  onClick={handleCreate}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add {(ALL_TABS.find(t => t.key === activeTab)?.label || '').replace(/s$/, '') || 'Item'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Section Headers form (if bestseller) */}
          {activeTab === 'bestsellers' && (
            <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-semibold text-text-h mb-4">Bestsellers Section Header</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-h mb-2">Header Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 text-sm"
                    placeholder="e.g. Bestsellers"
                    value={bestsellersHeader.title}
                    onChange={e => setBestsellersHeader(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-h mb-2">Header Description / Subtitle</label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 text-sm resize-none"
                    placeholder="e.g. Discover our most celebrated sarees..."
                    value={bestsellersHeader.subtitle}
                    onChange={e => setBestsellersHeader(prev => ({ ...prev, subtitle: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSaveHeader}
                  className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium text-xs cursor-pointer flex items-center gap-1.5"
                >
                  Save Header Details
                </button>
              </div>
            </div>
          )}

          {/* Section Headers form (if new arrivals) */}
          {activeTab === 'newArrivals' && (
            <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-semibold text-text-h mb-4">New Arrivals Section Header</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-h mb-2">Badge Label</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 text-sm"
                    placeholder="e.g. LATEST COLLECTION"
                    value={newArrivalsHeader.badge}
                    onChange={e => setNewArrivalsHeader(prev => ({ ...prev, badge: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-h mb-2">Header Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 text-sm"
                    placeholder="e.g. New Arrivals"
                    value={newArrivalsHeader.title}
                    onChange={e => setNewArrivalsHeader(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-h mb-2">Header Description / Subtitle</label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 text-sm resize-none"
                    placeholder="e.g. Discover the newest additions..."
                    value={newArrivalsHeader.subtitle}
                    onChange={e => setNewArrivalsHeader(prev => ({ ...prev, subtitle: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSaveNewArrivalsHeader}
                  className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium text-xs cursor-pointer flex items-center gap-1.5"
                >
                  Save Header Details
                </button>
              </div>
            </div>
          )}

          {/* DataTable / EmptyState Card */}
          <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
            {filteredItems.length > 0 ? (
              <DataTable columns={columns} data={filteredItems} />
            ) : (
              <EmptyState
                title={`No ${activeTab.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()} found`}
                description="Add your first item to get started."
                icon={getIconComponent(activeTab)}
                action={
                  <button onClick={handleCreate} className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium cursor-pointer">
                    Add First
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>

        <SlideOverForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={selectedSection ? `Edit ${(ALL_TABS.find(t => t.key === activeTab)?.label || '').replace(/s$/, '')}` : `Add New ${(ALL_TABS.find(t => t.key === activeTab)?.label || '').replace(/s$/, '')}`}
          subtitle={ALL_TABS.find(t => t.key === activeTab)?.desc || ''}
          size={activeTab === 'megaMenu' ? 'lg' : 'md'}
          footer={
            <>
              <button type="button" onClick={() => setIsFormOpen(false)}
                className="px-6 py-2.5 text-xs text-text hover:text-text-h border border-border/60 rounded-xl transition-colors font-semibold cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-deep-olive to-green-700 hover:from-green-700 hover:to-deep-olive text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{selectedSection ? 'Update' : 'Create'}</span>
              </button>
            </>
          }
        >
          <div className="space-y-6">

          {activeTab === 'testimonials' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-h mb-2">Customer Name <span className="text-red-500">*</span></label>
                  <input type="text" className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${formErrors.customer_name ? 'border-red-500' : 'border-border/60'}`}
                    placeholder="e.g. Priya Raman" value={formData.customer_name || ''} onChange={e => handleFormChange('customer_name', e.target.value)} />
                  {formErrors.customer_name && <p className="text-xs text-red-500 mt-1">{formErrors.customer_name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-h mb-2">Location</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl"
                    placeholder="e.g. Chennai" value={formData.location || ''} onChange={e => handleFormChange('location', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Rating</label>
                <select className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl"
                  value={formData.rating ?? 5} onChange={e => handleFormChange('rating', Number(e.target.value))}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Review Message <span className="text-red-500">*</span></label>
                <textarea rows={4} className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl resize-none ${formErrors.message ? 'border-red-500' : 'border-border/60'}`}
                  placeholder="Customer testimonial..." value={formData.message || ''} onChange={e => handleFormChange('message', e.target.value)} />
                {formErrors.message && <p className="text-xs text-red-500 mt-1">{formErrors.message}</p>}
              </div>
            </>
          ) : activeTab === 'instagram' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Instagram Image <span className="text-red-500">*</span></label>
                <ImageUploader images={formData.image ? [formData.image] : []} onChange={imgs => handleFormChange('image', imgs[0] || '')} multiple={false} />
                {formErrors.image && <p className="text-xs text-red-500 mt-1">{formErrors.image}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Link URL</label>
                <input type="text" className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl"
                  placeholder="https://instagram.com/chakrika" value={formData.link || ''} onChange={e => handleFormChange('link', e.target.value)} />
              </div>
            </>
          ) : activeTab === 'navigationItems' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Label <span className="text-red-500">*</span></label>
                <input type="text" className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl ${formErrors.title ? 'border-red-500' : 'border-border/60'}`}
                  placeholder="e.g. New Arrivals" value={formData.title || ''} onChange={e => handleFormChange('title', e.target.value)} />
                {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Link URL</label>
                <input type="text" className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl"
                  placeholder="/collections?category=new-arrivals" value={formData.link || ''} onChange={e => handleFormChange('link', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Mega Menu Section (optional)</label>
                <select className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl"
                  value={formData.menu_section_key || ''} onChange={e => handleFormChange('menu_section_key', e.target.value)}>
                  <option value="">— No dropdown —</option>
                  {(sections.megaMenu || []).map(m => (
                    <option key={m.title} value={m.title}>{m.title}</option>
                  ))}
                </select>
                <p className="text-[10px] text-text-muted mt-1">Links to a Mega Menu section for dropdown content</p>
              </div>
            </>
          ) : activeTab === 'megaMenu' ? (
            <MenuSectionForm
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              selectedSection={selectedSection}
              handleFormChange={handleFormChange}
            />
          ) : activeTab === 'featuredCollections' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Select Collection</label>
                <select className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl"
                  value={formData.collection_id || ''} onChange={e => {
                    const colId = e.target.value;
                    handleFormChange('collection_id', colId);
                    if (colId) {
                      const selectedCol = (collectionsList || []).find(c => String(c.id) === String(colId));
                      if (selectedCol) {
                        if (!formData.title) handleFormChange('title', selectedCol.name || '');
                        if (!formData.subtitle) handleFormChange('subtitle', selectedCol.description || '');
                        if (!formData.image) handleFormChange('image', selectedCol.thumbnailImage || selectedCol.thumbnail_image || selectedCol.bannerImage || selectedCol.banner_image || '');
                        if (!formData.link) handleFormChange('link', `/collections?collection_id=${colId}`);
                      }
                    }
                  }}>
                  <option value="">— Select a collection (optional) —</option>
                  {(collectionsList || []).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Title <span className="text-red-500">*</span></label>
                <input type="text" className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl ${formErrors.title ? 'border-red-500' : 'border-border/60'}`}
                  placeholder="Featured title" value={formData.title || ''} onChange={e => handleFormChange('title', e.target.value)} />
                {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Tagline (Subtitle)</label>
                <textarea rows={2} className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl resize-none"
                  placeholder="Tagline or short description" value={formData.subtitle || ''} onChange={e => handleFormChange('subtitle', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Image Asset</label>
                <ImageUploader images={formData.image ? [formData.image] : []} onChange={imgs => handleFormChange('image', imgs[0] || '')} multiple={false} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Navigation Link</label>
                <input type="text" className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl"
                  placeholder="/collections?collection_id=..." value={formData.link || ''} onChange={e => handleFormChange('link', e.target.value)} />
              </div>
            </>
          ) : ['bestsellers', 'newArrivals'].includes(activeTab) ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Product Name <span className="text-red-500">*</span></label>
                <input type="text" className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl ${formErrors.title ? 'border-red-500' : 'border-border/60'}`}
                  placeholder="e.g. Royal Plum Kanjivaram" value={formData.title || ''} onChange={e => handleFormChange('title', e.target.value)} />
                {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Category Label</label>
                <input type="text" className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl"
                  placeholder="e.g. Pure Silk, Cotton Sarees" value={formData.subtitle || ''} onChange={e => handleFormChange('subtitle', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Price (₹) <span className="text-red-500">*</span></label>
                <input type="number" className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl ${formErrors.ctaText ? 'border-red-500' : 'border-border/60'}`}
                  placeholder="e.g. 24500" value={formData.ctaText || ''} onChange={e => handleFormChange('ctaText', e.target.value)} />
                {formErrors.ctaText && <p className="text-xs text-red-500 mt-1">{formErrors.ctaText}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Product Image <span className="text-red-500">*</span></label>
                <ImageUploader images={formData.image ? [formData.image] : []} onChange={imgs => handleFormChange('image', imgs[0] || '')} multiple={false} />
                {formErrors.image && <p className="text-xs text-red-500 mt-1">{formErrors.image}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Product Link URL</label>
                <input type="text" className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl"
                  placeholder="/product/royal-plum-kanjivaram" value={formData.link || ''} onChange={e => handleFormChange('link', e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Title <span className="text-red-500">*</span></label>
                <input type="text" className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl ${formErrors.title ? 'border-red-500' : 'border-border/60'}`}
                  placeholder="Section title" value={formData.title || ''} onChange={e => handleFormChange('title', e.target.value)} />
                {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Subtitle</label>
                <textarea rows={2} className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl resize-none"
                  placeholder="Subtitle or tagline" value={formData.subtitle || ''} onChange={e => handleFormChange('subtitle', e.target.value)} />
              </div>
              {['brandStory'].includes(activeTab) && (
                <div>
                  <label className="block text-xs font-semibold text-text-h mb-2">Description</label>
                  <textarea rows={4} className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl resize-none"
                    placeholder="Body text..." value={formData.description || ''} onChange={e => handleFormChange('description', e.target.value)} />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Image Asset</label>
                <ImageUploader images={formData.image ? [formData.image] : []} onChange={imgs => handleFormChange('image', imgs[0] || '')} multiple={false} />
                {formErrors.image && <p className="text-xs text-red-500 mt-1">{formErrors.image}</p>}
              </div>

              {activeTab === 'shopOccasions' && (
                <div>
                  <label className="block text-xs font-semibold text-text-h mb-2">Link URL</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl"
                    placeholder="/collections" value={formData.link || ''} onChange={e => handleFormChange('link', e.target.value)} />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-h mb-2">Status</label>
            <select className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl"
              value={String(formData.enabled)} onChange={e => handleFormChange('enabled', e.target.value === 'true')}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

        </div>
      </SlideOverForm>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Item"
        description={`Are you sure you want to delete "${selectedSection?.title || selectedSection?.customer_name || selectedSection?.section_key || selectedSection?.id}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

const MenuSectionForm = ({ formData, setFormData, formErrors, selectedSection, handleFormChange }) => {
  const [newLink, setNewLink] = useState({ label: '', path: '' })
  const [newImageItem, setNewImageItem] = useState({ title: '', image: '', path: '' })

  const addLink = () => {
    if (!newLink.label?.trim()) { toast.error('Link label is required'); return }
    if (!newLink.path?.trim()) { toast.error('Link path is required'); return }
    setFormData(prev => ({ ...prev, links: [...prev.links, { ...newLink }] }))
    setNewLink({ label: '', path: '' })
  }

  const removeLink = (index) => {
    setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }))
  }

  const addImageItem = () => {
    if (!newImageItem.title?.trim()) { toast.error('Image title is required'); return }
    if (!newImageItem.image) { toast.error('Image is required'); return }
    setFormData(prev => ({ ...prev, images: [...prev.images, { ...newImageItem }] }))
    setNewImageItem({ title: '', image: '', path: '' })
  }

  const removeImageItem = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-text-h mb-2">Section Title <span className="text-red-500">*</span></label>
        <input type="text" className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl ${formErrors.title ? 'border-red-500' : 'border-border/60'}`}
          placeholder="e.g. Silk Sarees" value={formData.title || ''} onChange={e => handleFormChange('title', e.target.value)} />
        {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
      </div>

      <div className="border border-border/30 rounded-xl p-4 space-y-4 bg-gray-50/30 dark:bg-white/5">
        <h4 className="text-xs font-bold text-text-h flex items-center gap-2">
          <Link className="w-3.5 h-3.5" />
          Navigation Links
        </h4>

        {formData.links.length > 0 && (
          <div className="space-y-2">
            {formData.links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white dark:bg-[#1a202c] border border-border/40 rounded-lg px-3 py-2">
                <GripVertical className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                <span className="text-xs font-medium text-text-h flex-1 truncate">{link.label}</span>
                <span className="text-[10px] text-text-muted font-mono truncate max-w-[120px]">{link.path}</span>
                <button onClick={() => removeLink(idx)} className="p-1 text-red-400 hover:text-red-600 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
          <div>
            <label className="block text-[10px] text-text mb-1">Label</label>
            <input type="text" className="w-full px-3 py-2 bg-white dark:bg-[#1a202c] border border-border/60 rounded-lg text-xs"
              placeholder="Collection Name" value={newLink.label || ''} onChange={e => setNewLink(prev => ({ ...prev, label: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] text-text mb-1">Path</label>
            <input type="text" className="w-full px-3 py-2 bg-white dark:bg-[#1a202c] border border-border/60 rounded-lg text-xs"
              placeholder="/product/silk-1" value={newLink.path || ''} onChange={e => setNewLink(prev => ({ ...prev, path: e.target.value }))} />
          </div>
          <button onClick={addLink} className="px-3 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg text-xs font-bold hover:opacity-90">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="border border-border/30 rounded-xl p-4 space-y-4 bg-gray-50/30 dark:bg-white/5">
        <h4 className="text-xs font-bold text-text-h flex items-center gap-2">
          <Image className="w-3.5 h-3.5" />
          Menu Images (4 images per section)
        </h4>

        {formData.images.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative group">
                <div className="aspect-[3/4] bg-white dark:bg-[#1a202c] border border-border/40 rounded-lg overflow-hidden">
                  <img src={img.image} alt={img.title} className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-text-h font-medium mt-1 truncate">{img.title}</p>
                <button onClick={() => removeImageItem(idx)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 border-t border-border/20 pt-3">
          <p className="text-[10px] text-text-muted font-medium">Add New Image Item</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-text mb-1">Title</label>
              <input type="text" className="w-full px-3 py-2 bg-white dark:bg-[#1a202c] border border-border/60 rounded-lg text-xs"
                placeholder="Emerald Silk" value={newImageItem.title || ''} onChange={e => setNewImageItem(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[10px] text-text mb-1">Link Path</label>
              <input type="text" className="w-full px-3 py-2 bg-white dark:bg-[#1a202c] border border-border/60 rounded-lg text-xs"
                placeholder="/product/silk-2" value={newImageItem.path || ''} onChange={e => setNewImageItem(prev => ({ ...prev, path: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-text mb-1">Image</label>
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <ImageUploader
                  images={newImageItem.image ? [newImageItem.image] : []}
                  onChange={(imgs) => setNewImageItem(prev => ({ ...prev, image: imgs[0] || '' }))}
                  multiple={false}
                />
              </div>
              <button onClick={addImageItem}
                className="px-3 py-2 mt-6 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CMSPage
