// 💰 Minha Conta - Financial Types

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  tags: string[];
  userId: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    nextDate: string;
  };
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  theme: 'light' | 'dark' | 'auto';
  colorScheme: 'default' | 'masculine' | 'feminine';
  isActive: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly';
  userId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  period: {
    start: string;
    end: string;
  };
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
}

export const DEFAULT_CATEGORIES: Category[] = [
  // Income Categories
  { id: 'salary', name: 'Salário', icon: '💼', color: '#22c55e', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3b82f6', type: 'income' },
  { id: 'investment', name: 'Investimentos', icon: '📈', color: '#8b5cf6', type: 'income' },
  { id: 'bonus', name: 'Bônus', icon: '🎁', color: '#f59e0b', type: 'income' },
  
  // Expense Categories
  { id: 'food', name: 'Alimentação', icon: '🍽️', color: '#ef4444', type: 'expense' },
  { id: 'transport', name: 'Transporte', icon: '🚗', color: '#f97316', type: 'expense' },
  { id: 'health', name: 'Saúde', icon: '🏥', color: '#06b6d4', type: 'expense' },
  { id: 'entertainment', name: 'Lazer', icon: '🎬', color: '#ec4899', type: 'expense' },
  { id: 'housing', name: 'Moradia', icon: '🏠', color: '#84cc16', type: 'expense' },
  { id: 'education', name: 'Educação', icon: '📚', color: '#6366f1', type: 'expense' },
  { id: 'shopping', name: 'Compras', icon: '🛍️', color: '#d946ef', type: 'expense' },
  { id: 'bills', name: 'Contas', icon: '📄', color: '#64748b', type: 'expense' },
];