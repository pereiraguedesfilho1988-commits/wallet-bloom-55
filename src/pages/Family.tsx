// 💰 Minha Conta - Family Page

import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Crown, User, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import { User as UserType, Transaction } from '@/types/financial';
import PageHeader from '@/components/PageHeader';

const AVATAR_OPTIONS = [
  '👤', '👨', '👩', '🧑', '👦', '👧', '👴', '👵',
  '💼', '👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '👨‍⚕️', '👩‍⚕️',
  '🎯', '💰', '📊', '🏆', '⭐', '🎉', '🚀', '💎'
];

export default function Family() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState(storage.getCurrentUser());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [colorScheme, setColorScheme] = useState<'default' | 'masculine' | 'feminine'>('default');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(storage.getUsers());
    setTransactions(storage.getTransactions());
  };

  const resetForm = () => {
    setName('');
    setAvatar('👤');
    setColorScheme('default');
    setEditingUser(null);
  };

  const openEditDialog = (user: UserType) => {
    setEditingUser(user);
    setName(user.name);
    setAvatar(user.avatar);
    setColorScheme(user.colorScheme);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const updatedUsers = users.map(u => 
          u.id === editingUser.id 
            ? { ...u, name: name.trim(), avatar, colorScheme }
            : u
        );
        storage.saveUsers(updatedUsers);
        
        // Update current user if it's the one being edited
        if (currentUser?.id === editingUser.id) {
          const updatedCurrentUser = { ...currentUser, name: name.trim(), avatar, colorScheme };
          setCurrentUser(updatedCurrentUser);
        }
        
        toast({
          title: "✅ Perfil atualizado!",
          description: "As informações foram atualizadas com sucesso",
          className: "success-bounce"
        });
      } else {
        // Create new user
        const newUser: UserType = {
          id: storage.generateId(),
          name: name.trim(),
          avatar,
          theme: 'light',
          colorScheme,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        
        const updatedUsers = [...users, newUser];
        storage.saveUsers(updatedUsers);
        
        toast({
          title: "👨‍👩‍👧‍👦 Novo membro adicionado!",
          description: `${name} foi adicionado à família`,
          className: "success-bounce"
        });
      }
      
      loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar informações do usuário",
        variant: "destructive"
      });
    }
  };

  const deleteUser = (userId: string) => {
    if (users.length <= 1) {
      toast({
        title: "Erro",
        description: "Deve haver pelo menos um usuário no sistema",
        variant: "destructive"
      });
      return;
    }

    if (currentUser?.id === userId) {
      toast({
        title: "Erro",
        description: "Não é possível excluir o usuário ativo",
        variant: "destructive"
      });
      return;
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    storage.saveUsers(updatedUsers);
    
    // Also remove transactions from this user
    const userTransactions = transactions.filter(t => t.userId !== userId);
    storage.saveTransactions(userTransactions);
    
    loadData();
    toast({
      title: "Usuário removido",
      description: "O usuário e suas transações foram removidos"
    });
  };

  const switchUser = (userId: string) => {
    storage.setCurrentUser(userId);
    const newCurrentUser = users.find(u => u.id === userId);
    setCurrentUser(newCurrentUser || null);
    
    toast({
      title: "Usuário alterado",
      description: `Agora você está usando o perfil de ${newCurrentUser?.name}`,
      className: "success-bounce"
    });
  };

  const getUserTransactionsSummary = (userId: string) => {
    const userTransactions = transactions.filter(t => t.userId === userId);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthTransactions = userTransactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: monthTransactions.length
    };
  };

  const getFamilySummary = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      totalTransactions: monthTransactions.length
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const familySummary = getFamilySummary();

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Gestão Familiar"
        description="Gerencie os perfis da família e acompanhe gastos individuais"
        icon={Users}
      >
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="secondary">
              <Plus className="h-5 w-5 mr-2" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Perfil' : 'Adicionar Novo Membro'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome do membro da família"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="grid grid-cols-8 gap-2">
                  {AVATAR_OPTIONS.map((avatarOption) => (
                    <button
                      key={avatarOption}
                      type="button"
                      className={`w-10 h-10 text-lg border-2 rounded-lg hover:scale-110 transition-transform ${
                        avatar === avatarOption 
                          ? 'border-primary bg-primary/10' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => setAvatar(avatarOption)}
                    >
                      {avatarOption}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tema de Cores</Label>
                <Select value={colorScheme} onValueChange={(value: any) => setColorScheme(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="masculine">Masculino (azul/verde)</SelectItem>
                    <SelectItem value="feminine">Feminino (rosa/lilás)</SelectItem>
                  </SelectContent>
                </Select>
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
                  {editingUser ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Family Summary */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Resumo Familiar - Este Mês</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(familySummary.balance)}</p>
              <p className="text-sm text-muted-foreground">Saldo Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-income">{formatCurrency(familySummary.totalIncome)}</p>
              <p className="text-sm text-muted-foreground">Receitas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-expense">{formatCurrency(familySummary.totalExpenses)}</p>
              <p className="text-sm text-muted-foreground">Despesas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{familySummary.totalTransactions}</p>
              <p className="text-sm text-muted-foreground">Transações</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Members */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Membros da Família</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => {
            const summary = getUserTransactionsSummary(user.id);
            const isCurrentUser = currentUser?.id === user.id;
            
            return (
              <Card key={user.id} className={`financial-card ${isCurrentUser ? 'border-primary bg-primary/5' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="text-3xl">{user.avatar}</div>
                        {isCurrentUser && (
                          <Crown className="absolute -top-1 -right-1 h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{user.name}</span>
                          {isCurrentUser && <UserCheck className="h-4 w-4 text-primary" />}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {users.length > 1 && !isCurrentUser && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover membro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O usuário "{user.name}" e todas as suas transações serão permanentemente removidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteUser(user.id)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* User's monthly summary */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-income">{formatCurrency(summary.income)}</p>
                      <p className="text-xs text-muted-foreground">Receitas</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-expense">{formatCurrency(summary.expenses)}</p>
                      <p className="text-xs text-muted-foreground">Despesas</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{summary.transactionCount}</p>
                      <p className="text-xs text-muted-foreground">Transações</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`font-bold ${summary.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                          {formatCurrency(summary.balance)}
                        </p>
                        <p className="text-xs text-muted-foreground">Saldo do mês</p>
                      </div>
                      
                      {!isCurrentUser && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => switchUser(user.id)}
                        >
                          <User className="h-4 w-4 mr-1" />
                          Usar Perfil
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <Card className="financial-card">
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum membro cadastrado</h3>
            <p className="text-muted-foreground mb-6">
              Adicione membros da família para controlar gastos individuais
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Adicionar Primeiro Membro
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current User Info */}
      {currentUser && (
        <Card className="financial-card border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-primary" />
              <span>Perfil Ativo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{currentUser.avatar}</div>
              <div>
                <p className="text-lg font-semibold">{currentUser.name}</p>
                <p className="text-sm text-muted-foreground">
                  Todas as transações serão registradas neste perfil
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}