// 💰 Minha Conta - Settings Page

import { useState, useRef } from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash2, RefreshCw, Database, FileText, Shield, Palette, Sun, Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { storage } from '@/lib/storage';
import PageHeader from '@/components/PageHeader';

export default function Settings() {
  const { toast } = useToast();
  const { theme, colorMode, setTheme, setColorMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      const data = storage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `minha-conta-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "✅ Backup criado!",
        description: "Seus dados foram exportados com sucesso",
        className: "success-bounce"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar dados",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = storage.importData(jsonData);
        
        if (success) {
          toast({
            title: "✅ Dados importados!",
            description: "Backup restaurado com sucesso. Recarregue a página para ver as mudanças.",
            className: "success-bounce"
          });
          
          // Reload page after short delay
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Arquivo de backup inválido ou corrompido",
          variant: "destructive"
        });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.readAsText(file);
  };

  const handleClearData = () => {
    storage.clearAllData();
    toast({
      title: "Dados apagados",
      description: "Todos os dados foram removidos. Recarregando...",
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const getStorageStats = () => {
    const transactions = storage.getTransactions();
    const goals = storage.getGoals();
    const users = storage.getUsers();
    const categories = storage.getCategories();
    
    // Calculate approximate storage usage
    const dataSize = JSON.stringify({
      transactions,
      goals,
      users,
      categories
    }).length;
    
    const sizeInKB = (dataSize / 1024).toFixed(2);
    
    return {
      transactions: transactions.length,
      goals: goals.length,
      users: users.length,
      categories: categories.length,
      storageSize: sizeInKB
    };
  };

  const stats = getStorageStats();

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Configurações"
        description="Gerencie seus dados e configurações do aplicativo"
        icon={SettingsIcon}
      />

      {/* Theme Settings */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Aparência</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tema de Cores</Label>
              <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500"></div>
                      <span>Padrão</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="masculine">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-600 to-slate-600"></div>
                      <span>Masculino (Azul/Cinza)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="feminine">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                      <span>Feminino (Rosa/Roxo)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Modo de Cor</Label>
              <Select value={colorMode} onValueChange={(value: any) => setColorMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span>Claro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4" />
                      <span>Escuro</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              🎨 <strong>Prévia:</strong> Seu tema atual é <strong>{
                theme === 'default' ? 'Padrão' : 
                theme === 'masculine' ? 'Masculino' : 'Feminino'
              }</strong> no modo <strong>{colorMode === 'light' ? 'Claro' : 'Escuro'}</strong>.
              As mudanças são aplicadas automaticamente!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Storage Statistics */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Estatísticas de Armazenamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.transactions}</p>
              <p className="text-sm text-muted-foreground">Transações</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-goal">{stats.goals}</p>
              <p className="text-sm text-muted-foreground">Metas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{stats.users}</p>
              <p className="text-sm text-muted-foreground">Usuários</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">{stats.storageSize} KB</p>
              <p className="text-sm text-muted-foreground">Espaço Usado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Backup e Restauração</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Exportar Dados</Label>
            <p className="text-sm text-muted-foreground">
              Faça backup de todas as suas transações, metas e configurações em um arquivo JSON.
            </p>
            <Button 
              onClick={handleExportData} 
              disabled={isExporting}
              className="w-full md:w-auto"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Fazer Backup
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Importar Dados</Label>
            <p className="text-sm text-muted-foreground">
              Restaure seus dados a partir de um arquivo de backup. Isso substituirá todos os dados atuais.
            </p>
            <div className="flex space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="w-full md:w-auto"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Restaurar Backup
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Gerenciamento de Dados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Exportar para CSV</Label>
            <p className="text-sm text-muted-foreground">
              Exporte apenas suas transações em formato CSV para planilhas.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                const transactions = storage.getTransactions();
                const csvContent = [
                  'Data,Tipo,Categoria,Descrição,Valor,Tags',
                  ...transactions.map(t => 
                    `${t.date},${t.type === 'income' ? 'Receita' : 'Despesa'},${t.category},${t.description},${t.amount},"${t.tags.join(', ')}"`
                  )
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `transacoes-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
                
                toast({
                  title: "CSV exportado!",
                  description: "Transações exportadas para planilha"
                });
              }}
              className="w-full md:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="financial-card border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            <span>Zona de Perigo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-destructive">Apagar Todos os Dados</Label>
            <p className="text-sm text-muted-foreground">
              Remove permanentemente todas as transações, metas, usuários e configurações. Esta ação não pode ser desfeita.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full md:w-auto">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Apagar Tudo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso vai permanentemente deletar todos os seus dados:
                    <br />
                    <br />
                    • {stats.transactions} transações
                    <br />
                    • {stats.goals} metas
                    <br />
                    • {stats.users} usuários
                    <br />
                    • Todas as configurações
                    <br />
                    <br />
                    <strong>Certifique-se de ter um backup antes de continuar!</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sim, apagar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle>Informações do App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nome:</span>
            <span className="font-medium">💰 Minha Conta</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versão:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Armazenamento:</span>
            <span className="font-medium">Local (Navegador)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Privacidade:</span>
            <span className="font-medium text-income">100% Offline</span>
          </div>
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Seus dados ficam salvos apenas no seu navegador. 
              Faça backups regularmente para não perder suas informações!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}