import { useState } from 'react';
import { sanitizeRichTextHtml } from '@/lib/sanitizeRichTextHtml';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Store, Mail, Phone, MapPin, CheckCircle, Send, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  description: string | null;
  logo_url: string | null;
  address_city: string | null;
  address_country: string | null;
  is_verified: boolean;
}

interface VendorInfoDialogProps {
  vendor: Vendor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const messageSchema = z.object({
  email: z.string().trim().email({ message: "Email invalide" }).max(255),
  phone: z.string().trim().max(20).optional(),
  message: z.string().trim().min(10, { message: "Message trop court (min 10 caractères)" }).max(1000),
});

export function VendorInfoDialog({ vendor, open, onOpenChange }: VendorInfoDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    // Validate
    const result = messageSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('vendor_messages')
        .insert({
          vendor_id: vendor.id,
          sender_email: formData.email.trim(),
          sender_phone: formData.phone.trim() || null,
          message: formData.message.trim(),
        });

      if (error) throw error;

      toast({
        title: "Message envoyé",
        description: "La boutique recevra votre message.",
      });

      setFormData({ email: '', phone: '', message: '' });
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {vendor.logo_url ? (
              <img
                src={vendor.logo_url}
                alt={vendor.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Store className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                {vendor.name}
                {vendor.is_verified && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Vérifié
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Informations et contact de la boutique
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vendor Info */}
          <div className="space-y-3">
            {vendor.description && (
              <div className="text-sm text-muted-foreground prose prose-sm max-w-none [&_p]:my-0" dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(vendor.description) }} />
            )}
            
            <div className="flex flex-wrap gap-4 text-sm">
              {vendor.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{vendor.email}</span>
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{vendor.phone}</span>
                </div>
              )}
              {(vendor.address_city || vendor.address_country) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {[vendor.address_city, vendor.address_country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* View Shop Button */}
            <Button
              variant="outline"
              className="w-full gap-2 mt-4"
              onClick={() => {
                onOpenChange(false);
                navigate(`/shop/${vendor.id}`);
              }}
            >
              <ShoppingBag className="w-4 h-4" />
              Voir tous les produits de {vendor.name}
            </Button>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-sm">Contacter la boutique</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Téléphone</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="+216 XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">Message *</Label>
              <Textarea
                id="contact-message"
                placeholder="Votre message à la boutique..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className={errors.message ? 'border-destructive' : ''}
              />
              {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
