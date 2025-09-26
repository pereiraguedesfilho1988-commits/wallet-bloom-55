// 💰 Minha Conta - Goals Page

import { useState, useEffect } from 'react';
import { Plus, Target, Calendar, Trophy, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import { Goal } from '@/types/financial';
import PageHeader from '@/components/PageHeader';

export default function Goals() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentUser] = useState(storage.getCurrentUser());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const allGoals = storage.getGoals();
    const userGoals = currentUser 
      ? allGoals.filter(g => g.userId === currentUser.id)
      : allGoals;
    setGoals(userGoals);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetAmount('');
    setDeadline('');
    setCategory('');
    setEditingGoal(null);
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description);
    setTargetAmount(goal.targetAmount.toString());
    setDeadline(goal.deadline);
    setCategory(goal.category);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive"
      });
      return;
    }

    const parsedAmount = parseFloat(targetAmount.replace(',', '.'));
    
    if (parsedAmount <= 0) {
      toast({
        title: "Erro",
        description: "O valor da meta deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingGoal) {
        // Update existing goal
        storage.updateGoal(editingGoal.id, {
          title: title.trim(),
          description: description.trim(),
          targetAmount: parsedAmount,
          deadline,
          category: category.trim()
        });
        
        toast({
          title: "✅ Meta atualizada!",
          description: "Sua meta foi atualizada com sucesso",
          className: "success-bounce"
        });
      } else {
        // Create new goal
        const newGoal: Goal = {
          id: storage.generateId(),
          title: title.trim(),
          description: description.trim(),
          targetAmount: parsedAmount,
          currentAmount: 0,
          deadline,
          category: category.trim() || 'Geral',
          userId: currentUser.id,
          isActive: true,
          createdAt: new Date().toISOString()
        };

        storage.addGoal(newGoal);
        
        toast({
          title: "🎯 Nova meta criada!",
          description: "Sua meta foi criada com sucesso",
          className: "success-bounce"
        });
      }
      
      loadGoals();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar meta",
        variant: "destructive"
      });
    }
  };

  const deleteGoal = (goalId: string) => {
    storage.deleteGoal(goalId);
    loadGoals();
    toast({
      title: "Meta excluída",
      description: "A meta foi removida com sucesso"
    });
  };

  const toggleGoalStatus = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      storage.updateGoal(goalId, { isActive: !goal.isActive });
      loadGoals();
      
      toast({
        title: goal.isActive ? "Meta pausada" : "Meta reativada",
        description: goal.isActive 
          ? "A meta foi pausada temporariamente" 
          : "A meta foi reativada"
      });
    }
  };

  const updateGoalProgress = (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const newAmount = Math.max(0, goal.currentAmount + amount);
      storage.updateGoal(goalId, { currentAmount: newAmount });
      loadGoals();
      
      // Check if goal is completed
      if (newAmount >= goal.targetAmount && goal.currentAmount < goal.targetAmount) {
        toast({
          title: "🎉 Meta concluída!",
          description: `Parabéns! Você atingiu a meta "${goal.title}"`,
          className: "success-bounce"
        });
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const activeGoals = goals.filter(g => g.isActive);
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount);

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Minhas Metas"
        description="Defina objetivos financeiros e acompanhe seu progresso"
        icon={Target}
      >
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="goal-card text-goal-foreground">
              <Plus className="h-5 w-5 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Editar Meta' : 'Criar Nova Meta'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Meta</Label>
                <Input
                  id="title"
                  placeholder="Ex: Emergência, Viagem, Casa própria..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva sua meta..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Valor Objetivo</Label>
                  <Input
                    id="targetAmount"
                    type="text"
                    placeholder="5000,00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value.replace(/[^\d.,]/g, ''))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria (Opcional)</Label>
                <Input
                  id="category"
                  placeholder="Ex: Emergência, Lazer, Investimento..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingGoal ? 'Atualizar' : 'Criar'} Meta
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-goal" />
              <div>
                <p className="text-2xl font-bold">{activeGoals.length}</p>
                <p className="text-sm text-muted-foreground">Metas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-income" />
              <div>
                <p className="text-2xl font-bold">{completedGoals.length}</p>
                <p className="text-sm text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(activeGoals.reduce((sum, g) => sum + g.targetAmount, 0))}
                </p>
                <p className="text-sm text-muted-foreground">Total Objetivos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Metas Ativas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const isCompleted = goal.currentAmount >= goal.targetAmount;
              const daysRemaining = getDaysRemaining(goal.deadline);
              
              return (
                <Card key={goal.id} className={`financial-card ${isCompleted ? 'border-income' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center space-x-2">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-income" />
                          ) : (
                            <Target className="h-5 w-5 text-goal" />
                          )}
                          <span>{goal.title}</span>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {goal.description}
                        </p>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(goal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. A meta "{goal.title}" será permanentemente removida.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteGoal(goal.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrency(goal.currentAmount)}</span>
                        <span>{formatCurrency(goal.targetAmount)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-sm">
                        <span className={`font-medium ${
                          daysRemaining < 0 ? 'text-expense' : 
                          daysRemaining < 30 ? 'text-orange-500' : 'text-muted-foreground'
                        }`}>
                          {daysRemaining < 0 
                            ? `${Math.abs(daysRemaining)} dias em atraso`
                            : daysRemaining === 0 
                            ? 'Prazo hoje!'
                            : `${daysRemaining} dias restantes`
                          }
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateGoalProgress(goal.id, -100)}
                          disabled={goal.currentAmount <= 0}
                        >
                          -R$100
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateGoalProgress(goal.id, 100)}
                        >
                          +R$100
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-income" />
            <span>Metas Concluídas</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="financial-card border-income bg-income/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-income" />
                    <span>{goal.title}</span>
                    <div className="text-2xl ml-auto">🎉</div>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {goal.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-income">
                        {formatCurrency(goal.currentAmount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Objetivo: {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleGoalStatus(goal.id)}
                    >
                      Desarquivar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <Card className="financial-card">
          <CardContent className="text-center py-12">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma meta criada</h3>
            <p className="text-muted-foreground mb-6">
              Crie sua primeira meta financeira e comece a construir seu futuro!
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="goal-card text-goal-foreground">
              <Plus className="h-5 w-5 mr-2" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}