import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load order'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
        <button onClick={() => navigate('/orders')} className="ml-4 underline">Back to orders</button>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => navigate('/orders')}
        className="mb-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
      >
        ← Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order #{order.id}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              order.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Customer</h3>
          <p className="text-base font-medium text-gray-900">{order.customer_name}</p>
        </div>

        <div className="px-6 py-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Order Items</h3>
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-2">Product</th>
                <th className="pb-2">Unit Price</th>
                <th className="pb-2">Quantity</th>
                <th className="pb-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-sm font-medium text-gray-900">{item.product_name}</td>
                  <td className="py-3 text-sm text-gray-500">${item.unit_price.toFixed(2)}</td>
                  <td className="py-3 text-sm text-gray-500">{item.quantity}</td>
                  <td className="py-3 text-sm text-gray-900 text-right">${item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-3 text-sm font-medium text-gray-900 text-right">Total</td>
                <td className="pt-3 text-lg font-bold text-gray-900 text-right">${order.total_amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
