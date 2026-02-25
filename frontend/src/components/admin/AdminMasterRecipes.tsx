import React, { useEffect, useState } from "react";
import { FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useApp } from "../../context/AppContext.tsx";
import { MasterRecipe, MasterRecipeIngredient } from "../../types.ts";

export const AdminMasterRecipes: React.FC = () => {
  const { adminData } = useApp();

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewRecipe, setViewRecipe] = useState<MasterRecipe | null>(null);
  const [viewerServings, setViewerServings] = useState(1);
  const [error, setError] = useState("");

  const [form, setForm] = useState<{
    name: string;
    ingredients: MasterRecipeIngredient[];
  }>({
    name: "",
    ingredients: [],
  });

  const [ingredientForm, setIngredientForm] = useState<{
    name: string;
    baseQuantity: string;
    unit: string;
  }>({
    name: "",
    baseQuantity: "",
    unit: "",
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      await adminData.fetchMasterRecipes();
      if (mounted) setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount; adminData is unstable (new ref each render)
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", ingredients: [] });
    setIngredientForm({ name: "", baseQuantity: "", unit: "" });
    setError("");
  };

  const handleAddIngredient = () => {
    const name = ingredientForm.name.trim();
    const qty = Number(ingredientForm.baseQuantity);
    const unit = ingredientForm.unit.trim();
    if (!name) {
      setError("Ingredient name is required.");
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Enter a valid quantity greater than 0.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          name,
          baseQuantity: qty,
          unit,
        },
      ],
    }));
    setIngredientForm({ name: "", baseQuantity: "", unit: "" });
    setError("");
  };

  const handleRemoveIngredient = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Recipe name is required.");
      return;
    }
    const payload: Partial<MasterRecipe> = {
      name: form.name.trim(),
      baseServings: 1,
      desiredServings: 1,
      ingredients: form.ingredients,
    };

    const result = editingId
      ? await adminData.updateMasterRecipe(editingId, payload)
      : await adminData.createMasterRecipe(payload);

    if (!result.ok) {
      setError(result.error || "Failed to save recipe.");
      return;
    }

    resetForm();
  };

  const multiplier = viewerServings > 0 ? viewerServings : 1;

  const handleDownloadPdf = () => {
    if (!viewRecipe) return;
    const mult = multiplier;
    const doc = new jsPDF();
    let y = 14;
    doc.setFontSize(18);
    doc.text(viewRecipe.name, 14, y);
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Servings: ${viewerServings}  |  Multiplier: ${mult.toFixed(2)}`, 14, y);
    y += 10;
    doc.setTextColor(0, 0, 0);
    const tableBody = viewRecipe.ingredients.length
      ? viewRecipe.ingredients.map((ing) => [
          ing.name,
          String(ing.baseQuantity),
          ing.unit,
          (ing.baseQuantity * mult).toFixed(2),
        ])
      : [["No ingredients", "-", "-", "-"]];
    autoTable(doc, {
      startY: y,
      head: [["Ingredient", "Base Qty", "Unit", "Adjusted Qty"]],
      body: tableBody,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
    });
    const fileName = `${viewRecipe.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-recipe.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="bg-[#1C1C1C] rounded-[2.5rem] border border-white/5 shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-xl text-white tracking-tight">
            {editingId ? "Edit Master Recipe" : "New Master Recipe"}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
              Recipe Name
            </label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                Ingredients (for 1 person)
              </label>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-xs font-black uppercase tracking-widest text-gold-500 hover:text-white"
              >
                + Add Ingredient
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <input
                placeholder="Name"
                value={ingredientForm.name}
                onChange={(e) =>
                  setIngredientForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none"
              />
              <input
                placeholder="Quantity"
                type="number"
                min={0}
                value={ingredientForm.baseQuantity}
                onChange={(e) =>
                  setIngredientForm((prev) => ({
                    ...prev,
                    baseQuantity: e.target.value,
                  }))
                }
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none"
              />
              <input
                placeholder="Unit"
                value={ingredientForm.unit}
                onChange={(e) =>
                  setIngredientForm((prev) => ({
                    ...prev,
                    unit: e.target.value,
                  }))
                }
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              {form.ingredients.map((ing, idx) => (
                <div
                  key={`${ing.name}-${idx}`}
                  className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 space-y-2"
                >
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      value={ing.name}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          ingredients: prev.ingredients.map((row, i) =>
                            i === idx ? { ...row, name: e.target.value } : row
                          ),
                        }))
                      }
                      className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    />
                    <input
                      type="number"
                      min={0}
                      value={ing.baseQuantity}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          ingredients: prev.ingredients.map((row, i) =>
                            i === idx
                              ? {
                                  ...row,
                                  baseQuantity: Number(e.target.value || 0),
                                }
                              : row
                          ),
                        }))
                      }
                      className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    />
                    <input
                      value={ing.unit}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          ingredients: prev.ingredients.map((row, i) =>
                            i === idx ? { ...row, unit: e.target.value } : row
                          ),
                        }))
                      }
                      className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                      Adjusted (x{multiplier.toFixed(2)}):{" "}
                      {(ing.baseQuantity * multiplier).toFixed(2)} {ing.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="text-xs font-black uppercase tracking-widest text-rose-500 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {form.ingredients.length === 0 && (
                <p className="text-xs text-gray-500">No ingredients added.</p>
              )}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-bold">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full gold-gradient text-white py-4 rounded-2xl font-black text-sm"
          >
            {editingId ? "Update Recipe" : "Create Recipe"}
          </button>
        </div>
      </div>

      <div className="bg-[#1C1C1C] rounded-[2.5rem] border border-white/5 shadow-2xl p-8 space-y-8">
        <div>
          <h3 className="font-black text-xl text-white tracking-tight mb-6">
            Master Recipes
          </h3>
          {loading ? (
            <p className="text-xs text-gray-500">Loading recipes...</p>
          ) : (
            <div className="space-y-4">
              {adminData.masterRecipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-bold">{recipe.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {recipe.ingredients.length} ingredients
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setViewRecipe(recipe);
                        setViewerServings(1);
                      }}
                      className="text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-white"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(recipe._id || null);
                        setForm({
                          name: recipe.name,
                          ingredients: recipe.ingredients || [],
                        });
                        setError("");
                      }}
                      className="text-xs font-black uppercase tracking-widest text-gold-500 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (recipe._id) {
                          await adminData.deleteMasterRecipe(recipe._id);
                        }
                      }}
                      className="text-xs font-black uppercase tracking-widest text-rose-500 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {adminData.masterRecipes.length === 0 && (
                <p className="text-xs text-gray-500">No master recipes yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">
              Recipe Viewer
            </h4>
            {viewRecipe && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10"
                >
                  <FileDown className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setViewRecipe(null)}
                  className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          {!viewRecipe ? (
            <p className="text-xs text-gray-500">
              Select a recipe to view and scale.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                    Recipe
                  </p>
                  <p className="text-white font-bold">{viewRecipe.name}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                    Number of Persons
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={viewerServings}
                    onChange={(e) =>
                      setViewerServings(Number(e.target.value || 0))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Multiplier:{" "}
                {(
                  Number.isFinite(multiplier) ? multiplier : 1
                ).toFixed(2)}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      <th className="py-3">Ingredient</th>
                      <th className="py-3">Base Qty</th>
                      <th className="py-3">Unit</th>
                      <th className="py-3">Adjusted Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {viewRecipe.ingredients.map((ing, idx) => (
                      <tr key={`${ing.name}-${idx}`}>
                        <td className="py-3 text-white font-bold">
                          { ing.name }
                        </td>
                        <td className="py-3">{ing.baseQuantity}</td>
                        <td className="py-3">{ing.unit}</td>
                        <td className="py-3">
                          {(ing.baseQuantity * multiplier).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {viewRecipe.ingredients.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-gray-500">
                          No ingredients found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

