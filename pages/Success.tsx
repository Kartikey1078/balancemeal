
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Success: React.FC = () => {
  const { orders, deliveryDetails } = useApp();
  const lastOrder = orders[0];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-green-600 p-12 text-center text-white">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-green-100">Your healthy journey starts now.</p>
        </div>

        <div className="p-10 lg:p-16 space-y-10">
          <div className="grid grid-cols-2 gap-8 pb-10 border-b border-gray-100">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Est. Delivery
              </div>
              <p className="font-bold text-lg">Next Monday, Oct 28</p>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Deliver To
              </div>
              <p className="font-bold text-lg">{deliveryDetails?.city}, {deliveryDetails?.zipCode}</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Order Summary</h3>
            <div className="space-y-4">
              {lastOrder?.items.map(item => (
                <div key={item.meal.id} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.meal.name}</span>
                  <span className="text-gray-400 text-sm font-bold">{item.quantity}x</span>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center font-bold text-xl">
                <span>Total</span>
                <span>${lastOrder?.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link 
              to="/dashboard" 
              className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-3"
            >
              View Your Orders <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
      <p className="mt-12 text-gray-400 text-sm">A confirmation email has been sent to {deliveryDetails?.email}</p>
    </div>
  );
};
