import React from 'react';
import { MapPin, ChefHat, Truck, Smile } from 'lucide-react';

const steps = [
  {
    title: 'Pick Your Meals',
    desc: 'Enter your zip code to check delivery availability.',
    icon: MapPin,
  },
  {
    title: 'We Prepare Meals',
    desc: 'Scroll down to select your preferred meal plan.',
    icon: ChefHat,
  },
  {
    title: 'Door Step Delivery',
    desc: 'Fill your details and complete the payment to confirm your order.',
    icon: Truck,
  },
  {
    title: 'Enjoy Your Meals',
    desc: 'Enjoy hassle-free delivery of nutritious food to your doorstep.',
    icon: Smile,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-28 bg-[#F9FBF9]/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-16">
          <div>
            <h2 className="text-4xl lg:text-6xl font-black text-olive-800 tracking-tight">
              How It Works?
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl">
              Simple steps to build your weekly plan and start eating better.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="rounded-[2.5rem] bg-white border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-olive-50 text-olive-800 flex items-center justify-center mb-6 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  Step
                </div>
                <h3 className="text-xl font-black text-olive-800">{step.title}</h3>
                <p className="mt-3 text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
