// 💰 Minha Conta - Dashboard Page

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Target, Calendar, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { storage } from '@/lib/storage';
import { Transaction, Goal } from '@/types/financial';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [currentUser, setCurrentUser] = useState(storage.getCurrentUser());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTransactions(storage.getTransactions());
    setGoals(storage.getGoals());
  };

  // Calculate current month data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Active goals with progress
  const activeGoals = goals
    .filter(g => g.isActive)
    .slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getTransactionIcon = (category: string) => {
    const categoryMap: Record<string, string> = {
      'salary': '💼', 'freelance': '💻', 'investment': '📈', 'bonus': '🎁',
      'food': '🍽️', 'transport': '🚗', 'health': '🏥', 'entertainment': '🎬',
      'housing': '🏠', 'education': '📚', 'shopping': '🛍️', 'bills': '📄'
    };
    return categoryMap[category] || '💰';
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Olá, {currentUser?.name || 'Usuário'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está seu resumo financeiro de hoje
          </p>
        </div>
        <Link to="/add-transaction">
          <Button className="fab lg:relative lg:bottom-auto lg:right-auto">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <Card className="financial-card col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Atual
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="h-8 w-8 p-0"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {showBalance ? formatCurrency(balance) : '••••••'}
            </div>
            <p className={`text-xs flex items-center ${
              balance >= 0 ? 'text-income' : 'text-expense'
            }`}>
              {balance >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </p>
          </CardContent>
        </Card>

        {/* Income Card */}
        <Card className="income-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-income-foreground">
              Receitas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-income-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income-foreground">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-income-foreground/80">
              {currentMonthTransactions.filter(t => t.type === 'income').length} transações
            </p>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="expense-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-expense-foreground">
              Despesas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-expense-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense-foreground">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-expense-foreground/80">
              {currentMonthTransactions.filter(t => t.type === 'expense').length} transações
            </p>
          </CardContent>
        </Card>

        {/* Goals Card */}
        <Card className="goal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-goal-foreground">
              Metas Ativas
            </CardTitle>
            <Target className="h-4 w-4 text-goal-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-goal-foreground">
              {activeGoals.length}
            </div>
            <p className="text-xs text-goal-foreground/80">
              {activeGoals.filter(g => g.currentAmount >= g.targetAmount).length} concluídas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Transações Recentes</span>
            </CardTitle>
            <Link to="/reports">
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">💸</div>
                <p>Nenhuma transação ainda</p>
                <Link to="/add-transaction">
                  <Button variant="outline" size="sm" className="mt-2">
                    Adicionar primeira transação
                  </Button>
                </Link>
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getTransactionIcon(transaction.category)}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    transaction.type === 'income' ? 'text-income' : 'text-expense'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Metas em Andamento</span>
            </CardTitle>
            <Link to="/goals">
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGoals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">🎯</div>
                <p>Nenhuma meta definida</p>
                <Link to="/goals">
                  <Button variant="outline" size="sm" className="mt-2">
                    Criar primeira meta
                  </Button>
                </Link>
              </div>
            ) : (
              activeGoals.map((goal) => {
                const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                const isCompleted = goal.currentAmount >= goal.targetAmount;
                
                return (
                  <div key={goal.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{goal.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                      {isCompleted && (
                        <div className="text-2xl animate-bounce">🎉</div>
                      )}
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {progress.toFixed(1)}% concluído
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/add-transaction">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                <Plus className="h-6 w-6" />
                <span>Adicionar</span>
              </Button>
            </Link>
            <Link to="/goals">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                <Target className="h-6 w-6" />
                <span>Criar Meta</span>
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span>Relatórios</span>
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                <Calendar className="h-6 w-6" />
                <span>Backup</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}