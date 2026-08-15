import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVendorMessages, useMarkMessageAsRead } from '@/hooks/useVendorMessages';
import { MessageSquare, Mail, Phone, CheckCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function VendorMessages() {
  const { data: messages = [], isLoading } = useVendorMessages();
  const markAsRead = useMarkMessageAsRead();
  const { toast } = useToast();

  const unreadCount = messages.filter(m => !m.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id);
      toast({ title: "Message marqué comme lu" });
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-light">Messages clients</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} message(s) non lu(s)` : 'Tous les messages sont lus'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mes messages ({messages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucun message reçu pour le moment
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Les clients peuvent vous contacter via vos produits
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg ${!message.is_read ? 'bg-primary/5 border-primary/20' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Message client</span>
                          {!message.is_read && (
                            <Badge variant="default" className="text-xs">Nouveau</Badge>
                          )}
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

                      {!message.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(message.id)}
                          title="Marquer comme lu"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
