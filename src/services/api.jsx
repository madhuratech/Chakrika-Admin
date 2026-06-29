import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

API.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token')
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`
  }
  return config
})

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_user')
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    const message = err.response?.data?.message || err.message || 'Something went wrong'
    return Promise.reject({ response: { data: { message } } })
  }
)

const ok = (data, message = 'Success') => ({ success: true, message, data })

// Map admin endpoints: /customers -> /admin/customers, /orders -> /admin/orders
const adminEndpoint = (endpoint) => {
  if (endpoint.startsWith('/customers') || endpoint.startsWith('/admin/customers')) {
    return '/admin/customers' + endpoint.replace(/^\/(admin\/)?customers/, '')
  }
  if (endpoint.startsWith('/orders') || endpoint.startsWith('/admin/orders')) {
    return '/admin/orders' + endpoint.replace(/^\/(admin\/)?orders/, '')
  }
  if (endpoint.startsWith('/admin/auth/')) {
    return endpoint
  }
  return endpoint
}

export const apiService = {
  async get(endpoint) {
    if (endpoint === '/dashboard') {
      const res = await API.get('/admin/dashboard')
      return ok(res.data?.data || res.data)
    }
    if (endpoint.startsWith('/dashboard/')) {
      let url = '/admin/dashboard' + endpoint.slice('/dashboard'.length)
      let params = {}
      if (endpoint.includes('?')) {
        const parts = endpoint.split('?')
        url = '/admin/dashboard' + parts[0].slice('/dashboard'.length)
        params = Object.fromEntries(new URLSearchParams(parts[1]))
      }
      const res = await API.get(url, { params })
      return ok(res.data?.data || res.data || [])
    }
    const ep = adminEndpoint(endpoint)
    let url = ep
    let params = {}
    if (endpoint.includes('?')) {
      const parts = endpoint.split('?')
      url = adminEndpoint(parts[0])
      params = Object.fromEntries(new URLSearchParams(parts[1]))
    }
    const res = await API.get(url, { params })
    return ok(res.data?.data || res.data || [])
  },

  async post(endpoint, payload) {
    const ep = adminEndpoint(endpoint)
    const res = await API.post(ep, payload)
    return ok(res.data?.data || res.data, 'Created successfully')
  },

  async put(endpoint, payload) {
    const ep = adminEndpoint(endpoint)
    const res = await API.put(ep, payload)
    return ok(res.data?.data || res.data, 'Updated successfully')
  },

  async delete(endpoint) {
    const ep = adminEndpoint(endpoint)
    await API.delete(ep)
    return ok(null, 'Deleted successfully')
  },

  async patch(endpoint, payload) {
    const ep = adminEndpoint(endpoint)
    // Map toggle-status and order status endpoints
    if (ep.includes('/toggle-status')) {
      await API.patch(ep, payload || {})
      return ok(null, 'Status updated')
    }
    if (ep.includes('/status')) {
      const { status, ...rest } = payload || {}
      await API.put(ep, { order_status: status || rest.order_status, ...rest })
      return ok(null, 'Status updated')
    }
    const res = await API.patch(ep, payload || {})
    return ok(res.data?.data || res.data, 'Status updated')
  },
}

export default apiService
