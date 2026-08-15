import { useState, useRef, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useSiteSettings, useLogoUrl, useUpdateSiteSetting } from '@/hooks/useSiteSettings';
import { useMultiVendorSetting, useToggleMultiVendor } from '@/hooks/useMultiVendorSetting';
import { useCurrentAdminPermissions } from '@/hooks/useAdminUsers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Loader2, ImageIcon, Palette, Settings, Building2, Save, Info, Store, Navigation, ZoomIn, Share2, Download, FootprintsIcon, Plus, X, Code } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ThemeCustomizer } from '@/components/admin/ThemeCustomizer';
import { NavbarStylePicker } from '@/components/admin/NavbarStylePicker';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

export default function AdminSettings() {
  const { data: allSettings, isLoading: isLoadingSettings } = useSiteSettings();
  const { logoUrl, isLoading: isLoadingLogo } = useLogoUrl();
  const updateSetting = useUpdateSiteSetting();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isSavingSiteName, setIsSavingSiteName] = useState(false);
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [isUploadingAboutImage, setIsUploadingAboutImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aboutImageInputRef = useRef<HTMLInputElement>(null);
  
  // Contact form state
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [footerDescription, setFooterDescription] = useState('');

  // Social links state
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [isSavingSocial, setIsSavingSocial] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteSlogan, setSiteSlogan] = useState('');

  // About section state
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutSubtitle, setAboutSubtitle] = useState('');
  const [aboutDescription, setAboutDescription] = useState('');
  const [aboutImage, setAboutImage] = useState('');
  const [aboutButtonText, setAboutButtonText] = useState('');
  const [aboutButtonLink, setAboutButtonLink] = useState('');

  // Footer config state
  const [footerNavLinks, setFooterNavLinks] = useState<{ label: string; url: string }[]>([]);
  const [footerBottomLinks, setFooterBottomLinks] = useState<{ label: string; url: string }[]>([]);
  const [footerNewsletterTitle, setFooterNewsletterTitle] = useState('');
  const [footerNewsletterText, setFooterNewsletterText] = useState('');
  const [footerCopyright, setFooterCopyright] = useState('');
  const [footerShowSocial, setFooterShowSocial] = useState(true);
  const [isSavingFooter, setIsSavingFooter] = useState(false);

  // Delivery settings state
  const [deliveryFee, setDeliveryFee] = useState('');
  const [deliveryFreeThreshold, setDeliveryFreeThreshold] = useState('');
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);
  const [customCss, setCustomCss] = useState('');
  const [isSavingCss, setIsSavingCss] = useState(false);
  // Initialize forms from settings
  useEffect(() => {
    if (allSettings) {
      // Site name
      setSiteName(allSettings.find(s => s.key === 'site_name')?.value || '');
      setSiteSlogan(allSettings.find(s => s.key === 'site_slogan')?.value || '');
      // Contact info
      const getName = allSettings.find(s => s.key === 'company_name')?.value || 'ATELIER';
      const getEmail = allSettings.find(s => s.key === 'company_email')?.value || '';
      const getPhone = allSettings.find(s => s.key === 'company_phone')?.value || '';
      const getAddress = allSettings.find(s => s.key === 'company_address')?.value || '';
      setCompanyName(getName);
      setCompanyEmail(getEmail);
      setCompanyPhone(getPhone);
      setCompanyAddress(getAddress);
      setFooterDescription(allSettings.find(s => s.key === 'footer_description')?.value || '');

      // About section
      setAboutTitle(allSettings.find(s => s.key === 'about_title')?.value || '');
      setAboutSubtitle(allSettings.find(s => s.key === 'about_subtitle')?.value || '');
      setAboutDescription(allSettings.find(s => s.key === 'about_description')?.value || '');
      setAboutImage(allSettings.find(s => s.key === 'about_image')?.value || '');
      setAboutButtonText(allSettings.find(s => s.key === 'about_button_text')?.value || '');
      setAboutButtonLink(allSettings.find(s => s.key === 'about_button_link')?.value || '');

      // Social links
      setSocialFacebook(allSettings.find(s => s.key === 'social_facebook')?.value || '');
      setSocialInstagram(allSettings.find(s => s.key === 'social_instagram')?.value || '');
      setSocialTiktok(allSettings.find(s => s.key === 'social_tiktok')?.value || '');
      setSocialTwitter(allSettings.find(s => s.key === 'social_twitter')?.value || '');
      setSocialYoutube(allSettings.find(s => s.key === 'social_youtube')?.value || '');

      // Footer config
      try {
        const navLinksRaw = allSettings.find(s => s.key === 'footer_nav_links')?.value;
        setFooterNavLinks(navLinksRaw ? JSON.parse(navLinksRaw) : [
          { label: 'Femme', url: '/category/femme' },
          { label: 'Homme', url: '/category/homme' },
          { label: 'Accessoires', url: '/category/accessoires' },
          { label: 'Nouveautés', url: '/category/nouveautes' },
        ]);
      } catch { setFooterNavLinks([]); }
      setFooterNewsletterTitle(allSettings.find(s => s.key === 'footer_newsletter_title')?.value || 'Newsletter');
      setFooterNewsletterText(allSettings.find(s => s.key === 'footer_newsletter_text')?.value || 'Recevez nos dernières nouveautés et offres exclusives');
      setFooterCopyright(allSettings.find(s => s.key === 'footer_copyright')?.value || '');
      try {
        const bottomLinksRaw = allSettings.find(s => s.key === 'footer_bottom_links')?.value;
        setFooterBottomLinks(bottomLinksRaw ? JSON.parse(bottomLinksRaw) : [
          { label: 'Mentions légales', url: '/legal' },
          { label: 'Confidentialité', url: '/privacy' },
        ]);
      } catch { setFooterBottomLinks([]); }
      setFooterShowSocial(allSettings.find(s => s.key === 'footer_show_social')?.value !== 'false');

      // Delivery settings
      try {
        const deliveryRaw = allSettings.find(s => s.key === 'delivery_settings')?.value;
        if (deliveryRaw) {
          const ds = JSON.parse(deliveryRaw);
          setDeliveryFee(ds.fee?.toString() || '0');
          setDeliveryFreeThreshold(ds.freeThreshold?.toString() || '');
        }
      } catch { /* ignore */ }

      // Custom CSS
      setCustomCss(allSettings.find(s => s.key === 'custom_css')?.value || '');
    }
  }, [allSettings]);

  const handleSaveDelivery = async () => {
    setIsSavingDelivery(true);
    try {
      await updateSetting.mutateAsync({
        key: 'delivery_settings',
        value: JSON.stringify({
          fee: parseFloat(deliveryFee) || 0,
          freeThreshold: deliveryFreeThreshold ? parseFloat(deliveryFreeThreshold) : null,
          enabled: true,
        }),
      });
      toast({ title: 'Frais de livraison sauvegardés' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setIsSavingDelivery(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une image valide.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'L\'image ne doit pas dépasser 5 Mo.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      await updateSetting.mutateAsync({ key: 'logo_url', value: publicUrl });

      toast({
        title: 'Succès',
        description: 'Le logo a été mis à jour avec succès.',
      });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de télécharger le logo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await updateSetting.mutateAsync({ key: 'logo_url', value: null });
      toast({
        title: 'Succès',
        description: 'Le logo a été supprimé. Le nom par défaut sera affiché.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le logo.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveSocialLinks = async () => {
    setIsSavingSocial(true);
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'social_facebook', value: socialFacebook || null }),
        updateSetting.mutateAsync({ key: 'social_instagram', value: socialInstagram || null }),
        updateSetting.mutateAsync({ key: 'social_tiktok', value: socialTiktok || null }),
        updateSetting.mutateAsync({ key: 'social_twitter', value: socialTwitter || null }),
        updateSetting.mutateAsync({ key: 'social_youtube', value: socialYoutube || null }),
      ]);
      toast({
        title: 'Succès',
        description: 'Les liens réseaux sociaux ont été mis à jour.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de sauvegarder.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingSocial(false);
    }
  };

  const handleSaveContactInfo = async () => {
    setIsSavingContact(true);
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'company_name', value: companyName || null }),
        updateSetting.mutateAsync({ key: 'company_email', value: companyEmail || null }),
        updateSetting.mutateAsync({ key: 'company_phone', value: companyPhone || null }),
        updateSetting.mutateAsync({ key: 'company_address', value: companyAddress || null }),
        updateSetting.mutateAsync({ key: 'footer_description', value: footerDescription || null }),
      ]);
      toast({
        title: 'Succès',
        description: 'Les coordonnées ont été mises à jour.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de sauvegarder les coordonnées.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleAboutImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une image valide.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'L\'image ne doit pas dépasser 5 Mo.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingAboutImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `about-${Date.now()}.${fileExt}`;
      const filePath = `about/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      setAboutImage(publicUrl);

      toast({
        title: 'Succès',
        description: 'L\'image a été téléchargée.',
      });
    } catch (error: any) {
      console.error('Error uploading about image:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de télécharger l\'image.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAboutImage(false);
      if (aboutImageInputRef.current) {
        aboutImageInputRef.current.value = '';
      }
    }
  };

  const handleSaveAbout = async () => {
    setIsSavingAbout(true);
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'about_title', value: aboutTitle || null }),
        updateSetting.mutateAsync({ key: 'about_subtitle', value: aboutSubtitle || null }),
        updateSetting.mutateAsync({ key: 'about_description', value: aboutDescription || null }),
        updateSetting.mutateAsync({ key: 'about_image', value: aboutImage || null }),
        updateSetting.mutateAsync({ key: 'about_button_text', value: aboutButtonText || null }),
        updateSetting.mutateAsync({ key: 'about_button_link', value: aboutButtonLink || null }),
      ]);
      toast({
        title: 'Succès',
        description: 'La section À propos a été mise à jour.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de sauvegarder.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingAbout(false);
    }
  };

  const handleSaveFooter = async () => {
    setIsSavingFooter(true);
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'footer_nav_links', value: JSON.stringify(footerNavLinks) }),
        updateSetting.mutateAsync({ key: 'footer_bottom_links', value: JSON.stringify(footerBottomLinks) }),
        updateSetting.mutateAsync({ key: 'footer_newsletter_title', value: footerNewsletterTitle || null }),
        updateSetting.mutateAsync({ key: 'footer_newsletter_text', value: footerNewsletterText || null }),
        updateSetting.mutateAsync({ key: 'footer_copyright', value: footerCopyright || null }),
        updateSetting.mutateAsync({ key: 'footer_show_social', value: footerShowSocial ? 'true' : 'false' }),
      ]);
      toast({ title: 'Succès', description: 'Le footer a été mis à jour.' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Impossible de sauvegarder.', variant: 'destructive' });
    } finally {
      setIsSavingFooter(false);
    }
  };

  const handleSaveFooterWithDescription = async () => {
    setIsSavingFooter(true);
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'footer_description', value: footerDescription || null }),
        updateSetting.mutateAsync({ key: 'footer_nav_links', value: JSON.stringify(footerNavLinks) }),
        updateSetting.mutateAsync({ key: 'footer_bottom_links', value: JSON.stringify(footerBottomLinks) }),
        updateSetting.mutateAsync({ key: 'footer_newsletter_title', value: footerNewsletterTitle || null }),
        updateSetting.mutateAsync({ key: 'footer_newsletter_text', value: footerNewsletterText || null }),
        updateSetting.mutateAsync({ key: 'footer_copyright', value: footerCopyright || null }),
        updateSetting.mutateAsync({ key: 'footer_show_social', value: footerShowSocial ? 'true' : 'false' }),
      ]);
      toast({ title: 'Succès', description: 'Le footer a été mis à jour.' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Impossible de sauvegarder.', variant: 'destructive' });
    } finally {
      setIsSavingFooter(false);
    }
  };

  const { data: isMultiVendorEnabled, isLoading: isLoadingMultiVendor } = useMultiVendorSetting();
  const toggleMultiVendor = useToggleMultiVendor();
  const { role: currentUserRole } = useCurrentAdminPermissions();
  const isSuperAdmin = currentUserRole === 'super_admin';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez les paramètres généraux et l'apparence de votre boutique
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Général
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="marketplace" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Marketplace
              </TabsTrigger>
            )}
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              À propos
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Coordonnées
            </TabsTrigger>
            <TabsTrigger value="navbar" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Navbar
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Thème
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <FootprintsIcon className="h-4 w-4" />
              Footer
            </TabsTrigger>
            <TabsTrigger value="delivery" className="flex items-center gap-2">
              🚚 Livraison
            </TabsTrigger>
            <TabsTrigger value="custom-css" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              CSS personnalisé
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo du site</CardTitle>
                <CardDescription>
                  Téléchargez votre logo personnalisé. Il sera affiché dans l'en-tête du site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingLogo ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-6">
                      <div className="w-48 h-20 border border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt="Logo actuel"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                            <span className="text-xs">Aucun logo</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-sm text-muted-foreground">
                          Format recommandé : PNG ou SVG, max 2 Mo
                        </Label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4 mr-2" />
                            )}
                            {logoUrl ? 'Changer le logo' : 'Télécharger un logo'}
                          </Button>
                          {logoUrl && (
                            <Button
                              variant="destructive"
                              onClick={handleRemoveLogo}
                              disabled={updateSetting.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    {/* Logo size control */}
                    {logoUrl && (
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <ZoomIn className="h-4 w-4" />
                            Taille du logo
                          </Label>
                          <span className="text-sm text-muted-foreground">
                            {allSettings?.find(s => s.key === 'logo_size')?.value || '40'}px
                          </span>
                        </div>
                        <Slider
                          defaultValue={[parseInt(allSettings?.find(s => s.key === 'logo_size')?.value || '40', 10)]}
                          min={20}
                          max={100}
                          step={2}
                          onValueCommit={(value) => {
                            updateSetting.mutate({ key: 'logo_size', value: String(value[0]) });
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          Ajustez la hauteur du logo dans le header et le footer (20px - 100px)
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            {/* Site Name */}
            <Card>
              <CardHeader>
                <CardTitle>Nom du site</CardTitle>
                <CardDescription>
                  Ce nom sera utilisé comme titre dans l'onglet du navigateur.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="SEC"
                  />
                  <Button
                    onClick={async () => {
                      setIsSavingSiteName(true);
                      try {
                        await updateSetting.mutateAsync({ key: 'site_name', value: siteName || null });
                        toast({ title: 'Succès', description: 'Nom du site mis à jour.' });
                      } catch {
                        toast({ title: 'Erreur', description: 'Impossible de sauvegarder.', variant: 'destructive' });
                      } finally {
                        setIsSavingSiteName(false);
                      }
                    }}
                    disabled={isSavingSiteName}
                  >
                    {isSavingSiteName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Enregistrer
                  </Button>
                </div>

                <div className="pt-2">
                  <Label className="text-sm font-medium mb-1.5 block">Slogan du site (barre supérieure Mega)</Label>
                  <div className="flex gap-3">
                    <Input
                      value={siteSlogan}
                      onChange={(e) => setSiteSlogan(e.target.value)}
                      placeholder="Bienvenue sur notre boutique"
                    />
                    <Button
                      onClick={async () => {
                        try {
                          await updateSetting.mutateAsync({ key: 'site_slogan', value: siteSlogan || null });
                          toast({ title: 'Succès', description: 'Slogan mis à jour.' });
                        } catch {
                          toast({ title: 'Erreur', description: 'Impossible de sauvegarder.', variant: 'destructive' });
                        }
                      }}
                      disabled={updateSetting.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Mode Multi-Vendeurs
                </CardTitle>
                <CardDescription>
                  Activez ou désactivez le mode marketplace multi-vendeurs. Lorsqu'il est activé, 
                  des vendeurs externes peuvent créer des comptes et vendre leurs produits sur votre plateforme.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingMultiVendor ? (
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="multi-vendor-toggle" className="text-base font-medium">
                        Activer le mode multi-vendeurs
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {isMultiVendorEnabled 
                          ? "Les vendeurs peuvent créer des produits et catégories (soumis à validation)."
                          : "Seuls les administrateurs peuvent gérer les produits et catégories."
                        }
                      </p>
                    </div>
                    <Switch
                      id="multi-vendor-toggle"
                      checked={isMultiVendorEnabled ?? false}
                      onCheckedChange={(checked) => toggleMultiVendor.mutate(checked)}
                      disabled={toggleMultiVendor.isPending}
                    />
                  </div>
                )}

                {isMultiVendorEnabled && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
                    <h4 className="font-medium text-sm">Fonctionnalités activées :</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Accès au portail vendeur (/vendor)</li>
                      <li>• Création de produits par les vendeurs (validation requise)</li>
                      <li>• Proposition de catégories par les vendeurs (validation requise)</li>
                      <li>• Tableau de bord vendeur personnalisé</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Installation de l'application
                </CardTitle>
                <CardDescription>
                  Activez ou désactivez l'option de téléchargement de l'application (PWA) pour mobile et desktop. 
                  Un lien d'installation apparaîtra dans la barre de navigation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSettings ? (
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="install-app-toggle" className="text-base font-medium">
                        Afficher le lien d'installation
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {allSettings?.find(s => s.key === 'install_app_enabled')?.value === 'true'
                          ? "Le lien 'Installer l'application' est visible dans la navigation."
                          : "Le lien d'installation est masqué."
                        }
                      </p>
                    </div>
                    <Switch
                      id="install-app-toggle"
                      checked={allSettings?.find(s => s.key === 'install_app_enabled')?.value === 'true'}
                      onCheckedChange={(checked) => {
                        updateSetting.mutate({ key: 'install_app_enabled', value: checked ? 'true' : 'false' }, {
                          onSuccess: () => {
                            toast({ title: 'Succès', description: checked ? "Lien d'installation activé." : "Lien d'installation désactivé." });
                          }
                        });
                      }}
                      disabled={updateSetting.isPending}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Section À propos</CardTitle>
                <CardDescription>
                  Personnalisez la section "À propos" affichée sur la page d'accueil.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSettings ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {/* Image preview */}
                    <div className="flex items-start gap-6">
                      <div className="w-40 h-48 border border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden flex-shrink-0">
                        {aboutImage ? (
                          <img
                            src={aboutImage}
                            alt="Image à propos"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                            <span className="text-xs">Aucune image</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 flex-1">
                        <Label className="text-sm text-muted-foreground">
                          Image de la section (max 5 Mo)
                        </Label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => aboutImageInputRef.current?.click()}
                            disabled={isUploadingAboutImage}
                          >
                            {isUploadingAboutImage ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4 mr-2" />
                            )}
                            {aboutImage ? 'Changer l\'image' : 'Télécharger'}
                          </Button>
                          {aboutImage && (
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => setAboutImage('')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Input
                          ref={aboutImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAboutImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="about_title">Titre</Label>
                        <Input
                          id="about_title"
                          value={aboutTitle}
                          onChange={(e) => setAboutTitle(e.target.value)}
                          placeholder="Notre Histoire"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="about_subtitle">Sous-titre</Label>
                        <Input
                          id="about_subtitle"
                          value={aboutSubtitle}
                          onChange={(e) => setAboutSubtitle(e.target.value)}
                          placeholder="Une passion pour la mode"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <RichTextEditor
                        label="Description"
                        value={aboutDescription}
                        onChange={(val) => setAboutDescription(val)}
                        rows={4}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="about_button_text">Texte du bouton</Label>
                        <Input
                          id="about_button_text"
                          value={aboutButtonText}
                          onChange={(e) => setAboutButtonText(e.target.value)}
                          placeholder="En savoir plus"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="about_button_link">Lien du bouton</Label>
                        <Input
                          id="about_button_link"
                          value={aboutButtonLink}
                          onChange={(e) => setAboutButtonLink(e.target.value)}
                          placeholder="/category/nouveautes"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSaveAbout}
                      disabled={isSavingAbout}
                    >
                      {isSavingAbout ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Enregistrer la section À propos
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Coordonnées de l'entreprise</CardTitle>
                <CardDescription>
                  Ces informations seront affichées dans le pied de page du site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSettings ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company_name">Nom de l'entreprise</Label>
                        <Input
                          id="company_name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="ATELIER"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company_email">Email</Label>
                        <Input
                          id="company_email"
                          type="email"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          placeholder="contact@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company_phone">Téléphone</Label>
                        <Input
                          id="company_phone"
                          type="tel"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          placeholder="+216 XX XXX XXX"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <RichTextEditor
                        label="Adresse"
                        value={companyAddress}
                        onChange={(val) => setCompanyAddress(val)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <RichTextEditor
                        label="Description du footer"
                        value={footerDescription}
                        onChange={(val) => setFooterDescription(val)}
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={handleSaveContactInfo}
                      disabled={isSavingContact}
                    >
                      {isSavingContact ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Enregistrer les coordonnées
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Réseaux sociaux
                </CardTitle>
                <CardDescription>
                  Ajoutez vos liens de réseaux sociaux. Ils seront affichés dans la barre de navigation et le pied de page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSettings ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="social_facebook">Facebook</Label>
                        <Input
                          id="social_facebook"
                          value={socialFacebook}
                          onChange={(e) => setSocialFacebook(e.target.value)}
                          placeholder="https://facebook.com/votrepage"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="social_instagram">Instagram</Label>
                        <Input
                          id="social_instagram"
                          value={socialInstagram}
                          onChange={(e) => setSocialInstagram(e.target.value)}
                          placeholder="https://instagram.com/votrepage"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="social_tiktok">TikTok</Label>
                        <Input
                          id="social_tiktok"
                          value={socialTiktok}
                          onChange={(e) => setSocialTiktok(e.target.value)}
                          placeholder="https://tiktok.com/@votrepage"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="social_twitter">X (Twitter)</Label>
                        <Input
                          id="social_twitter"
                          value={socialTwitter}
                          onChange={(e) => setSocialTwitter(e.target.value)}
                          placeholder="https://x.com/votrepage"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="social_youtube">YouTube</Label>
                        <Input
                          id="social_youtube"
                          value={socialYoutube}
                          onChange={(e) => setSocialYoutube(e.target.value)}
                          placeholder="https://youtube.com/@votrepage"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSaveSocialLinks}
                      disabled={isSavingSocial}
                    >
                      {isSavingSocial ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Enregistrer les réseaux sociaux
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navbar">
            <NavbarStylePicker />
          </TabsContent>

          <TabsContent value="theme">
            <ThemeCustomizer />
          </TabsContent>
          <TabsContent value="footer" className="space-y-6">
            {/* Footer Description */}
            <Card>
              <CardHeader>
                <CardTitle>Paragraphe du footer</CardTitle>
                <CardDescription>Texte affiché sous le logo dans le footer.</CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  label="Description"
                  value={footerDescription}
                  onChange={(val) => setFooterDescription(val)}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Footer Navigation Links */}
            <Card>
              <CardHeader>
                <CardTitle>Liens de navigation du footer</CardTitle>
                <CardDescription>Configurez les liens affichés dans la colonne "Boutique" du footer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {footerNavLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={link.label}
                      onChange={(e) => {
                        const updated = [...footerNavLinks];
                        updated[i] = { ...updated[i], label: e.target.value };
                        setFooterNavLinks(updated);
                      }}
                      placeholder="Libellé"
                      className="flex-1"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...footerNavLinks];
                        updated[i] = { ...updated[i], url: e.target.value };
                        setFooterNavLinks(updated);
                      }}
                      placeholder="/category/exemple"
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => setFooterNavLinks(footerNavLinks.filter((_, j) => j !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setFooterNavLinks([...footerNavLinks, { label: '', url: '' }])}>
                  <Plus className="h-4 w-4 mr-2" /> Ajouter un lien
                </Button>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card>
              <CardHeader>
                <CardTitle>Section Newsletter</CardTitle>
                <CardDescription>Personnalisez le titre et la description de la newsletter dans le footer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input value={footerNewsletterTitle} onChange={(e) => setFooterNewsletterTitle(e.target.value)} placeholder="Newsletter" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={footerNewsletterText} onChange={(e) => setFooterNewsletterText(e.target.value)} placeholder="Recevez nos dernières nouveautés..." />
                </div>
              </CardContent>
            </Card>

            {/* Bottom Links */}
            <Card>
              <CardHeader>
                <CardTitle>Liens du bas de page</CardTitle>
                <CardDescription>Liens affichés en bas du footer (mentions légales, etc.).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {footerBottomLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={link.label}
                      onChange={(e) => {
                        const updated = [...footerBottomLinks];
                        updated[i] = { ...updated[i], label: e.target.value };
                        setFooterBottomLinks(updated);
                      }}
                      placeholder="Libellé"
                      className="flex-1"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...footerBottomLinks];
                        updated[i] = { ...updated[i], url: e.target.value };
                        setFooterBottomLinks(updated);
                      }}
                      placeholder="/legal"
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => setFooterBottomLinks(footerBottomLinks.filter((_, j) => j !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setFooterBottomLinks([...footerBottomLinks, { label: '', url: '' }])}>
                  <Plus className="h-4 w-4 mr-2" /> Ajouter un lien
                </Button>
              </CardContent>
            </Card>

            {/* Copyright & Social */}
            <Card>
              <CardHeader>
                <CardTitle>Copyright & Réseaux sociaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Texte copyright (laisser vide pour le texte par défaut)</Label>
                  <Input value={footerCopyright} onChange={(e) => setFooterCopyright(e.target.value)} placeholder="© 2024 MonSite. Tous droits réservés." />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Afficher les réseaux sociaux dans le footer</Label>
                    <p className="text-sm text-muted-foreground">Les icônes de réseaux sociaux configurés dans l'onglet Coordonnées.</p>
                  </div>
                  <Switch checked={footerShowSocial} onCheckedChange={setFooterShowSocial} />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveFooterWithDescription} disabled={isSavingFooter}>
              {isSavingFooter ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer le footer
            </Button>
          </TabsContent>

          {/* Delivery Settings Tab */}
          <TabsContent value="delivery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🚚 Frais de livraison</CardTitle>
                <CardDescription>Configurez les frais de livraison appliqués automatiquement au panier.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Frais de livraison (TND)</Label>
                  <Input type="number" step="0.001" min="0" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="7.000" />
                </div>
                <div className="space-y-2">
                  <Label>Seuil de livraison gratuite (TND)</Label>
                  <Input type="number" step="0.001" min="0" value={deliveryFreeThreshold} onChange={(e) => setDeliveryFreeThreshold(e.target.value)} placeholder="200 (laisser vide si pas de seuil)" />
                  <p className="text-xs text-muted-foreground">Si le total du panier dépasse ce montant, la livraison sera offerte.</p>
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleSaveDelivery} disabled={isSavingDelivery}>
              {isSavingDelivery ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer la livraison
            </Button>
          </TabsContent>

          {/* Custom CSS Tab */}
          <TabsContent value="custom-css" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  CSS personnalisé
                </CardTitle>
                <CardDescription>
                  Ajoutez du CSS personnalisé pour modifier l'apparence de la navbar, des dropdowns, ou de tout autre élément du site. Ce CSS est injecté globalement.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  placeholder={`/* Exemples */\n.navbar { border-radius: 0; }\n.dropdown-menu { background: #333; }\nheader { box-shadow: 0 2px 10px rgba(0,0,0,0.1); }`}
                  className="font-mono text-sm min-h-[300px]"
                />
                <p className="text-xs text-muted-foreground">
                  ⚠️ Un CSS incorrect peut affecter l'affichage du site. Testez vos modifications soigneusement.
                </p>
              </CardContent>
            </Card>
            <Button
              onClick={async () => {
                setIsSavingCss(true);
                try {
                  await updateSetting.mutateAsync({ key: 'custom_css', value: customCss || null });
                  toast({ title: 'Succès', description: 'CSS personnalisé sauvegardé.' });
                } catch {
                  toast({ title: 'Erreur', description: 'Impossible de sauvegarder.', variant: 'destructive' });
                } finally {
                  setIsSavingCss(false);
                }
              }}
              disabled={isSavingCss}
            >
              {isSavingCss ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer le CSS
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
