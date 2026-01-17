import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Package, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrderDashboard: React.FC = () => {
  const { myOrders, user, fetchMyOrders } = useApp();
  const STATUS_FLOW = [
    'PLACED',
    'RECEIVED',
    'PREPARING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ] as const;

  useEffect(() => {
    fetchMyOrders();
    const interval = window.setInterval(() => {
      fetchMyOrders();
    }, 10000);
    return () => window.clearInterval(interval);
  }, [fetchMyOrders]);

  const userOrders = useMemo(() => {
    const email = user?.email?.toLowerCase();
    const filtered = email
      ? myOrders.filter((order) => {
          const orderEmail =
            order.email || order.deliveryDetails?.email || '';
          return orderEmail.toLowerCase() === email;
        })
      : myOrders;
    return filtered.sort((a, b) => {
      const aTime = new Date(a.date || a.createdAt || 0).getTime();
      const bTime = new Date(b.date || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [myOrders, user?.email]);

  const stats = useMemo(() => {
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const lastOrder = userOrders[0];
    return { totalOrders, totalSpent, lastOrder };
  }, [userOrders]);

  return (
    <div className="min-h-screen bg-[#fdfcfb] pt-32 pb-40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-olive-800 tracking-tighter">
              Your Orders
            </h1>
            <p className="text-gray-500 mt-3">
              Track your recent purchases and delivery details.
            </p>
          </div>
          <Link
            to="/meals"
            className="px-6 py-3 rounded-2xl bg-olive-800 text-white font-black text-xs uppercase tracking-widest hover:bg-gold-500 transition-colors"
          >
            Order Again
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 text-gray-400 text-xs font-black uppercase tracking-widest mb-4">
              <Package className="w-4 h-4" /> Total Orders
            </div>
            <div className="text-3xl font-black text-olive-800">
              {stats.totalOrders}
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 text-gray-400 text-xs font-black uppercase tracking-widest mb-4">
              <DollarSign className="w-4 h-4" /> Total Spent
            </div>
            <div className="text-3xl font-black text-olive-800">
              ${stats.totalSpent.toFixed(2)}
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 text-gray-400 text-xs font-black uppercase tracking-widest mb-4">
              <Calendar className="w-4 h-4" /> Last Order
            </div>
            <div className="text-sm font-bold text-olive-800">
              {stats.lastOrder
                ? `#${stats.lastOrder._id || stats.lastOrder.id}`
                : 'No orders yet'}
            </div>
            {stats.lastOrder && (
              <div className="text-xs text-gray-400 mt-2">
                {new Date(stats.lastOrder.date || stats.lastOrder.createdAt || Date.now()).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-black text-olive-800 tracking-tight">
              Order History
            </h2>
          </div>
          {userOrders.length === 0 ? (
            <div className="p-10 text-gray-400 text-sm">
              No orders yet. Start by selecting meals.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {userOrders.map((order) => (
                <div key={order._id || order.id} className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                        Order #{order._id || order.id}
                      </div>
                      <div className="text-lg font-black text-olive-800">
                        ${order.totalPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(order.date || order.createdAt || Date.now()).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-2 rounded-full text-[10px] font-black uppercase bg-olive-50 text-olive-700 border border-olive-100">
                        {order.status}
                      </span>
                      <button className="text-xs font-black uppercase tracking-widest text-olive-800 flex items-center gap-2">
                        Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                      Track Your Order
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_FLOW.map((status, idx) => {
                        const currentIdx = STATUS_FLOW.indexOf(
                          (order.status as typeof STATUS_FLOW[number]) || 'PLACED'
                        );
                        const isActive = idx <= currentIdx;
                        return (
                          <span
                            key={`${order._id || order.id}-${status}`}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              isActive
                                ? 'bg-olive-800 text-white border-olive-800'
                                : 'bg-white text-gray-400 border-gray-200'
                            }`}
                          >
                            {status.replace(/_/g, ' ')}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items?.map((item, idx) => (
                      <div
                        key={`${order.id}-item-${idx}`}
                        className="flex items-center justify-between text-sm text-gray-500"
                      >
                        <span>{item.meal?.name}</span>
                        <span className="font-bold text-gray-400">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
