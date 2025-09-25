// 💰 Minha Conta - Reports Page

import { useState, useEffect } from 'react';
import { Calendar, Download, Filter, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import { Transaction, Category } from '@/types/financial';

interface FilterOptions {
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  category: string;
  type: 'all' | 'income' | 'expense';
  startDate: string;
  endDate: string;
}

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [currentUser] = useState(storage.getCurrentUser());
  
  const [filters, setFilters] = useState<FilterOptions>({
    period: 'month',
    category: 'all',
    type: 'all',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const loadData = () => {
    const allTransactions = storage.getTransactions();
    const userTransactions = currentUser 
      ? allTransactions.filter(t => t.userId === currentUser.id)
      : allTransactions;
    
    setTransactions(userTransactions);
    setCategories(storage.getCategories());
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Filter by period
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

    switch (filters.period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'custom':
        if (filters.startDate && filters.endDate) {
          startDate = new Date(filters.startDate);
          endDate = new Date(filters.endDate);
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    filtered = filtered.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    setFilteredTransactions(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const calculateSummary = () => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: filteredTransactions.length
    };
  };

  const getCategoryBreakdown = () => {
    const breakdown = new Map<string, { amount: number; count: number; category: Category }>();
    
    filteredTransactions.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.category);
      if (category) {
        const existing = breakdown.get(transaction.category) || { amount: 0, count: 0, category };
        breakdown.set(transaction.category, {
          amount: existing.amount + transaction.amount,
          count: existing.count + 1,
          category
        });
      }
    });
    
    return Array.from(breakdown.values())
      .sort((a, b) => b.amount - a.amount);
  };

  const getMonthlyTrend = () => {
    const monthlyData = new Map<string, { income: number; expenses: number }>();
    
    // Get last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(key);
      monthlyData.set(key, { income: 0, expenses: 0 });
    }
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData.has(key)) {
        const data = monthlyData.get(key)!;
        if (transaction.type === 'income') {
          data.income += transaction.amount;
        } else {
          data.expenses += transaction.amount;
        }
      }
    });
    
    return months.map(month => ({
      month,
      ...monthlyData.get(month)!
    }));
  };

  const exportToCSV = () => {
    const csvContent = [
      'Data,Tipo,Categoria,Descrição,Valor,Tags',
      ...filteredTransactions.map(t => 
        `${t.date},${t.type === 'income' ? 'Receita' : 'Despesa'},${t.category},${t.description},${t.amount},"${t.tags.join(', ')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric'
    });
  };

  const summary = calculateSummary();
  const categoryBreakdown = getCategoryBreakdown();
  const monthlyTrend = getMonthlyTrend();

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center space-x-2">
            <PieChart className="h-8 w-8 text-secondary" />
            <span>Relatórios</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise detalhada das suas finanças
          </p>
        </div>
        
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select 
                value={filters.period} 
                onValueChange={(value: any) => setFilters({...filters, period: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="quarter">Este Trimestre</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={filters.type} 
                onValueChange={(value: any) => setFilters({...filters, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select 
                value={filters.category} 
                onValueChange={(value) => setFilters({...filters, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filters.period === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>
              </>
            )}
          </div>
          
          {filters.period === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(summary.balance)}</p>
                <p className="text-sm text-muted-foreground">Saldo Período</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="income-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-income-foreground" />
              <div>
                <p className="text-2xl font-bold text-income-foreground">{formatCurrency(summary.income)}</p>
                <p className="text-sm text-income-foreground/80">Total Receitas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="expense-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-expense-foreground" />
              <div>
                <p className="text-2xl font-bold text-expense-foreground">{formatCurrency(summary.expenses)}</p>
                <p className="text-sm text-expense-foreground/80">Total Despesas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{summary.transactionCount}</p>
                <p className="text-sm text-muted-foreground">Transações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        {/* Categories Analysis */}
        <TabsContent value="categories" className="space-y-4">
          <Card className="financial-card">
            <CardHeader>
              <CardTitle>Análise por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryBreakdown.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-16 w-16 mx-auto mb-4" />
                  <p>Nenhuma transação encontrada para o período selecionado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdown.map((item, index) => {
                    const percentage = summary.income + summary.expenses > 0 
                      ? (item.amount / (summary.income + summary.expenses)) * 100 
                      : 0;
                    
                    return (
                      <div key={item.category.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{item.category.icon}</div>
                          <div>
                            <p className="font-medium">{item.category.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.count} transação{item.count !== 1 ? 'ões' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(item.amount)}</p>
                          <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline" className="space-y-4">
          <Card className="financial-card">
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4" />
                  <p>Nenhuma transação encontrada para o período selecionado</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTransactions.map((transaction) => {
                    const category = categories.find(c => c.id === transaction.category);
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{category?.icon || '💰'}</div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                              <Badge variant="outline" className="text-xs">
                                {category?.name || transaction.category}
                              </Badge>
                              {transaction.tags.length > 0 && (
                                <div className="flex space-x-1">
                                  {transaction.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`font-bold ${
                          transaction.type === 'income' ? 'text-income' : 'text-expense'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card className="financial-card">
            <CardHeader>
              <CardTitle>Tendência dos Últimos 6 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrend.map((data) => (
                  <div key={data.month} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{formatMonth(data.month)}</span>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-income">+{formatCurrency(data.income)}</span>
                        <span className="text-expense">-{formatCurrency(data.expenses)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1 h-4 bg-muted rounded">
                      <div 
                        className="bg-income rounded-l"
                        style={{ 
                          width: `${data.income + data.expenses > 0 ? (data.income / (data.income + data.expenses)) * 100 : 0}%` 
                        }}
                      ></div>
                      <div 
                        className="bg-expense rounded-r"
                        style={{ 
                          width: `${data.income + data.expenses > 0 ? (data.expenses / (data.income + data.expenses)) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}