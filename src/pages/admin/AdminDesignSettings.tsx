import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useThemeSettings, useUpdateThemeSettings, ThemeSettings, ThemeColors, getDefaultTheme } from '@/hooks/useThemeSettings';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, RotateCcw, Palette, Eye } from 'lucide-react';

function hslToHex(hsl: string): string {
  if (!hsl) return '#888888';
  const parts = hsl.split(' ').map(p => parseFloat(p));
  if (parts.length !== 3) return '#888888';
  const h = parts[0];
  const s = parts[1] / 100;
  const l = parts[2] / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 50%';
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface ColorFieldProps {
  label: string;
  description: string;
  value: string;
  fallback: string;
  onChange: (val: string) => void;
}

function ColorField({ label, description, value, fallback, onChange }: ColorFieldProps) {
  const displayValue = value || fallback;
  const hexValue = hslToHex(displayValue);
  const isCustom = !!value;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
      <div
        className="w-12 h-12 rounded-lg border-2 border-border shadow-sm flex-shrink-0 cursor-pointer relative overflow-hidden"
        style={{ backgroundColor: `hsl(${displayValue})` }}
      >
        <input
          type="color"
          value={hexValue}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-semibold">{label}</Label>
          {!isCustom && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Par défaut</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={hexValue}
          onChange={(e) => {
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
              onChange(hexToHsl(e.target.value));
            }
          }}
          className="w-24 font-mono text-xs"
          placeholder="#000000"
        />
        {isCustom && (
          <Button variant="ghost" size="sm" onClick={() => onChange('')} className="text-xs px-2">
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function AdminDesignSettings() {
  const { data: savedTheme, isLoading } = useThemeSettings();
  const updateTheme = useUpdateThemeSettings();
  const { toast } = useToast();
  const [colors, setColors] = useState<ThemeColors>(getDefaultTheme().colors);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (savedTheme) {
      setColors({
        ...getDefaultTheme().colors,
        ...savedTheme.colors,
      });
    }
  }, [savedTheme]);

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const currentTheme = savedTheme || getDefaultTheme();
      await updateTheme.mutateAsync({
        ...currentTheme,
        colors: { ...currentTheme.colors, ...colors },
      });
      setHasChanges(false);
      toast({ title: 'Succès', description: 'Les couleurs ont été enregistrées et appliquées.' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Impossible de sauvegarder.', variant: 'destructive' });
    }
  };

  const handleReset = () => {
    const defaults = getDefaultTheme().colors;
    setColors(prev => ({
      ...prev,
      buttonColor: '',
      hoverColor: '',
      footerBg: '',
      footerText: '',
    }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Palette className="h-6 w-6" />
              Design Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configurez les couleurs globales du site. Les modifications s'appliquent automatiquement.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || updateTheme.isPending}>
              {updateTheme.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
        </div>

        {/* Live Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Aperçu en direct
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border border-border">
              {/* Header preview */}
              <div className="p-3 flex items-center justify-between" style={{ backgroundColor: `hsl(${colors.navbarBg || colors.foreground})`, color: `hsl(${colors.navbarText || colors.background})` }}>
                <span className="text-sm font-semibold">Header</span>
                <div className="flex gap-2">
                  <span className="text-xs opacity-70">Menu</span>
                  <span className="text-xs opacity-70">Contact</span>
                </div>
              </div>
              {/* Body preview */}
              <div className="p-6" style={{ backgroundColor: `hsl(${colors.background})`, color: `hsl(${colors.foreground})` }}>
                <h3 className="font-serif text-lg mb-2" style={{ color: `hsl(${colors.primary})` }}>Titre principal</h3>
                <p className="text-sm mb-3 opacity-70">Texte de description du site avec la couleur configurée.</p>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: `hsl(${colors.buttonColor || colors.primary})`,
                      color: `hsl(${colors.background})`,
                    }}
                  >
                    Bouton principal
                  </button>
                  <button
                    className="px-4 py-2 rounded text-sm font-medium border"
                    style={{
                      borderColor: `hsl(${colors.secondary})`,
                      color: `hsl(${colors.foreground})`,
                      backgroundColor: `hsl(${colors.secondary})`,
                    }}
                  >
                    Bouton secondaire
                  </button>
                </div>
              </div>
              {/* Footer preview */}
              <div className="p-3" style={{ backgroundColor: `hsl(${colors.footerBg || colors.foreground})`, color: `hsl(${colors.footerText || colors.background})` }}>
                <span className="text-xs opacity-80">Footer · © 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Couleurs principales</CardTitle>
            <CardDescription>Les couleurs de base qui définissent l'identité visuelle du site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ColorField
              label="Couleur primaire"
              description="Couleur principale du site (titres, liens, accents)"
              value={colors.primary}
              fallback={getDefaultTheme().colors.primary}
              onChange={(v) => updateColor('primary', v)}
            />
            <ColorField
              label="Couleur secondaire"
              description="Couleur complémentaire (arrière-plans légers, badges)"
              value={colors.secondary}
              fallback={getDefaultTheme().colors.secondary}
              onChange={(v) => updateColor('secondary', v)}
            />
            <ColorField
              label="Couleur du texte"
              description="Couleur principale du texte sur tout le site"
              value={colors.foreground}
              fallback={getDefaultTheme().colors.foreground}
              onChange={(v) => updateColor('foreground', v)}
            />
            <ColorField
              label="Arrière-plan"
              description="Couleur de fond globale du site"
              value={colors.background}
              fallback={getDefaultTheme().colors.background}
              onChange={(v) => updateColor('background', v)}
            />
          </CardContent>
        </Card>

        {/* Button Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Boutons</CardTitle>
            <CardDescription>Personnalisez les couleurs des boutons d'action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ColorField
              label="Couleur des boutons"
              description="Couleur de fond des boutons principaux (par défaut : couleur primaire)"
              value={colors.buttonColor}
              fallback={colors.primary}
              onChange={(v) => updateColor('buttonColor', v)}
            />
            <ColorField
              label="Couleur au survol"
              description="Couleur des boutons au passage de la souris"
              value={colors.hoverColor}
              fallback={colors.buttonColor || colors.primary}
              onChange={(v) => updateColor('hoverColor', v)}
            />
          </CardContent>
        </Card>

        {/* Header & Footer */}
        <Card>
          <CardHeader>
            <CardTitle>Header & Footer</CardTitle>
            <CardDescription>Couleurs de l'en-tête et du pied de page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ColorField
              label="Fond du header"
              description="Couleur de fond de la barre de navigation"
              value={colors.navbarBg}
              fallback={getDefaultTheme().colors.navbarBg}
              onChange={(v) => updateColor('navbarBg', v)}
            />
            <ColorField
              label="Texte du header"
              description="Couleur du texte dans la barre de navigation"
              value={colors.navbarText}
              fallback={getDefaultTheme().colors.navbarText}
              onChange={(v) => updateColor('navbarText', v)}
            />
            <ColorField
              label="Fond du footer"
              description="Couleur de fond du pied de page (par défaut : couleur du texte)"
              value={colors.footerBg}
              fallback={colors.foreground}
              onChange={(v) => updateColor('footerBg', v)}
            />
            <ColorField
              label="Texte du footer"
              description="Couleur du texte dans le pied de page"
              value={colors.footerText}
              fallback={colors.background}
              onChange={(v) => updateColor('footerText', v)}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
