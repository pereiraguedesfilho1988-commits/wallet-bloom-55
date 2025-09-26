// 💰 Minha Conta - Add Transaction Page

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Repeat, Calendar, Tag, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import { Transaction, Category } from '@/types/financial';
import PageHeader from '@/components/PageHeader';

export default function AddTransaction() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser] = useState(storage.getCurrentUser());
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCategories(storage.getCategories());
  }, []);

  const filteredCategories = categories.filter(cat => 
    cat.type === type || cat.type === 'both'
  );

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const cleanValue = value.replace(/[^\d.,]/g, '');
    setAmount(cleanValue);
  };

  const parseAmount = (value: string): number => {
    return parseFloat(value.replace(',', '.')) || 0;
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive"
      });
      return;
    }

    const parsedAmount = parseAmount(amount);
    
    if (parsedAmount <= 0) {
      toast({
        title: "Erro",
        description: "O valor deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }

    if (!category) {
      toast({
        title: "Erro",
        description: "Selecione uma categoria",
        variant: "destructive"
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Erro",
        description: "Adicione uma descrição",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const transaction: Transaction = {
        id: storage.generateId(),
        type,
        amount: parsedAmount,
        category,
        description: description.trim(),
        date,
        tags,
        userId: currentUser.id,
        recurring: isRecurring ? {
          frequency: recurringFrequency,
          nextDate: getNextRecurringDate(date, recurringFrequency)
        } : undefined
      };

      storage.addTransaction(transaction);

      // Show success animation
      toast({
        title: "✅ Sucesso!",
        description: `${type === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso!`,
        className: "success-bounce"
      });

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
      setTags([]);
      setIsRecurring(false);
      
      // Navigate back after a short delay for the success animation
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar transação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNextRecurringDate = (currentDate: string, frequency: string): string => {
    const date = new Date(currentDate);
    
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return date.toISOString().split('T')[0];
  };

  const formatCurrency = (value: string) => {
    const numericValue = parseAmount(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <PageHeader
          title="Adicionar Transação"
          description="Registre suas receitas e despesas"
          icon={Plus}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Type */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Tipo de Transação</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={type === 'income' ? 'default' : 'outline'}
                className={`h-16 ${type === 'income' ? 'income-card text-income-foreground' : ''}`}
                onClick={() => setType('income')}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-2xl">💰</span>
                  <span>Receita</span>
                </div>
              </Button>
              <Button
                type="button"
                variant={type === 'expense' ? 'default' : 'outline'}
                className={`h-16 ${type === 'expense' ? 'expense-card text-expense-foreground' : ''}`}
                onClick={() => setType('expense')}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-2xl">💸</span>
                  <span>Despesa</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Amount */}
        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="text"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="text-2xl font-bold h-16 text-center"
                  required
                />
                {amount && (
                  <div className="mt-2 text-center text-lg font-medium text-muted-foreground">
                    {formatCurrency(amount)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="financial-card">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center space-x-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="financial-card">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva a transação..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="h-5 w-5" />
              <span>Tags (Opcional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Adicionar tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recurring */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Repeat className="h-5 w-5" />
              <span>Transação Recorrente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="recurring">Repetir transação</Label>
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>
            
            {isRecurring && (
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select value={recurringFrequency} onValueChange={(value: any) => setRecurringFrequency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diariamente</SelectItem>
                    <SelectItem value="weekly">Semanalmente</SelectItem>
                    <SelectItem value="monthly">Mensalmente</SelectItem>
                    <SelectItem value="yearly">Anualmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-14 text-lg font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Salvando...</span>
            </div>
          ) : (
            <>
              <Plus className="h-5 w-5 mr-2" />
              Adicionar {type === 'income' ? 'Receita' : 'Despesa'}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}