"use client";

import {
  Apple,
  ChevronDown,
  ChevronRight,
  Flame,
  Lightbulb,
  Plus,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { FoodItem, Meal, MealVariant, NutritionPlan } from "@/lib/data";

interface Props {
  plan: NutritionPlan;
  setPlan: (updater: (prev: NutritionPlan) => NutritionPlan) => void;
}

export function NutritionTab({ plan, setPlan }: Props) {
  // Auto-expand any meal that already has content; collapse the rest.
  const [expandedMealIds, setExpandedMealIds] = useState<string[]>(() =>
    plan.meals
      .filter((m) => m.variants.some((v) => v.foods.length > 0))
      .map((m) => m.id)
  );

  const toggleMeal = (id: string) => {
    setExpandedMealIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const updateMacro = (key: "calories" | "protein" | "carbs" | "fats", value: number) => {
    setPlan((p) => ({ ...p, [key]: value }));
  };

  return (
    <div className="space-y-5">
      {/* Macro targets */}
      <div>
        <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Daily macro targets</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MacroCard
            value={plan.calories}
            onChange={(v) => updateMacro("calories", v)}
            label="Total calories"
            unit="kcal"
            placeholder="e.g., 2000"
            color="bg-[#F7EEE8] border-[#DCC3B2] text-[#8A4427]"
            valueColor="text-[#8A4427]"
            icon={<Flame className="h-3.5 w-3.5 text-[#C05C28]" />}
          />
          <MacroCard
            value={plan.protein}
            onChange={(v) => updateMacro("protein", v)}
            label="Protein"
            unit="g"
            placeholder="e.g., 130"
            color="bg-rose-50 border-rose-200 text-rose-900"
            valueColor="text-rose-900"
          />
          <MacroCard
            value={plan.carbs}
            onChange={(v) => updateMacro("carbs", v)}
            label="Carbs"
            unit="g"
            placeholder="e.g., 250"
            color="bg-[#F5F4F2] border-[#E5E3DE] text-[#1A1A1A]"
            valueColor="text-[#1A1A1A]"
          />
          <MacroCard
            value={plan.fats}
            onChange={(v) => updateMacro("fats", v)}
            label="Fats"
            unit="g"
            placeholder="e.g., 60"
            color="bg-stone-50 border-stone-200 text-stone-900"
            valueColor="text-stone-900"
          />
        </div>
      </div>

      {/* Meals */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Meals</div>
          <button
            onClick={() =>
              setPlan((p) => ({
                ...p,
                meals: [
                  ...p.meals,
                  {
                    id: `meal-${Date.now()}`,
                    name: `Meal ${p.meals.length + 1}`,
                    variants: [{ id: `meal-${Date.now()}-v`, label: "Primary option", foods: [] }],
                  },
                ],
              }))
            }
            className="text-xs font-medium text-[#1A1A1A] hover:text-[#1A1A1A] inline-flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add meal
          </button>
        </div>
        <div className="space-y-2">
          {plan.meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              expanded={expandedMealIds.includes(meal.id)}
              onToggle={() => toggleMeal(meal.id)}
              onChange={(updater) =>
                setPlan((p) => ({
                  ...p,
                  meals: p.meals.map((m) => (m.id === meal.id ? updater(m) : m)),
                }))
              }
              onDelete={() => setPlan((p) => ({ ...p, meals: p.meals.filter((m) => m.id !== meal.id) }))}
            />
          ))}
        </div>
      </div>

      {/* Coach notes */}
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <StickyNote className="h-4 w-4 text-[#C05C28]" />
          <h3 className="text-sm font-semibold text-stone-900">Coach notes</h3>
        </div>
        <textarea
          value={plan.coachNotes}
          onChange={(e) => setPlan((p) => ({ ...p, coachNotes: e.target.value }))}
          rows={5}
          placeholder="Add your diet rules and guidelines for this plan (e.g., oil limits, restaurant rules, alcohol guidelines, foods to avoid)"
          className="w-full p-3 rounded-lg border border-stone-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#E5E3DE] outline-none text-sm leading-relaxed resize-none placeholder:text-stone-400"
        />
      </div>

      {/* Hunger subs */}
      <HungerSubsSection
        items={plan.hungerSubs}
        onChange={(updater) => setPlan((p) => ({ ...p, hungerSubs: updater(p.hungerSubs) }))}
      />
    </div>
  );
}

function MacroCard({
  value, onChange, label, unit, color, valueColor, icon, placeholder,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  unit: string;
  color: string;
  valueColor: string;
  icon?: React.ReactNode;
  placeholder?: string;
}) {
  const displayValue = value === 0 ? "" : String(value);
  return (
    <div className={`rounded-xl border p-3 ${color}`}>
      <div className="flex items-baseline gap-1">
        <input
          type="number"
          min={0}
          value={displayValue}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder={placeholder}
          className={`text-2xl font-semibold ${valueColor} bg-transparent outline-none w-full tabular-nums focus:border-b focus:border-current placeholder:text-current placeholder:opacity-30 placeholder:font-medium`}
        />
        <span className="text-xs opacity-70">{unit}</span>
      </div>
      <div className="text-[11px] font-medium opacity-80 mt-0.5 inline-flex items-center gap-1">
        {icon}
        {label}
      </div>
    </div>
  );
}

function MealCard({
  meal, expanded, onToggle, onChange, onDelete,
}: {
  meal: Meal;
  expanded: boolean;
  onToggle: () => void;
  onChange: (updater: (prev: Meal) => Meal) => void;
  onDelete: () => void;
}) {
  const totals = useMemo(() => {
    const primary = meal.variants[0];
    if (!primary || primary.foods.length === 0) return null;
    return primary.foods.reduce(
      (acc, f) => ({
        calories: acc.calories + (f.calories || 0),
        carbs: acc.carbs + (f.carbs || 0),
        fats: acc.fats + (f.fats || 0),
        protein: acc.protein + (f.protein || 0),
        fiber: acc.fiber + (f.fiber || 0),
      }),
      { calories: 0, carbs: 0, fats: 0, protein: 0, fiber: 0 }
    );
  }, [meal.variants]);

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-stone-50 transition-colors">
        <button onClick={onToggle} className="text-stone-400 hover:text-stone-700 shrink-0">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <Apple className="h-4 w-4 text-[#1A1A1A] shrink-0" />
        <input
          value={meal.name}
          onChange={(e) => onChange((p) => ({ ...p, name: e.target.value }))}
          className="flex-1 text-sm font-medium text-stone-900 bg-transparent outline-none focus:border-b focus:border-[#1C1C1C]"
        />
        {totals && !expanded && (
          <span className="text-[11px] text-stone-500 tabular-nums">
            {totals.calories} kcal · {totals.protein}P / {totals.carbs}C / {totals.fats}F
          </span>
        )}
        {!totals && !expanded && (
          <span className="text-[11px] text-stone-400 italic">Empty</span>
        )}
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-500"
          aria-label="Remove meal"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-stone-100">
          {meal.variants.map((variant, vIdx) => (
            <VariantBlock
              key={variant.id}
              variant={variant}
              isPrimary={vIdx === 0}
              variantIdx={vIdx}
              onChange={(updater) =>
                onChange((p) => ({
                  ...p,
                  variants: p.variants.map((v) => (v.id === variant.id ? updater(v) : v)),
                }))
              }
              onRemove={() =>
                onChange((p) => ({
                  ...p,
                  variants: p.variants.filter((v) => v.id !== variant.id),
                }))
              }
            />
          ))}

          <button
            onClick={() =>
              onChange((p) => {
                const altCount = p.variants.filter((v) => v.id.includes("-alt-")).length;
                return {
                  ...p,
                  variants: [
                    ...p.variants,
                    {
                      id: `${p.id}-alt-${Date.now()}`,
                      label: `Alternative ${altCount + 1} (OR)`,
                      foods: [],
                    },
                  ],
                };
              })
            }
            className="mt-2 text-xs font-medium text-[#1A1A1A] hover:text-[#1A1A1A] inline-flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add alternative
          </button>

          <div className="mt-3 pt-3 border-t border-stone-100">
            <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block mb-1">
              Notes <span className="font-normal lowercase">(optional)</span>
            </label>
            <input
              value={meal.notes ?? ""}
              onChange={(e) => onChange((p) => ({ ...p, notes: e.target.value }))}
              placeholder="e.g., 30 min before workout"
              className="w-full h-8 px-2 rounded-md border border-stone-200 focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#E5E3DE] outline-none text-xs placeholder:text-stone-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function VariantBlock({
  variant, isPrimary, variantIdx, onChange, onRemove,
}: {
  variant: MealVariant;
  isPrimary: boolean;
  variantIdx: number;
  onChange: (updater: (prev: MealVariant) => MealVariant) => void;
  onRemove: () => void;
}) {
  const totals = variant.foods.reduce(
    (acc, f) => ({
      calories: acc.calories + (f.calories || 0),
      carbs: acc.carbs + (f.carbs || 0),
      fats: acc.fats + (f.fats || 0),
      protein: acc.protein + (f.protein || 0),
      fiber: acc.fiber + (f.fiber || 0),
    }),
    { calories: 0, carbs: 0, fats: 0, protein: 0, fiber: 0 }
  );

  const addFood = () =>
    onChange((p) => ({
      ...p,
      foods: [
        ...p.foods,
        {
          id: `food-${Date.now()}`,
          name: "New food",
          quantity: "1 serving",
          calories: 0, carbs: 0, fats: 0, protein: 0, fiber: 0,
        },
      ],
    }));

  const updateFood = (id: string, patch: Partial<FoodItem>) =>
    onChange((p) => ({
      ...p,
      foods: p.foods.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));

  const removeFood = (id: string) =>
    onChange((p) => ({ ...p, foods: p.foods.filter((f) => f.id !== id) }));

  const isEmpty = variant.foods.length === 0;

  return (
    <div className={`mt-3 ${!isPrimary ? "pt-3 border-t border-dashed border-stone-200" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <input
          value={variant.label}
          onChange={(e) => onChange((p) => ({ ...p, label: e.target.value }))}
          className={`text-xs font-semibold ${isPrimary ? "text-stone-700" : "text-[#8A4427]"} bg-transparent outline-none focus:border-b`}
        />
        {!isPrimary && (
          <button
            onClick={onRemove}
            className="text-[11px] text-stone-400 hover:text-red-600 inline-flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        )}
      </div>

      <div className="overflow-x-auto -mx-3 px-3">
        <table className="w-full min-w-[720px] text-xs">
          <thead>
            <tr className="text-[9px] text-stone-400 uppercase tracking-wide">
              <th colSpan={2}></th>
              <th colSpan={5} className="text-center font-medium pb-1 border-b border-stone-100">
                Macros (per portion)
              </th>
              <th></th>
            </tr>
            <tr className="text-[10px] text-stone-500 uppercase tracking-wide">
              <th className="text-left font-medium pt-1 pb-1 pr-2">Food</th>
              <th className="text-left font-medium pt-1 pb-1 pr-2 w-[90px]">Qty</th>
              <th className="text-right font-medium pt-1 pb-1 px-1 w-[60px] cursor-help" title="Calories (kcal)">Cal</th>
              <th className="text-right font-medium pt-1 pb-1 px-1 w-[52px] cursor-help" title="Carbohydrates (grams)">C</th>
              <th className="text-right font-medium pt-1 pb-1 px-1 w-[52px] cursor-help" title="Fats (grams)">F</th>
              <th className="text-right font-medium pt-1 pb-1 px-1 w-[52px] cursor-help" title="Protein (grams)">P</th>
              <th className="text-right font-medium pt-1 pb-1 px-1 w-[52px] cursor-help" title="Fiber (grams)">Fib</th>
              <th className="w-7"></th>
            </tr>
          </thead>
          <tbody>
            {isEmpty && (
              <tr>
                <td colSpan={8} className="text-center text-stone-400 italic py-3">
                  Add food items for this {isPrimary ? "meal" : "alternative"}
                </td>
              </tr>
            )}
            {variant.foods.map((f) => (
              <tr key={f.id} className="group">
                <td className="pr-2 py-1">
                  <input
                    value={f.name}
                    onChange={(e) => updateFood(f.id, { name: e.target.value })}
                    className="w-full h-7 px-1.5 rounded border border-transparent hover:border-stone-200 focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#E5E3DE] outline-none text-xs bg-transparent"
                  />
                </td>
                <td className="pr-2 py-1">
                  <input
                    value={f.quantity}
                    onChange={(e) => updateFood(f.id, { quantity: e.target.value })}
                    className="w-full h-7 px-1.5 rounded border border-transparent hover:border-stone-200 focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#E5E3DE] outline-none text-xs bg-transparent"
                  />
                </td>
                {(["calories", "carbs", "fats", "protein", "fiber"] as const).map((k) => (
                  <td key={k} className="px-1 py-1">
                    <input
                      type="number"
                      min={0}
                      value={f[k]}
                      onChange={(e) => updateFood(f.id, { [k]: Number(e.target.value) || 0 } as Partial<FoodItem>)}
                      className="w-full h-7 px-1 rounded border border-transparent hover:border-stone-200 focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#E5E3DE] outline-none text-xs text-right tabular-nums bg-transparent"
                    />
                  </td>
                ))}
                <td className="py-1">
                  <button
                    onClick={() => removeFood(f.id)}
                    className="p-1 rounded text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    aria-label="Remove food"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
            {/* Meal/alternative total — always show, including for empty variants */}
            {isPrimary && (
              <tr className="border-t border-stone-200 font-semibold text-stone-800">
                <td className="pr-2 pt-1.5 pb-1 text-[10px] uppercase tracking-wide text-stone-500">Meal total</td>
                <td></td>
                <td className="text-right tabular-nums pt-1.5 pb-1">{totals.calories}</td>
                <td className="text-right tabular-nums pt-1.5 pb-1">{totals.carbs}</td>
                <td className="text-right tabular-nums pt-1.5 pb-1">{totals.fats}</td>
                <td className="text-right tabular-nums pt-1.5 pb-1">{totals.protein}</td>
                <td className="text-right tabular-nums pt-1.5 pb-1">{totals.fiber}</td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={addFood}
        className="mt-1 text-xs font-medium text-[#1A1A1A] hover:text-[#1A1A1A] inline-flex items-center gap-1"
      >
        <Plus className="h-3.5 w-3.5" />
        Add food item
        <span className="text-stone-400 font-normal ml-0.5">to {variantIdx === 0 ? "primary" : "alternative"}</span>
      </button>
    </div>
  );
}

function HungerSubsSection({
  items,
  onChange,
}: {
  items: string[];
  onChange: (updater: (prev: string[]) => string[]) => void;
}) {
  const isEmpty = items.length === 0;

  return (
    <div className="bg-[#F7EEE8]/50 border border-[#DCC3B2] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-[#8A4427]" />
        <h3 className="text-sm font-semibold text-[#8A4427]">Hunger substitutions</h3>
      </div>

      {isEmpty ? (
        <p className="text-xs text-[#8A4427]/80 mb-2 leading-relaxed">
          Add items your client can have when hungry between meals.
        </p>
      ) : (
        <ul className="space-y-1 text-sm text-stone-800 mb-2">
          {items.map((sub, i) => (
            <li key={i} className="group flex items-start gap-2">
              <span className="text-[#C05C28] mt-0.5 select-none">•</span>
              <input
                value={sub}
                onChange={(e) =>
                  onChange((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))
                }
                className="flex-1 bg-transparent outline-none focus:border-b focus:border-[#C05C28] text-sm"
              />
              <button
                onClick={() => onChange((prev) => prev.filter((_, idx) => idx !== i))}
                className="p-1 rounded text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                aria-label="Remove substitution"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => onChange((prev) => [...prev, ""])}
        className="text-xs font-medium text-[#8A4427] hover:text-[#8A4427] inline-flex items-center gap-1"
      >
        <Plus className="h-3.5 w-3.5" />
        Add substitution
      </button>
    </div>
  );
}
