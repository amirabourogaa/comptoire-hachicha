import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminUsers, ALL_SECTIONS, AdminRole, AdminSection, useCurrentAdminPermissions } from '@/hooks/useAdminUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Shield, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminUsers = () => {
  const { 
    adminUsers, 
    isLoading, 
    createAdmin, 
    isCreating,
    updatePermissions,
    isUpdating,
    deleteAdmin,
    isDeleting 
  } = useAdminUsers();

  const { role: currentUserRole } = useCurrentAdminPermissions();
  const isSuperAdmin = currentUserRole === 'super_admin';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  
  // Form state for creating admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('admin');
  const [selectedPermissions, setSelectedPermissions] = useState<AdminSection[]>([]);

  const handleCreate = () => {
    createAdmin(
      { email, password, role, permissions: selectedPermissions },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          resetForm();
        },
      }
    );
  };

  const handleEditPermissions = (userId: string, currentPermissions: AdminSection[]) => {
    setEditingUser(userId);
    setSelectedPermissions(currentPermissions);
    setIsEditOpen(true);
  };

  const handleSavePermissions = () => {
    if (editingUser) {
      updatePermissions(
        { userId: editingUser, permissions: selectedPermissions },
        {
          onSuccess: () => {
            setIsEditOpen(false);
            setEditingUser(null);
          },
        }
      );
    }
  };

  const handleDelete = (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
      deleteAdmin(userId);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setRole('admin');
    setSelectedPermissions([]);
  };

  const togglePermission = (section: AdminSection) => {
    setSelectedPermissions(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(ALL_SECTIONS.map(s => s.value));
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-light">Gestion des Administrateurs</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gérez les comptes admin et leurs permissions
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un administrateur</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@exemple.com"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 6 caractères
                  </p>
                </div>

                <div>
                  <Label htmlFor="role">Rôle</Label>
                  {isSuperAdmin ? (
                    <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            Super Admin (tous les accès)
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admin (accès limités)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">Admin (accès limités)</span>
                    </div>
                  )}
                </div>

                {role === 'admin' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Rubriques autorisées</Label>
                      <div className="space-x-2">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={selectAllPermissions}
                        >
                          Tout
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={clearAllPermissions}
                        >
                          Aucun
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 border rounded-md p-3">
                      {ALL_SECTIONS.map((section) => (
                        <div key={section.value} className="flex items-center gap-2">
                          <Checkbox
                            id={section.value}
                            checked={selectedPermissions.includes(section.value)}
                            onCheckedChange={() => togglePermission(section.value)}
                          />
                          <label 
                            htmlFor={section.value}
                            className="text-sm cursor-pointer"
                          >
                            {section.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleCreate} 
                  disabled={isCreating || !email || !password}
                  className="w-full"
                >
                  {isCreating ? 'Création...' : 'Créer l\'administrateur'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Admin list */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rôle</TableHead>
                <TableHead>ID Utilisateur</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Aucun administrateur configuré
                  </TableCell>
                </TableRow>
              ) : (
                adminUsers.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <Badge 
                        variant={admin.role === 'super_admin' ? 'default' : 'secondary'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {admin.role === 'super_admin' ? (
                          <><ShieldCheck className="h-3 w-3" /> Super Admin</>
                        ) : (
                          <><Shield className="h-3 w-3" /> Admin</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {admin.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {admin.role === 'super_admin' ? (
                        <span className="text-sm text-muted-foreground">Tous les accès</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.length === 0 ? (
                            <span className="text-sm text-muted-foreground">Aucune</span>
                          ) : (
                            admin.permissions.map(p => (
                              <Badge key={p} variant="outline" className="text-xs">
                                {ALL_SECTIONS.find(s => s.value === p)?.label || p}
                              </Badge>
                            ))
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(admin.created_at), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {admin.role !== 'super_admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPermissions(admin.user_id, admin.permissions)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(admin.user_id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit permissions dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier les permissions</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Rubriques autorisées</Label>
                <div className="space-x-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={selectAllPermissions}
                  >
                    Tout
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={clearAllPermissions}
                  >
                    Aucun
                  </Button>
                </div>
              </div>
              <div className="space-y-2 border rounded-md p-3">
                {ALL_SECTIONS.map((section) => (
                  <div key={section.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`edit-${section.value}`}
                      checked={selectedPermissions.includes(section.value)}
                      onCheckedChange={() => togglePermission(section.value)}
                    />
                    <label 
                      htmlFor={`edit-${section.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {section.label}
                    </label>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleSavePermissions} 
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating ? 'Enregistrement...' : 'Enregistrer les permissions'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
