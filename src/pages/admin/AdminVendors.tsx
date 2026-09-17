import { useState, useRef } from 'react';
import { Plus, Edit, Trash2, X, Upload, Store, CheckCircle, XCircle, Shield, Mail, Phone, MapPin, Percent, Building2, Key, UserPlus } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor, useToggleVendorStatus, useVerifyVendor, Vendor } from '@/hooks/useVendors';
import { usePartnerLogoUpload } from '@/hooks/usePartnerLogoUpload';
import { useCreateVendorAccount } from '@/hooks/useVendorAdmin';
import { toast } from 'sonner';
import { CURRENCY } from '@/types';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

const AdminVendors = () => {
  const { data: vendors, isLoading } = useVendors();
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();
  const toggleStatus = useToggleVendorStatus();
  const verifyVendor = useVerifyVendor();
  const createVendorAccount = useCreateVendorAccount();
  const { uploadLogo, uploading } = usePartnerLogoUpload();

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedVendorForAccount, setSelectedVendorForAccount] = useState<Vendor | null>(null);
  const [accountPassword, setAccountPassword] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    logo_url: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    address_country: 'Tunisie',
    commission_rate: 10,
    is_active: true,
    is_verified: false,
    bank_name: '',
    account_number: '',
    rib: '',
  });

  const openModal = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone || '',
        description: vendor.description || '',
        logo_url: vendor.logo_url || '',
        address_street: vendor.address_street || '',
        address_city: vendor.address_city || '',
        address_state: vendor.address_state || '',
        address_zip: vendor.address_zip || '',
        address_country: vendor.address_country || 'Tunisie',
        commission_rate: vendor.commission_rate,
        is_active: vendor.is_active,
        is_verified: vendor.is_verified,
        bank_name: vendor.bank_name || '',
        account_number: vendor.account_number || '',
        rib: vendor.rib || '',
      });
      setLogoPreview(vendor.logo_url || '');
    } else {
      setEditingVendor(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        description: '',
        logo_url: '',
        address_street: '',
        address_city: '',
        address_state: '',
        address_zip: '',
        address_country: 'Tunisie',
        commission_rate: 10,
        is_active: true,
        is_verified: false,
        bank_name: '',
        account_number: '',
        rib: '',
      });
      setLogoPreview('');
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
    setSelectedFile(null);
    setLogoPreview('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let logoUrl = formData.logo_url;

    // Upload logo if a new file is selected
    if (selectedFile) {
      const uploadedUrl = await uploadLogo(selectedFile);
      if (uploadedUrl) {
        logoUrl = uploadedUrl;
      }
    }

    const vendorData = {
      ...formData,
      logo_url: logoUrl,
    };

    try {
      if (editingVendor) {
        await updateVendor.mutateAsync({ id: editingVendor.id, ...vendorData });
        toast.success('Vendeur modifié');
      } else {
        await createVendor.mutateAsync(vendorData);
        toast.success('Vendeur créé');
      }
      closeModal();
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce vendeur ?')) {
      try {
        await deleteVendor.mutateAsync(id);
        toast.success('Vendeur supprimé');
      } catch (error) {
        toast.error('Une erreur est survenue');
      }
    }
  };

  const handleToggleStatus = async (vendor: Vendor) => {
    try {
      await toggleStatus.mutateAsync({ id: vendor.id, is_active: !vendor.is_active });
      toast.success(vendor.is_active ? 'Vendeur désactivé' : 'Vendeur activé');
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await verifyVendor.mutateAsync(id);
      toast.success('Vendeur vérifié');
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  };

  const openAccountModal = (vendor: Vendor) => {
    setSelectedVendorForAccount(vendor);
    setAccountPassword('');
    setIsAccountModalOpen(true);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForAccount || !accountPassword) return;

    try {
      await createVendorAccount.mutateAsync({
        vendorId: selectedVendorForAccount.id,
        email: selectedVendorForAccount.email,
        password: accountPassword,
      });
      setIsAccountModalOpen(false);
      setSelectedVendorForAccount(null);
      setAccountPassword('');
    } catch (error) {
      // Error handled by hook
    }
  };

  // Stats
  const totalVendors = vendors?.length || 0;
  const activeVendors = vendors?.filter(v => v.is_active).length || 0;
  const verifiedVendors = vendors?.filter(v => v.is_verified).length || 0;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-light">Vendeurs</h1>
          <p className="text-muted-foreground text-sm mt-1">Gérez vos vendeurs partenaires</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Ajouter un vendeur
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card p-4 rounded-lg shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Store size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{totalVendors}</p>
              <p className="text-xs text-muted-foreground">Total vendeurs</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-muted rounded-full">
              <CheckCircle size={20} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{activeVendors}</p>
              <p className="text-xs text-muted-foreground">Vendeurs actifs</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-info-muted rounded-full">
              <Shield size={20} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{verifiedVendors}</p>
              <p className="text-xs text-muted-foreground">Vendeurs vérifiés</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : vendors && vendors.length > 0 ? (
        <div className="bg-card rounded-lg overflow-hidden shadow-soft">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  Vendeur
                </th>
                <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  Contact
                </th>
                <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  Commission
                </th>
                <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  Statut
                </th>
                <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  Vérifié
                </th>
                <th className="text-right p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-t border-border">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {vendor.logo_url ? (
                          <img
                            src={vendor.logo_url}
                            alt={vendor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store size={20} className="text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium">{vendor.name}</span>
                        {vendor.address_city && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin size={12} />
                            {vendor.address_city}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1">
                        <Mail size={12} className="text-muted-foreground" />
                        {vendor.email}
                      </p>
                      {vendor.phone && (
                        <p className="text-sm flex items-center gap-1">
                          <Phone size={12} className="text-muted-foreground" />
                          {vendor.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1">
                      <Percent size={14} className="text-muted-foreground" />
                      {vendor.commission_rate}%
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(vendor)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        vendor.is_active
                          ? 'bg-success-muted text-success-foreground hover:bg-success-muted/80'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      } transition-colors`}
                    >
                      {vendor.is_active ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="p-4">
                    {vendor.is_verified ? (
                      <span className="flex items-center gap-1 text-info">
                        <Shield size={16} />
                        <span className="text-xs">Vérifié</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleVerify(vendor.id)}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Vérifier
                      </button>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {!vendor.user_id && (
                      <button
                        onClick={() => openAccountModal(vendor)}
                        className="p-2 hover:bg-muted rounded transition-colors text-info"
                        title="Créer un compte"
                      >
                        <UserPlus size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => openModal(vendor)}
                      className="p-2 hover:bg-muted rounded transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="p-2 hover:bg-muted rounded transition-colors text-destructive"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg">
          <Store size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Aucun vendeur</p>
          <button onClick={() => openModal()} className="btn-outline">
            Ajouter votre premier vendeur
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="font-serif text-xl font-light">
                {editingVendor ? 'Modifier le vendeur' : 'Nouveau vendeur'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-muted rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Logo du vendeur</label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-border rounded-full flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload size={24} className="text-muted-foreground" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="text-sm text-muted-foreground">
                    <p>Cliquez pour uploader</p>
                    <p className="text-xs">PNG, JPG (max 2MB)</p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom du vendeur *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input-elegant"
                    placeholder="Ex: Boutique Mode"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="input-elegant"
                    placeholder="contact@vendeur.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-elegant"
                    placeholder="+216 XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Taux de commission (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                    className="input-elegant"
                  />
                </div>
              </div>

              <div className="mt-4">
                <RichTextEditor
                  label="Description"
                  value={formData.description}
                  onChange={(val) => setFormData({ ...formData, description: val })}
                  rows={3}
                />
              </div>

              {/* Address */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <MapPin size={16} />
                  Adresse
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Rue</label>
                    <input
                      type="text"
                      value={formData.address_street}
                      onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                      className="input-elegant"
                      placeholder="123 Rue Principale"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ville</label>
                    <input
                      type="text"
                      value={formData.address_city}
                      onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                      className="input-elegant"
                      placeholder="Tunis"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Code postal</label>
                    <input
                      type="text"
                      value={formData.address_zip}
                      onChange={(e) => setFormData({ ...formData, address_zip: e.target.value })}
                      className="input-elegant"
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Building2 size={16} />
                  Informations bancaires
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Banque</label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className="input-elegant"
                      placeholder="Nom de la banque"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">RIB</label>
                    <input
                      type="text"
                      value={formData.rib}
                      onChange={(e) => setFormData({ ...formData, rib: e.target.value })}
                      className="input-elegant"
                      placeholder="XX XXXXX XXXXX XX"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_active" className="text-sm">Vendeur actif</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_verified"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="is_verified" className="text-sm flex items-center gap-1">
                    <Shield size={14} className="text-info" />
                    Vendeur vérifié
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button type="button" onClick={closeModal} className="btn-outline flex-1">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createVendor.isPending || updateVendor.isPending || uploading}
                  className="btn-primary flex-1"
                >
                  {createVendor.isPending || updateVendor.isPending || uploading
                    ? 'Enregistrement...'
                    : editingVendor
                    ? 'Modifier'
                    : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {isAccountModalOpen && selectedVendorForAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="font-serif text-xl font-light">Créer un compte vendeur</h2>
              <button onClick={() => setIsAccountModalOpen(false)} className="p-2 hover:bg-muted rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  {selectedVendorForAccount.logo_url ? (
                    <img
                      src={selectedVendorForAccount.logo_url}
                      alt={selectedVendorForAccount.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Store size={20} className="text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{selectedVendorForAccount.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedVendorForAccount.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Key size={14} className="inline mr-1" />
                  Mot de passe du compte
                </label>
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  required
                  minLength={8}
                  className="input-elegant"
                  placeholder="Minimum 8 caractères"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Le vendeur utilisera son email ({selectedVendorForAccount.email}) et ce mot de passe pour se connecter.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="btn-outline flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createVendorAccount.isPending}
                  className="btn-primary flex-1"
                >
                  {createVendorAccount.isPending ? 'Création...' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVendors;
