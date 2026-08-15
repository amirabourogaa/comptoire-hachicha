import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, Coupon, CouponInsert } from '@/hooks/useCoupons';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Ticket, Percent, DollarSign, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminCoupons() {
  const { data: coupons, isLoading } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponInsert>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    minimum_amount: 0,
    maximum_uses: null,
    start_date: null,
    end_date: null,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      minimum_amount: 0,
      maximum_uses: null,
      start_date: null,
      end_date: null,
      is_active: true,
    });
    setEditingCoupon(null);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      minimum_amount: coupon.minimum_amount,
      maximum_uses: coupon.maximum_uses,
      start_date: coupon.start_date ? coupon.start_date.split('T')[0] : null,
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : null,
      is_active: coupon.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCoupon) {
        await updateCoupon.mutateAsync({
          id: editingCoupon.id,
          ...formData,
          start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        });
        toast({ title: 'Coupon modifié avec succès' });
      } else {
        await createCoupon.mutateAsync({
          ...formData,
          start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        });
        toast({ title: 'Coupon créé avec succès' });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce coupon ?')) return;
    
    try {
      await deleteCoupon.mutateAsync(id);
      toast({ title: 'Coupon supprimé avec succès' });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le coupon',
        variant: 'destructive',
      });
    }
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.is_active) return { label: 'Inactif', variant: 'secondary' as const };
    
    const now = new Date();
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return { label: 'À venir', variant: 'outline' as const };
    }
    if (coupon.end_date && new Date(coupon.end_date) < now) {
      return { label: 'Expiré', variant: 'destructive' as const };
    }
    if (coupon.maximum_uses && coupon.current_uses >= coupon.maximum_uses) {
      return { label: 'Épuisé', variant: 'destructive' as const };
    }
    return { label: 'Actif', variant: 'default' as const };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Ticket className="h-6 w-6" />
              Coupons de réduction
            </h1>
            <p className="text-muted-foreground">
              Gérez vos codes promotionnels
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingCoupon ? 'Modifier le coupon' : 'Créer un coupon'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCoupon ? 'Modifiez les détails du coupon' : 'Créez un nouveau code promotionnel'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Code *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="PROMO20"
                        required
                        className="uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount_type">Type de remise *</Label>
                      <Select
                        value={formData.discount_type}
                        onValueChange={(value: 'percentage' | 'fixed') => 
                          setFormData({ ...formData, discount_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                          <SelectItem value="fixed">Montant fixe (TND)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount_value">
                        Valeur {formData.discount_type === 'percentage' ? '(%)' : '(TND)'} *
                      </Label>
                      <Input
                        id="discount_value"
                        type="number"
                        min="0"
                        step={formData.discount_type === 'percentage' ? '1' : '0.001'}
                        max={formData.discount_type === 'percentage' ? '100' : undefined}
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minimum_amount">Montant min (TND)</Label>
                      <Input
                        id="minimum_amount"
                        type="number"
                        min="0"
                        step="0.001"
                        value={formData.minimum_amount || ''}
                        onChange={(e) => setFormData({ ...formData, minimum_amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Offre de bienvenue"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Date de début</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date || ''}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value || null })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">Date de fin</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date || ''}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maximum_uses">Utilisations max</Label>
                      <Input
                        id="maximum_uses"
                        type="number"
                        min="1"
                        value={formData.maximum_uses || ''}
                        onChange={(e) => setFormData({ ...formData, maximum_uses: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Illimité"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Statut</Label>
                      <div className="flex items-center gap-2 pt-2">
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <span className="text-sm">{formData.is_active ? 'Actif' : 'Inactif'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createCoupon.isPending || updateCoupon.isPending}>
                    {(createCoupon.isPending || updateCoupon.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingCoupon ? 'Modifier' : 'Créer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des coupons</CardTitle>
            <CardDescription>
              {coupons?.length || 0} coupon(s) configuré(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : coupons && coupons.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Remise</TableHead>
                    <TableHead>Min. requis</TableHead>
                    <TableHead>Validité</TableHead>
                    <TableHead>Utilisations</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                              {coupon.code}
                            </code>
                          </div>
                          {coupon.description && (
                            <span className="text-xs text-muted-foreground">{coupon.description}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {coupon.discount_type === 'percentage' ? (
                              <>
                                <Percent className="h-3 w-3" />
                                {coupon.discount_value}%
                              </>
                            ) : (
                              <>
                                {coupon.discount_value.toFixed(3)} TND
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {coupon.minimum_amount > 0 ? (
                            <span>{coupon.minimum_amount.toFixed(3)} TND</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {coupon.start_date || coupon.end_date ? (
                              <span>
                                {coupon.start_date ? format(new Date(coupon.start_date), 'dd/MM/yy', { locale: fr }) : '∞'}
                                {' → '}
                                {coupon.end_date ? format(new Date(coupon.end_date), 'dd/MM/yy', { locale: fr }) : '∞'}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Permanent</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {coupon.current_uses}
                            {coupon.maximum_uses ? ` / ${coupon.maximum_uses}` : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(coupon)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(coupon.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun coupon configuré</p>
                <p className="text-sm">Créez votre premier code promotionnel</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
