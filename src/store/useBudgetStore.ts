import { create } from 'zustand';
import { getBudget, setBudget as saveBudget } from '@/db/repositories/budgets';

interface BudgetState {
  budgetMinor: number | null;
  loadBudget: (monthKey: string) => void;
  setBudget: (monthKey: string, budgetMinor: number) => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgetMinor: null,
  loadBudget: (monthKey: string) => {
    set({ budgetMinor: getBudget(monthKey) });
  },
  setBudget: (monthKey: string, budgetMinor: number) => {
    saveBudget(monthKey, budgetMinor);
    set({ budgetMinor });
  },
}));
