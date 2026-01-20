import React from 'react';
import { Star, PenLine } from 'lucide-react';

const testimonials = [
  {
    name: 'Aarav Mehta',
    role: 'Product Manager',
    quote: 'Balanced Meal makes it effortless to eat clean. The portions are perfect and taste incredible.',
  },
  {
    name: 'Riya Kapoor',
    role: 'Fitness Coach',
    quote: 'My clients love the macros. It saves time and keeps them consistent week after week.',
  },
  {
    name: 'Kabir Singh',
    role: 'Entrepreneur',
    quote: 'High-quality meals, always on time. The nutrition balance is spot on.',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-16">
          <div>
            <h2 className="text-4xl lg:text-6xl font-black text-olive-800 tracking-tight">
              What our customers say
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Real stories from people building healthier routines with Balanced Meal.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border border-gray-100 text-olive-800 font-black text-xs uppercase tracking-widest hover:bg-olive-50 hover:-translate-y-0.5 transition-all">
            Write Us a Review <PenLine className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-[2.5rem] border border-gray-100 bg-white shadow-sm p-8 hover:shadow-2xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-center gap-1 text-gold-500 mb-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">"{item.quote}"</p>
              <div>
                <p className="text-sm font-black text-olive-800">{item.name}</p>
                <p className="text-xs text-gray-400">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
