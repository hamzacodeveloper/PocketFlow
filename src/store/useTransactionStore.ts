import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import { listByMonth, insert, update, remove, TransactionWithCategory } from '@/db/repositories/transactions';

interface TransactionState {
  transactions: TransactionWithCategory[];
  loading: boolean;
  loadMonth: (monthKey: string) => void;
  addTransaction: (tx: {
    type: 'expense' | 'income';
    amount_minor: number;
    category_id: string | null;
    note: string | null;
    date: string;
  }) => void;
  editTransaction: (tx: {
    id: string;
    type: 'expense' | 'income';
    amount_minor: number;
    category_id: string | null;
    note: string | null;
    date: string;
  }) => void;
  deleteTransaction: (id: string) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  loading: false,
  loadMonth: (monthKey: string) => {
    set({ loading: true });
    const rows = listByMonth(monthKey);
    set({ transactions: rows, loading: false });
  },
  addTransaction: (tx) => {
    insert({
      ...tx,
      id: Crypto.randomUUID(),
      created_at: new Date().toISOString(),
    });
    const rows = listByMonth(tx.date.substring(0, 7));
    set({ transactions: rows });
  },
  editTransaction: (tx) => {
    update(tx);
    const rows = listByMonth(tx.date.substring(0, 7));
    set({ transactions: rows });
  },
  deleteTransaction: (id) => {
    remove(id);
    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
  },
}));
