// 💰 Minha Conta - Local Storage Management

import { Transaction, Goal, User, Budget, Category, DEFAULT_CATEGORIES } from '@/types/financial';

const STORAGE_KEYS = {
  TRANSACTIONS: 'minha-conta-transactions',
  GOALS: 'minha-conta-goals',
  USERS: 'minha-conta-users',
  BUDGETS: 'minha-conta-budgets',
  CATEGORIES: 'minha-conta-categories',
  CURRENT_USER: 'minha-conta-current-user',
  APP_VERSION: 'minha-conta-version'
} as const;

class FinancialStorage {
  private version = '1.0.0';

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage() {
    // Check if this is first time use or version update
    const storedVersion = localStorage.getItem(STORAGE_KEYS.APP_VERSION);
    
    if (!storedVersion || storedVersion !== this.version) {
      this.initializeDefaultData();
      localStorage.setItem(STORAGE_KEYS.APP_VERSION, this.version);
    }
  }

  private initializeDefaultData() {
    // Initialize with default categories if none exist
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.saveCategories(DEFAULT_CATEGORIES);
    }

    // Create default user if none exists
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const defaultUser: User = {
        id: 'user-1',
        name: 'Usuário Principal',
        avatar: '👤',
        theme: 'light',
        colorScheme: 'default',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      this.saveUsers([defaultUser]);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, defaultUser.id);
    }
  }

  // Transactions
  getTransactions(): Transaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  }

  saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  addTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);
  }

  updateTransaction(id: string, updates: Partial<Transaction>): void {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      this.saveTransactions(transactions);
    }
  }

  deleteTransaction(id: string): void {
    const transactions = this.getTransactions().filter(t => t.id !== id);
    this.saveTransactions(transactions);
  }

  // Goals
  getGoals(): Goal[] {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  }

  saveGoals(goals: Goal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  addGoal(goal: Goal): void {
    const goals = this.getGoals();
    goals.push(goal);
    this.saveGoals(goals);
  }

  updateGoal(id: string, updates: Partial<Goal>): void {
    const goals = this.getGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates };
      this.saveGoals(goals);
    }
  }

  deleteGoal(id: string): void {
    const goals = this.getGoals().filter(g => g.id !== id);
    this.saveGoals(goals);
  }

  // Users
  getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getCurrentUser(): User | null {
    const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!currentUserId) return null;
    
    const users = this.getUsers();
    return users.find(u => u.id === currentUserId) || null;
  }

  setCurrentUser(userId: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  }

  // Budgets
  getBudgets(): Budget[] {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  }

  saveBudgets(budgets: Budget[]): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }

  // Categories
  getCategories(): Category[] {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  }

  saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  // Utility functions
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  exportData(): string {
    const data = {
      version: this.version,
      exportDate: new Date().toISOString(),
      transactions: this.getTransactions(),
      goals: this.getGoals(),
      users: this.getUsers(),
      budgets: this.getBudgets(),
      categories: this.getCategories(),
      currentUser: localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    };
    
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate data structure
      if (!data.version || !data.transactions) {
        throw new Error('Invalid data format');
      }
      
      // Import data
      this.saveTransactions(data.transactions);
      this.saveGoals(data.goals || []);
      this.saveUsers(data.users || []);
      this.saveBudgets(data.budgets || []);
      this.saveCategories(data.categories || DEFAULT_CATEGORIES);
      
      if (data.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, data.currentUser);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.initializeStorage();
  }
}

export const storage = new FinancialStorage();