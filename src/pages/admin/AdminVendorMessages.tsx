import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAllVendorMessages, useMarkMessageAsRead, useDeleteVendorMessage } from '@/hooks/useVendorMessages';
import { MessageSquare, Store, Mail, Phone, Trash2, CheckCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function AdminVendorMessages() {
  const { data: messages = [], isLoading } = useAllVendorMessages();
  const markAsRead = useMarkMessageAsRead();
  const deleteMessage = useDeleteVendorMessage();
  const { toast } = useToast();
  const [filterVendor, setFilterVendor] = useState<string>('all');

  // Get unique vendors from messages
  const vendors = [...new Map(
    messages
      .filter(m => m.vendor)
      .map(m => [m.vendor!.id, m.vendor!])
  ).values()];

  const filteredMessages = filterVendor === 'all'
    ? messages
    : messages.filter(m => m.vendor_id === filterVendor);

  const unreadCount = messages.filter(m => !m.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id);
      toast({ title: "Message marqué comme lu" });
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce message ?')) {
      try {
        await deleteMessage.mutateAsync(id);
        toast({ title: "Message supprimé" });
      } catch (error) {
        toast({ title: "Erreur", variant: "destructive" });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-light">Messages Boutiques</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} message(s) non lu(s)` : 'Tous les messages sont lus'}
            </p>
          </div>

          <Select value={filterVendor} onValueChange={setFilterVendor}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par boutique" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les boutiques</SelectItem>
              {vendors.map(vendor => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages clients ({filteredMessages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun message</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg ${!message.is_read ? 'bg-primary/5 border-primary/20' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {message.vendor?.logo_url ? (
                            <img
                              src={message.vendor.logo_url}
                              alt={message.vendor.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Store className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <span className="font-medium">{message.vendor?.name || 'Boutique inconnue'}</span>
                            {!message.is_read && (
                              <Badge variant="default" className="ml-2 text-xs">Nouveau</Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {message.sender_email}
                          </div>
                          {message.sender_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {message.sender_phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(message.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </div>
                        </div>

                        <p className="text-sm mt-2 whitespace-pre-wrap">{message.message}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!message.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(message.id)}
                          >
                            <CheckCheck className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(message.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
