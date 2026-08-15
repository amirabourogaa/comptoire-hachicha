import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, Share, Plus, MoreVertical, Check } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Listen for beforeinstallprompt (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-foreground via-primary to-foreground flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="backdrop-blur-xl bg-background/10 border border-background/20 rounded-2xl p-8 shadow-2xl text-center">
            {isInstalled ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 mb-6">
                  <Check className="w-10 h-10 text-success" />
                </div>
                <h1 className="font-serif text-3xl text-background font-light tracking-wider mb-3">
                  Application installée !
                </h1>
                <p className="text-background/60 text-sm">
                  SEC est déjà installé sur votre appareil. Ouvrez-le depuis votre écran d'accueil.
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent mb-6 shadow-glow">
                  <Smartphone className="w-10 h-10 text-accent-foreground" />
                </div>
                <h1 className="font-serif text-3xl text-background font-light tracking-wider mb-3">
                  Installer l'application
                </h1>
                <p className="text-background/60 text-sm mb-8">
                  Installez SEC sur votre téléphone pour un accès rapide, comme une vraie application.
                </p>

                {deferredPrompt ? (
                  <button
                    onClick={handleInstall}
                    className="w-full bg-accent text-accent-foreground py-4 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:shadow-glow hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    <Download className="w-5 h-5" />
                    Installer maintenant
                  </button>
                ) : isIOS ? (
                  <div className="space-y-6">
                    <p className="text-background/80 text-sm font-medium">
                      Pour installer sur iPhone / iPad :
                    </p>
                    <div className="space-y-4 text-left">
                      <div className="flex items-start gap-4 p-4 bg-background/5 rounded-xl border border-background/10">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">1</div>
                        <div>
                          <p className="text-background text-sm font-medium">Appuyez sur le bouton Partager</p>
                          <p className="text-background/50 text-xs mt-1 flex items-center gap-1">
                            <Share className="w-3 h-3" /> en bas de l'écran dans Safari
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-background/5 rounded-xl border border-background/10">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">2</div>
                        <div>
                          <p className="text-background text-sm font-medium">Sélectionnez "Sur l'écran d'accueil"</p>
                          <p className="text-background/50 text-xs mt-1 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> dans le menu qui apparaît
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-background/5 rounded-xl border border-background/10">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">3</div>
                        <div>
                          <p className="text-background text-sm font-medium">Confirmez en appuyant sur "Ajouter"</p>
                          <p className="text-background/50 text-xs mt-1">L'application apparaîtra sur votre écran d'accueil</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-background/80 text-sm font-medium">
                      Pour installer sur Android :
                    </p>
                    <div className="space-y-4 text-left">
                      <div className="flex items-start gap-4 p-4 bg-background/5 rounded-xl border border-background/10">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">1</div>
                        <div>
                          <p className="text-background text-sm font-medium">Ouvrez le menu du navigateur</p>
                          <p className="text-background/50 text-xs mt-1 flex items-center gap-1">
                            <MoreVertical className="w-3 h-3" /> les trois points en haut à droite
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-background/5 rounded-xl border border-background/10">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">2</div>
                        <div>
                          <p className="text-background text-sm font-medium">Appuyez sur "Installer l'application"</p>
                          <p className="text-background/50 text-xs mt-1">ou "Ajouter à l'écran d'accueil"</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-background/5 rounded-xl border border-background/10">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">3</div>
                        <div>
                          <p className="text-background text-sm font-medium">Confirmez l'installation</p>
                          <p className="text-background/50 text-xs mt-1">L'application sera disponible sur votre écran d'accueil</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default InstallPage;
