/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatsCard } from '../../components/ui/StatsCard'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { SlideOverForm } from '../../components/ui/SlideOverForm'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { SearchBar } from '../../components/ui/SearchBar'
import { DataTable } from '../../components/tables/DataTable'
import ImageUploader from '../../components/ui/ImageUploader'
import apiService from '../../services/api'
import toast from 'react-hot-toast'
import { 
  Package, Plus, Edit, Trash2, ToggleLeft, ToggleRight, 
  Copy, Eye, Sparkles 
} from 'lucide-react'

const mapProductFromApi = (product) => ({
  ...product,
  productCode: product.product_code || '',
  shortDescription: product.short_description || product.description || '',
  mrp: product.price || 0,
  sellingPrice: product.offer_price || product.price || 0,
  mainImage: product.thumbnail || '',
  images: product.images ? product.images.map(i => i.image || i.image_path || (typeof i === 'string' ? i : '')) : [],
  category_id: product.category_id || '',
  category: product.category_name || '',
  collection_id: product.collection_id || '',
  collection: product.collection_name || '',
  featured: !!product.featured,
  best_seller: !!product.bestseller || !!product.best_seller,
  new_arrival: !!product.new_arrival,
  discount: product.discount_percentage || product.discount || (product.price && product.offer_price && product.price > product.offer_price ? Math.round(((product.price - product.offer_price) / product.price) * 100) : 0),
  fabric: product.fabric || '',
  color: product.color || '',
  stock: product.stock !== undefined ? product.stock : 0,
  price_with_blouse: product.price_with_blouse || '',
  offer_price_with_blouse: product.offer_price_with_blouse || '',
  materials: product.materials || '',
  size_fit: product.size_fit || '',
  shipping_returns: product.shipping_returns || '',
  zari: product.zari || '',
  care: product.care || '',
  origin: product.origin || '',
  variants: product.variants ? product.variants.map(v => ({
    name: v.variant_name || v.name || '',
    sku: v.sku || '',
    stock: v.stock_quantity || v.stock || 0,
  })) : [],
})

const mapProductForApi = (data) => ({
  name: data.name,
  slug: data.slug || '',
  product_code: data.productCode,
  category_id: data.category_id ? Number(data.category_id) : null,
  collection_id: data.collection_id ? Number(data.collection_id) : null,
  short_description: data.shortDescription,
  description: data.description,
  price: Number(data.mrp),
  offer_price: Number(data.sellingPrice),
  thumbnail: data.mainImage || '',
  discount: Number(data.discount || 0),
  featured: data.featured ? 1 : 0,
  bestseller: data.best_seller ? 1 : 0,
  new_arrival: data.new_arrival ? 1 : 0,
  status: data.status,
  stock: Number(data.stock || 0),
  images: (data.images || []).filter(img => typeof img === 'string' && img.length > 0),
  fabric: data.fabric || '',
  color: data.color || '',
  price_with_blouse: data.price_with_blouse ? Number(data.price_with_blouse) : null,
  offer_price_with_blouse: data.offer_price_with_blouse ? Number(data.offer_price_with_blouse) : null,
  materials: data.materials || '',
  size_fit: data.size_fit || '',
  shipping_returns: data.shipping_returns || '',
  zari: data.zari || '',
  care: data.care || '',
  origin: data.origin || '',
  variants: data.variants ? data.variants.map(v => ({
    name: v.name,
    sku: v.sku,
    stockQuantity: Number(v.stock || v.stockQuantity || 0)
  })) : [],
})

const initialFormData = {
  name: '',
  slug: '',
  productCode: '',
  category_id: '',
  collection_id: '',
  shortDescription: '',
  description: '',
  mrp: '',
  sellingPrice: '',
  discount: 0,
  images: [],
  mainImage: '',
  variants: [],
  stock: 0,
  featured: false,
  best_seller: false,
  new_arrival: false,
  status: 'active',
  metaTitle: '',
  metaDescription: '',
  fabric: '',
  color: '',
  price_with_blouse: '',
  offer_price_with_blouse: '',
  materials: '',
  size_fit: '',
  shipping_returns: '',
  zari: '',
  care: '',
  origin: '',
}

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [collectionFilter, setCollectionFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')

  const [formData, setFormData] = useState(initialFormData)
  const [formErrors, setFormErrors] = useState({})

  // Variant row state
  const [newVariant, setNewVariant] = useState({ name: '', sku: '', stock: '' })

  const fetchProducts = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const result = await apiService.get('/products')
      if (result.success) {
        setProducts(result.data.map(mapProductFromApi))
      }
    } catch {
      toast.error('Failed to fetch products')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const result = await apiService.get('/categories')
      setCategories(result.data || result)
    } catch {
      console.error('Failed to fetch categories')
    }
  }

  const fetchCollections = async () => {
    try {
      const result = await apiService.get('/collections')
      setCollections(result.data || result)
    } catch {
      console.error('Failed to fetch collections')
    }
  }

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchProducts(false),
        fetchCategories(),
        fetchCollections()
      ])
    } catch {
      toast.error('Failed to load initial page data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  // Auto slug generation
  const handleNameChange = (e) => {
    const nameVal = e.target.value
    const slugVal = nameVal.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    
    setFormData(prev => ({
      ...prev,
      name: nameVal,
      slug: slugVal,
      metaTitle: `${nameVal} | Chakrika Luxury Sarees`
    }))
  }

  // Pricing calculations
  const handlePriceChange = (field, value) => {
    setFormData(prev => {
      const numericVal = value === '' ? '' : Number(value)
      const updated = { ...prev, [field]: numericVal }

      const mrp = Number(updated.mrp || 0)
      let sellingPrice = Number(updated.sellingPrice || 0)
      let discount = Number(updated.discount || 0)

      if (field === 'mrp' || field === 'sellingPrice') {
        if (mrp > 0 && sellingPrice > 0) {
          discount = Math.round(((mrp - sellingPrice) / mrp) * 100)
        } else {
          discount = 0
        }
      } else if (field === 'discount') {
        if (mrp > 0) {
          sellingPrice = Math.round(mrp - (mrp * (discount / 100)))
        }
      }

      return {
        ...updated,
        sellingPrice: field === 'sellingPrice' ? value : sellingPrice,
        discount: field === 'discount' ? value : discount
      }
    })
  }

  // Validate form
  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Product name is required'
    if (!formData.productCode.trim()) errors.productCode = 'Product code is required'
    if (!formData.category_id) errors.category_id = 'Category is required'
    if (!formData.mrp || Number(formData.mrp) <= 0) errors.mrp = 'Valid MRP is required'
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) errors.sellingPrice = 'Valid selling price is required'
    if (Number(formData.sellingPrice) > Number(formData.mrp)) errors.sellingPrice = 'Selling price cannot exceed MRP'
    if (!formData.status) errors.status = 'Status is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Combinable filters logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.productCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.shortDescription || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || product.status === statusFilter
    
    // category_id / collection_id filters
    const matchesCategory = categoryFilter === 'all' || String(product.category_id) === String(categoryFilter)
    const matchesCollection = collectionFilter === 'all' || String(product.collection_id) === String(collectionFilter)

    // Price range filters
    let matchesPrice = true
    if (priceFilter !== 'all') {
      const price = product.sellingPrice
      if (priceFilter === 'under-10k') matchesPrice = price < 10000
      else if (priceFilter === '10k-25k') matchesPrice = price >= 10000 && price <= 25000
      else if (priceFilter === '25k-50k') matchesPrice = price > 25000 && price <= 50000
      else if (priceFilter === 'above-50k') matchesPrice = price > 50000
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesCollection && matchesPrice
  })

  const handleCreate = () => {
    // Generate next product code in format CK-001, CK-002, etc.
    let nextCode = 'CK-001';
    if (products && products.length > 0) {
      const codes = products
        .map(p => p.productCode || p.product_code || '')
        .filter(code => /^CK-\d+$/.test(code));
      if (codes.length > 0) {
        const numbers = codes.map(code => parseInt(code.split('-')[1], 10));
        const maxNumber = Math.max(...numbers);
        const nextNumber = maxNumber + 1;
        nextCode = `CK-${String(nextNumber).padStart(3, '0')}`;
      }
    }

    setSelectedProduct(null)
    setFormData({
      ...initialFormData,
      productCode: nextCode,
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      productCode: product.productCode || product.product_code || '',
      category_id: product.category_id || '',
      collection_id: product.collection_id || '',
      shortDescription: product.shortDescription || product.short_description || '',
      description: product.description || '',
      mrp: product.mrp || product.price || '',
      sellingPrice: product.sellingPrice || product.selling_price || product.offer_price || '',
      discount: product.discount || product.discount_percentage || 0,
      images: product.images || [],
      mainImage: product.mainImage || product.main_image || product.thumbnail || '',
      variants: product.variants || [],
      featured: !!product.featured,
      best_seller: !!product.best_seller,
      new_arrival: !!product.new_arrival,
      status: product.status || 'active',
      metaTitle: product.meta_title || `${product.name} | Chakrika Luxury Sarees`,
      metaDescription: product.meta_description || product.shortDescription || '',
      fabric: product.fabric || '',
      color: product.color || '',
      price_with_blouse: product.price_with_blouse || '',
      offer_price_with_blouse: product.offer_price_with_blouse || '',
      materials: product.materials || '',
      size_fit: product.size_fit || '',
      shipping_returns: product.shipping_returns || '',
      zari: product.zari || '',
      care: product.care || '',
      origin: product.origin || '',
      stock: product.stock || 0,
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleView = (product) => {
    setSelectedProduct(product)
    setIsViewOpen(true)
  }

  const handleDuplicate = async (product) => {
    try {
      const payload = {
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Date.now().toString().slice(-4)}`,
        productCode: `${product.productCode}-COPY`,
        category_id: product.category_id,
        collection_id: product.collection_id,
        short_description: product.shortDescription,
        description: product.description,
        mrp: product.mrp,
        selling_price: product.sellingPrice,
        discount: product.discount,
        featured: product.featured ? 1 : 0,
        best_seller: product.best_seller ? 1 : 0,
        new_arrival: product.new_arrival ? 1 : 0,
        status: 'draft',
        images: product.images,
        variants: product.variants,
      }
      await apiService.post('/products', payload)
      toast.success('Product duplicated successfully')
      fetchProducts(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to duplicate product')
    }
  }

  const handleDelete = (product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProduct) return
    try {
      await apiService.delete(`/products/${selectedProduct.id}`)
      toast.success('Product deleted successfully')
      setProducts(products.filter(p => p.id !== selectedProduct.id))
      setIsDeleteDialogOpen(false)
      setSelectedProduct(null)
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const toggleStatus = async (product) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active'
      await apiService.patch(`/products/${product.id}/toggle-status`)
      setProducts(products.map(p =>
        p.id === product.id ? { ...p, status: newStatus } : p
      ))
      toast.success(`Product status updated to ${newStatus}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please correct the validation errors in the form')
      return
    }

    try {
      const payload = mapProductForApi(formData)
      if (selectedProduct) {
        await apiService.put(`/products/${selectedProduct.id}`, payload)
        toast.success('Product updated successfully')
      } else {
        await apiService.post('/products', payload)
        toast.success('Product created successfully')
      }
      setIsFormOpen(false)
      fetchProducts(false)
    } catch (err) {
      toast.error(err.response?.data?.message || (selectedProduct ? 'Failed to update product' : 'Failed to create product'))
    }
  }

  // Variant helper functions
  const addVariantRow = (e) => {
    e.preventDefault()
    if (!newVariant.name.trim()) {
      toast.error('Variant name/option is required')
      return
    }
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { ...newVariant, stock: Number(newVariant.stock || 0) }]
    }))
    setNewVariant({ name: '', sku: '', stock: '' })
  }

  const removeVariantRow = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const getDiscountAmount = () => {
    const mrp = Number(formData.mrp || 0)
    const sellingPrice = Number(formData.sellingPrice || 0)
    return mrp > sellingPrice ? mrp - sellingPrice : 0
  }

  const columns = [
    {
      id: 'name',
      header: 'Product',
      accessor: (row) => row.name,
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100/50 dark:bg-white/5 rounded-xl overflow-hidden flex-shrink-0">
            {row.mainImage ? (
              <img src={row.mainImage} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl bg-deep-olive/10 text-deep-olive">👗</div>
            )}
          </div>
          <div>
            <p className="font-medium text-text-h hover:text-deep-olive cursor-pointer" onClick={() => handleView(row)}>{row.name}</p>
            <p className="text-xs text-text">SKU: {row.productCode}</p>
          </div>
        </div>
      )
    },
    {
      id: 'category',
      header: 'Category',
      accessor: (row) => row.category,
      cell: (row) => (
        <span className="text-text font-medium">{row.category || '—'}</span>
      )
    },

    {
      id: 'price',
      header: 'Price',
      accessor: (row) => row.sellingPrice,
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-text-h">₹{row.sellingPrice?.toLocaleString()}</p>
          {row.discount > 0 && (
            <p className="text-xs text-gray-400 line-through">₹{row.mrp?.toLocaleString()}</p>
          )}
          {row.discount > 0 && (
            <p className="text-[10px] font-bold text-green-600 dark:text-green-400">-{row.discount}% OFF</p>
          )}
        </div>
      )
    },
    {
      id: 'inventory',
      header: 'Inventory',
      cell: (row) => {
        const totalStock = row.variants?.reduce((sum, v) => sum + (v.stock || v.stock_quantity || 0), 0) || 0;
        const outOfStockCount = row.variants?.filter(v => (v.stock || v.stock_quantity || 0) === 0).length || 0;
        
        let label = 'In Stock'
        let colorClass = 'bg-green-100/50 text-green-600 dark:text-green-400'
        
        if (row.variants?.length > 0 && outOfStockCount === row.variants.length) {
          label = 'Out of Stock'
          colorClass = 'bg-red-100/50 text-red-600 dark:text-red-400'
        } else if (totalStock <= 5 && totalStock > 0) {
          label = 'Low Stock'
          colorClass = 'bg-yellow-100/50 text-yellow-600 dark:text-yellow-400'
        } else if (row.variants?.length === 0) {
          label = 'No Variants'
          colorClass = 'bg-gray-100/50 text-gray-500'
        }

        return (
          <div className="space-y-0.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${colorClass}`}>
              {label}
            </span>
            <p className="text-xs text-text">{totalStock} units ({row.variants?.length || 0} var)</p>
          </div>
        )
      }
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      cell: (row) => (
        <StatusBadge status={row.status} type="product" />
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleView(row)}
            className="p-1.5 text-text hover:text-deep-olive hover:bg-deep-olive/10 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-text hover:text-deep-olive hover:bg-deep-olive/10 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDuplicate(row)}
            className="p-1.5 text-text hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleStatus(row)}
            className="p-1.5 text-text hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Toggle Status"
          >
            {row.status === 'active' ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 text-text hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Products"
        description="Manage your luxury saree collection with detailed product information, pricing, uploader, variants, and SEO configurations."
        actions={
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Products"
          value={products.length}
          icon={<Package className="w-5 h-5" />}
          color="olive"
        />
        <StatsCard
          title="Active Products"
          value={products.filter(p => p.status === 'active').length}
          icon={<Package className="w-5 h-5" />}
          color="gold"
        />
        <StatsCard
          title="Out of Stock"
          value={products.filter(p => {
            const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || v.stock_quantity || 0), 0) || 0;
            return totalStock === 0 && (p.variants?.length || 0) > 0;
          }).length}
          icon={<Package className="w-5 h-5" />}
          color="charcoal"
        />
        <StatsCard
          title="Total Inventory Value"
          value={`₹${(products.reduce((sum, p) => {
            const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || v.stock_quantity || 0), 0) || 0;
            return sum + ((p.sellingPrice || 0) * totalStock);
          }, 0)).toLocaleString()}`}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Combinable Filters and Search */}
      <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <SearchBar
              placeholder="Search by name, SKU or code..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="w-full"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-text font-medium">Price range:</span>
            {['all', 'under-10k', '10k-25k', '25k-50k', 'above-50k'].map((opt) => (
              <button
                key={opt}
                onClick={() => setPriceFilter(opt)}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  priceFilter === opt 
                    ? 'bg-deep-olive text-white' 
                    : 'bg-gray-100/60 dark:bg-white/5 hover:bg-gray-200/50 text-text'
                }`}
              >
                {opt === 'all' ? 'All Prices' : opt.replace('-', ' to ').replace('under', 'Under').replace('above', 'Above')}
              </button>
            ))}
          </div>
          <span className="text-text-muted">Showing {filteredProducts.length} of {products.length} products</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-deep-olive"></div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredProducts}
          emptyState={
            <EmptyState
              title="No products found"
              description="Try adjusting your search query or combinable filters."
              icon="👗"
            />
          }
        />
      ) : (
        <EmptyState
          title="No products found"
          description="Try adjusting your search query or combinable filters."
          icon="👗"
          action={
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium cursor-pointer"
            >
              Add First Product
            </button>
          }
        />
      )}

      {/* Main product form Center Modal */}
      <SlideOverForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
        subtitle={selectedProduct ? 'Update your luxury product settings' : 'Configure details, pricing, variants and images'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-6 py-2.5 text-xs text-text hover:text-text-h border border-border/60 rounded-xl transition-colors font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-deep-olive to-green-700 hover:from-green-700 hover:to-deep-olive text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {selectedProduct ? 'Update Product' : 'Create Product'}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          
          {/* Basic Information */}
          <div className="bg-gray-50/50 dark:bg-white/5 p-5 rounded-2xl border border-border/30">
            <h3 className="text-xs font-bold text-text-h mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-lg bg-deep-olive/10 flex items-center justify-center text-deep-olive text-[10px] font-bold">1</span>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Product Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                    formErrors.name ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
                  }`}
                  placeholder="e.g., Kanchipuram Heritage Saree"
                  value={formData.name}
                  onChange={handleNameChange}
                />
                {formErrors.name && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Product Code (SKU Prefix) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                    formErrors.productCode ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
                  }`}
                  placeholder="e.g., KCH-001"
                  value={formData.productCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, productCode: e.target.value }))}
                />
                {formErrors.productCode && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.productCode}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Category <span className="text-red-500">*</span></label>
                <select
                  className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                    formErrors.category_id ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
                  }`}
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {formErrors.category_id && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.category_id}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Fabric</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                  placeholder="e.g., Kanchipuram Silk"
                  value={formData.fabric}
                  onChange={(e) => setFormData(prev => ({ ...prev, fabric: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Color</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                  placeholder="e.g., Mustard Yellow / Red border"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Product Quantity (Base Stock)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                  placeholder="e.g., 50"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="bg-gray-50/50 dark:bg-white/5 p-5 rounded-2xl border border-border/30">
            <h3 className="text-xs font-bold text-text-h mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-lg bg-deep-olive/10 flex items-center justify-center text-deep-olive text-[10px] font-bold">2</span>
              Descriptions
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Short Description</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                  placeholder="A one-sentence highlight of the saree"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Full Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30 resize-none"
                  placeholder="Describe material, weaves, artwork detail, and heritage details..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50/50 dark:bg-white/5 p-5 rounded-2xl border border-border/30">
            <h3 className="text-xs font-bold text-text-h mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-lg bg-deep-olive/10 flex items-center justify-center text-deep-olive text-[10px] font-bold">3</span>
              Pricing & Calculations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">MRP (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                    formErrors.mrp ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
                  }`}
                  placeholder="e.g., 45000"
                  value={formData.mrp}
                  onChange={(e) => handlePriceChange('mrp', e.target.value)}
                />
                {formErrors.mrp && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.mrp}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Selling Price (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                    formErrors.sellingPrice ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
                  }`}
                  placeholder="e.g., 38500"
                  value={formData.sellingPrice}
                  onChange={(e) => handlePriceChange('sellingPrice', e.target.value)}
                />
                {formErrors.sellingPrice && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.sellingPrice}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Discount %</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                  placeholder="15"
                  value={formData.discount}
                  onChange={(e) => handlePriceChange('discount', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/30">
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">MRP with Blouse (₹)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                  placeholder="e.g., 46500"
                  value={formData.price_with_blouse}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_with_blouse: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Selling Price with Blouse (₹)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                  placeholder="e.g., 40000"
                  value={formData.offer_price_with_blouse}
                  onChange={(e) => setFormData(prev => ({ ...prev, offer_price_with_blouse: e.target.value }))}
                />
              </div>
            </div>
            
            {/* Savings Display */}
            {formData.mrp > 0 && formData.sellingPrice > 0 && (
              <div className="mt-4 flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl text-xs">
                <span className="text-green-800 dark:text-green-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  Auto calculated savings:
                </span>
                <span className="font-bold text-green-900 dark:text-green-200 text-sm">
                  Discount Amount: ₹{getDiscountAmount().toLocaleString()} ({formData.discount}% saved)
                </span>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="bg-gray-50/50 dark:bg-white/5 p-5 rounded-2xl border border-border/30">
            <h3 className="text-xs font-bold text-text-h mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-lg bg-deep-olive/10 flex items-center justify-center text-deep-olive text-[10px] font-bold">4</span>
              Product Gallery
            </h3>
            <ImageUploader
              images={formData.images}
              onChange={(imgs) => setFormData(prev => ({ ...prev, images: imgs }))}
              mainImage={formData.mainImage}
              onMainImageChange={(img) => setFormData(prev => ({ ...prev, mainImage: img }))}
              multiple={true}
            />
          </div>

          {/* Variants */}
          <div className="bg-gray-50/50 dark:bg-white/5 p-5 rounded-2xl border border-border/30">
            <h3 className="text-xs font-bold text-text-h mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-lg bg-deep-olive/10 flex items-center justify-center text-deep-olive text-[10px] font-bold">5</span>
              Inventory Variants
            </h3>
            
            {/* Current variants list */}
            {formData.variants?.length > 0 ? (
              <div className="mb-6 border border-border/40 rounded-xl overflow-hidden bg-white dark:bg-[#1a202c]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-white/5 border-b border-border/40 text-xs font-semibold text-text-h">
                      <th className="p-3">Variant/Size</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Stock Qty</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 text-xs">
                    {formData.variants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/30 dark:hover:bg-white/5">
                        <td className="p-3 font-medium text-text-h">{v.name}</td>
                        <td className="p-3 font-mono text-text">{v.sku || 'Auto-generated'}</td>
                        <td className="p-3 text-text font-semibold">{v.stock} units</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeVariantRow(idx)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-4 border border-border/40 border-dashed rounded-xl mb-4 text-xs text-text-muted">
                No custom variants added. The product will be treated as single default item.
              </div>
            )}

            {/* Add variant inline form */}
            <div className="bg-white dark:bg-[#1a202c] p-4 rounded-xl border border-border/40">
              <p className="text-xs font-semibold text-text-h mb-3">Add Custom Variant Option</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] text-text mb-1">Option Name (e.g., Premium Box, Free Size)</label>
                  <input
                    type="text"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50/50 dark:bg-white/5 border border-border/60 rounded-lg focus:outline-none text-xs"
                    placeholder="Size / Premium Packaging"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text mb-1">SKU (Option Code)</label>
                  <input
                    type="text"
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50/50 dark:bg-white/5 border border-border/60 rounded-lg focus:outline-none text-xs"
                    placeholder="e.g. KCH-001-BOX"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newVariant.stock}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50/50 dark:bg-white/5 border border-border/60 rounded-lg focus:outline-none text-xs"
                    placeholder="10"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addVariantRow}
                className="px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Variant Row
              </button>
            </div>
          </div>

          {/* Saree Specifications & Detail Tabs */}
          <div className="bg-gray-50/50 dark:bg-white/5 p-5 rounded-2xl border border-border/30">
            <h3 className="text-xs font-bold text-text-h mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-lg bg-deep-olive/10 flex items-center justify-center text-deep-olive text-[10px] font-bold">6</span>
              Saree Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Zari Type</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                  placeholder="e.g., Pure Gold Zari"
                  value={formData.zari}
                  onChange={(e) => setFormData(prev => ({ ...prev, zari: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Weaving Origin</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                  placeholder="e.g., Kanchipuram, Tamil Nadu"
                  value={formData.origin}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Care Instructions</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                  placeholder="e.g., Dry clean only. Store in muslin cloth."
                  value={formData.care}
                  onChange={(e) => setFormData(prev => ({ ...prev, care: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Materials Tab Bullet Points (one per line)</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30 resize-none text-xs"
                  placeholder="100% natural organic pure mulberry silk fibers&#10;Premium quality silk yarns with metallic zari weaves"
                  value={formData.materials}
                  onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Size & Fit Tab Bullet Points (one per line)</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30 resize-none text-xs"
                  placeholder="Saree length: 5.5 meters, giving a royal graceful drape&#10;Blouse length: 0.8 meters (running fabric included)"
                  value={formData.size_fit}
                  onChange={(e) => setFormData(prev => ({ ...prev, size_fit: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Shipping & Returns Tab Bullet Points (one per line)</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30 resize-none text-xs"
                  placeholder="Free express shipping on all products across India&#10;Dispatched within 24-48 hours with trackable link"
                  value={formData.shipping_returns}
                  onChange={(e) => setFormData(prev => ({ ...prev, shipping_returns: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Status & Tags */}
          <div className="bg-gray-50/50 dark:bg-white/5 p-5 rounded-2xl border border-border/30">
            <h3 className="text-xs font-bold text-text-h mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-lg bg-deep-olive/10 flex items-center justify-center text-deep-olive text-[10px] font-bold">7</span>
              Status & Merchandising
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-text-h mb-2">Publishing Status <span className="text-red-500">*</span></label>
                <select
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex flex-col justify-center space-y-3 pt-2">
                <label className="flex items-center gap-3 text-xs text-text-h font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 rounded border-border text-deep-olive focus:ring-deep-olive"
                  />
                  Featured Product
                </label>
                <label className="flex items-center gap-3 text-xs text-text-h font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.best_seller}
                    onChange={(e) => setFormData(prev => ({ ...prev, best_seller: e.target.checked }))}
                    className="w-4 h-4 rounded border-border text-deep-olive focus:ring-deep-olive"
                  />
                  Best Seller Saree
                </label>
                <label className="flex items-center gap-3 text-xs text-text-h font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.new_arrival}
                    onChange={(e) => setFormData(prev => ({ ...prev, new_arrival: e.target.checked }))}
                    className="w-4 h-4 rounded border-border text-deep-olive focus:ring-deep-olive"
                  />
                  New Arrival
                </label>
              </div>
            </div>
          </div>



        </div>
      </SlideOverForm>

      {/* View product Details Modal */}
      <SlideOverForm
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Product Information"
        subtitle="Detailed specs, variants, pricing, and visual assets"
        size="md"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-border/40">
                {selectedProduct.mainImage ? (
                  <img src={selectedProduct.mainImage} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                )}
              </div>
              <div>
                <h4 className="text-base font-bold text-text-h">{selectedProduct.name}</h4>
                <p className="text-xs text-text font-mono mt-1">Code: {selectedProduct.productCode}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-[10px] text-text font-semibold">
                    Category: {selectedProduct.category || 'None'}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-[10px] text-text font-semibold">
                    Collection: {selectedProduct.collection || 'None'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border/20 pt-4">
              <div>
                <span className="text-[10px] text-text-muted font-bold block uppercase">MRP</span>
                <span className="text-sm font-semibold text-text-h">₹{selectedProduct.mrp?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold block uppercase">Selling Price</span>
                <span className="text-sm font-bold text-deep-olive">₹{selectedProduct.sellingPrice?.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-border/20 pt-4">
              <span className="text-[10px] text-text-muted font-bold block uppercase mb-2">Short Description</span>
              <p className="text-xs text-text leading-relaxed">{selectedProduct.shortDescription || 'No short description provided.'}</p>
            </div>

            {selectedProduct.description && (
              <div className="border-t border-border/20 pt-4">
                <span className="text-[10px] text-text-muted font-bold block uppercase mb-2">Full Description</span>
                <p className="text-xs text-text leading-relaxed whitespace-pre-wrap">{selectedProduct.description}</p>
              </div>
            )}

            {selectedProduct.variants?.length > 0 && (
              <div className="border-t border-border/20 pt-4">
                <span className="text-[10px] text-text-muted font-bold block uppercase mb-2">Variants Inventory</span>
                <div className="border border-border/40 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <tr className="bg-gray-50 dark:bg-white/5 text-[10px] text-text font-bold">
                      <th className="p-2">Variant Option</th>
                      <th className="p-2">SKU</th>
                      <th className="p-2">Stock</th>
                    </tr>
                    {selectedProduct.variants.map((v, i) => (
                      <tr key={i} className="border-t border-border/20">
                        <td className="p-2 font-medium text-text-h">{v.name}</td>
                        <td className="p-2 font-mono text-text">{v.sku}</td>
                        <td className="p-2 text-text font-semibold">{v.stock} units</td>
                      </tr>
                    ))}
                  </table>
                </div>
              </div>
            )}

            {selectedProduct.images?.length > 0 && (
              <div className="border-t border-border/20 pt-4">
                <span className="text-[10px] text-text-muted font-bold block uppercase mb-2">Product Gallery</span>
                <div className="grid grid-cols-4 gap-2">
                  {selectedProduct.images.map((img, idx) => (
                    <img key={idx} src={img} className="w-full h-16 object-cover rounded-lg border border-border/20" alt="Gallery item" />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-border/20">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-5 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-semibold rounded-xl"
              >
                Close View
              </button>
            </div>
          </div>
        )}
      </SlideOverForm>

      {/* Delete confirmation popup */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete the product "${selectedProduct?.name}"? All variants and images will be permanently removed.`}
        confirmText="Delete Saree"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

export default ProductsPage