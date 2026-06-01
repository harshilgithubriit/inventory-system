import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const cards = [
  { key: 'total_products', label: 'Total Products', color: 'bg-blue-500', link: '/products' },
  { key: 'total_customers', label: 'Total Customers', color: 'bg-green-500', link: '/customers' },
  { key: 'total_orders', label: 'Total Orders', color: 'bg-purple-500', link: '/orders' },
  { key: 'low_stock_products', label: 'Low Stock Products', color: 'bg-red-500', link: '/products' },
]

export default function Dashboard() {
  const { dashboard, loading, error, fetchDashboard } = useApp()

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Link
            key={card.key}
            to={card.link}
            className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white text-xl font-bold">
                    {dashboard ? dashboard[card.key] : 0}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboard ? dashboard[card.key] : '-'}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {dashboard && dashboard.low_stock_products > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Inventory Alert</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {dashboard.low_stock_products} product(s) have low stock (≤ 5 units).{' '}
                <Link to="/products" className="font-medium underline hover:text-yellow-600">
                  View products
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
