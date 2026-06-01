import { createContext, useContext, useReducer, useCallback } from 'react'
import api from '../services/api'

const AppContext = createContext()

const initialState = {
  products: [],
  customers: [],
  orders: [],
  dashboard: null,
  loading: false,
  error: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null }
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false }
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload, loading: false }
    case 'SET_ORDERS':
      return { ...state, orders: action.payload, loading: false }
    case 'SET_DASHBOARD':
      return { ...state, dashboard: action.payload, loading: false }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetchProducts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' })
    try {
      const res = await api.get('/products')
      dispatch({ type: 'SET_PRODUCTS', payload: res.data })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.detail || 'Failed to fetch products' })
    }
  }, [])

  const fetchCustomers = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' })
    try {
      const res = await api.get('/customers')
      dispatch({ type: 'SET_CUSTOMERS', payload: res.data })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.detail || 'Failed to fetch customers' })
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' })
    try {
      const res = await api.get('/orders')
      dispatch({ type: 'SET_ORDERS', payload: res.data })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.detail || 'Failed to fetch orders' })
    }
  }, [])

  const fetchDashboard = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' })
    try {
      const res = await api.get('/dashboard')
      dispatch({ type: 'SET_DASHBOARD', payload: res.data })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.detail || 'Failed to fetch dashboard' })
    }
  }, [])

  const createProduct = useCallback(async (product) => {
    dispatch({ type: 'SET_LOADING' })
    try {
      const res = await api.post('/products', product)
      await fetchProducts()
      return res.data
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.detail || 'Failed to create product' })
      throw err
    }
  }, [fetchProducts])

  const updateProduct = useCallback(async (id, product) => {
    dispatch({ type: 'SET_LOADING' })
    try {
      const res = await api.put(`/products/${id}`, product)
      await fetchProducts()
      return res.data
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.detail || 'Failed to update product' })
      throw err
    }
  }, [fetchProducts])

  const deleteProduct = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING' })
    try {
      await api.delete(`/products/${id}`)
      await fetchProducts()
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.detail || 'Failed to delete product' })
      throw err
    }
  }, [fetchProducts])

  const createCustomer = useCallback(async (customer) => {
    dispatch({ type: 'SET_LOADING' })
    try {
      const res = await api.post('/customers', customer)
      await fetchCustomers()
      return res.data
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.detail || 'Failed to create customer' })
      throw err
    }
  }, [fetchCustomers])

  const deleteCustomer = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING' })
    try {
      await api.delete(`/customers/${id}`)
      await fetchCustomers()
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.detail || 'Failed to delete customer' })
      throw err
    }
  }, [fetchCustomers])

  const createOrder = useCallback(async (order) => {
    dispatch({ type: 'SET_LOADING' })
    try {
      const res = await api.post('/orders', order)
      await fetchOrders()
      return res.data
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.detail || 'Failed to create order' })
      throw err
    }
  }, [fetchOrders])

  const deleteOrder = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING' })
    try {
      await api.delete(`/orders/${id}`)
      await fetchOrders()
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.detail || 'Failed to cancel order' })
      throw err
    }
  }, [fetchOrders])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const value = {
    ...state,
    fetchProducts,
    fetchCustomers,
    fetchOrders,
    fetchDashboard,
    createProduct,
    updateProduct,
    deleteProduct,
    createCustomer,
    deleteCustomer,
    createOrder,
    deleteOrder,
    clearError,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
