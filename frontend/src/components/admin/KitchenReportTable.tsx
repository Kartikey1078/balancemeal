import React from "react";
import { KitchenReportItem } from "../../types.ts";

export const KitchenReportTable: React.FC<{
  title: string;
  items: KitchenReportItem[];
  total: number;
}> = ({ title, items, total }) => {
  const sortedBaseOptions = (entry: KitchenReportItem) =>
    [...entry.baseOptions].sort((a, b) => a.localeCompare(b));

  const sortedBaseOptionQuantities = (entry: KitchenReportItem) =>
    [...entry.baseOptionQuantities].sort((a, b) =>
      a.baseOption.localeCompare(b.baseOption)
    );

  return (
    <div className="bg-[#1C1C1C] p-8 rounded-[2rem] border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-gray-500 font-black uppercase tracking-widest mt-2">
            Total {total}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="text-[10px] uppercase tracking-widest text-gray-500">
            <tr>
              <th className="py-3 pr-4 border-b border-white/10">Meal</th>
              <th className="py-3 px-4 border-b border-white/10 border-l border-white/10">
                Variations
              </th>
              <th className="py-3 px-4 border-b border-white/10 border-l border-white/10">
               Variations Option Qty
              </th>
              <th className="py-3 pl-4 border-b border-white/10 border-l border-white/10 text-right">
                Total Qty
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-gray-500 border-b border-white/10">
                  No items yet.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.mealName}>
                  <td className="py-4 pr-4 text-white font-bold border-b border-white/10">
                    {item.mealName}
                  </td>
                  <td className="py-4 px-4 text-gray-400 border-b border-white/10 border-l border-white/10">
                    <div className="space-y-1">
                      {sortedBaseOptions(item).map((option) => (
                        <div key={option}>{option}</div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-400 border-b border-white/10 border-l border-white/10">
                    <div className="space-y-1">
                      {sortedBaseOptionQuantities(item).map((entry) => (
                        <div key={entry.baseOption}>
                          {entry.baseOption}: {entry.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 pl-4 text-right text-white font-black border-b border-white/10 border-l border-white/10">
                    {item.totalQuantity}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td className="py-4 pr-4 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                Total
              </td>
              <td className="py-4 px-4 border-l border-white/10" />
              <td className="py-4 px-4 border-l border-white/10" />
              <td className="py-4 pl-4 text-right text-white font-black border-l border-white/10">
                {total}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
