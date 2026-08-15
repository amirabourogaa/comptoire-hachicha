import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePaymentSettings, useUpdatePaymentSettings, usePaymentTransactions, PaymentSettings } from '@/hooks/usePaymentSettings';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, CreditCard, Settings, List, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { CURRENCY } from '@/types';

export default function AdminPaymentSettings() {
  const { data: settings, isLoading } = usePaymentSettings();
  const { data: transactions, isLoading: isLoadingTx } = usePaymentTransactions();
  const updateSettings = useUpdatePaymentSettings();
  const { toast } = useToast();

  const [config, setConfig] = useState<PaymentSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (settings) setConfig(settings);
  }, [settings]);

  const updateField = <K extends keyof PaymentSettings>(key: K, value: PaymentSettings[K]) => {
    setConfig(prev => prev ? { ...prev, [key]: value } : prev);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!config) return;
    try {
      await updateSettings.mutateAsync(config);
      setHasChanges(false);
      toast({ title: 'Succès', description: 'Les paramètres de paiement ont été sauvegardés.' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  if (isLoading || !config) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-blue-100 text-blue-800',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Paiement en ligne
            </h1>
            <p className="text-muted-foreground mt-1">
              Configurez votre passerelle de paiement et consultez les transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={config.is_enabled ? 'default' : 'secondary'}>
              {config.is_enabled ? 'Activé' : 'Désactivé'}
            </Badge>
            {config.test_mode && config.is_enabled && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Mode Test
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Enable/Disable */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activation</CardTitle>
                <CardDescription>Activez le paiement en ligne pour vos clients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Paiement en ligne</Label>
                    <p className="text-xs text-muted-foreground">Les clients pourront payer en ligne lors du checkout</p>
                  </div>
                  <Switch checked={config.is_enabled} onCheckedChange={(v) => updateField('is_enabled', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Mode Test</Label>
                    <p className="text-xs text-muted-foreground">Utilisez les clés de test de votre passerelle</p>
                  </div>
                  <Switch checked={config.test_mode} onCheckedChange={(v) => updateField('test_mode', v)} />
                </div>
              </CardContent>
            </Card>

            {/* Gateway Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Configuration de la passerelle
                </CardTitle>
                <CardDescription>Entrez les informations de votre passerelle de paiement (Konnect, Flouci, Stripe, etc.)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom de la passerelle</Label>
                    <Input
                      value={config.gateway_name}
                      onChange={(e) => updateField('gateway_name', e.target.value)}
                      placeholder="ex: Konnect, Flouci, Stripe..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Devise</Label>
                    <Input
                      value={config.currency}
                      onChange={(e) => updateField('currency', e.target.value)}
                      placeholder="TND"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>URL de l'API</Label>
                  <Input
                    value={config.api_url}
                    onChange={(e) => updateField('api_url', e.target.value)}
                    placeholder="https://api.gateway.com/v1/payments"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Clé API (Publishable Key)</Label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={config.api_key}
                      onChange={(e) => updateField('api_key', e.target.value)}
                      placeholder="pk_..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Clé secrète (Secret Key)</Label>
                  <div className="relative">
                    <Input
                      type={showSecret ? 'text' : 'password'}
                      value={config.secret_key}
                      onChange={(e) => updateField('secret_key', e.target.value)}
                      placeholder="sk_..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">⚠️ Ne partagez jamais cette clé</p>
                </div>

                <div className="space-y-2">
                  <Label>URL Webhook (optionnel)</Label>
                  <Input
                    value={config.webhook_url}
                    onChange={(e) => updateField('webhook_url', e.target.value)}
                    placeholder="https://votre-site.com/api/webhook"
                  />
                </div>

                <Button onClick={handleSave} disabled={!hasChanges || updateSettings.isPending} className="w-full">
                  {updateSettings.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Enregistrer la configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Historique des transactions</CardTitle>
                <CardDescription>Toutes les transactions de paiement</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTx ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !transactions?.length ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Aucune transaction pour le moment</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Méthode</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>ID Transaction</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx: any) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-sm">
                              {new Date(tx.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">{tx.customer_name || '-'}</p>
                                <p className="text-xs text-muted-foreground">{tx.customer_email || ''}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {tx.amount} {tx.currency}
                            </TableCell>
                            <TableCell className="text-sm">{tx.payment_method || tx.gateway_name || '-'}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[tx.status] || 'bg-gray-100 text-gray-800'}`}>
                                {tx.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground">
                              {tx.gateway_transaction_id || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
