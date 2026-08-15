import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useThemeSettings, useUpdateThemeSettings, ThemeSettings, getDefaultTheme } from '@/hooks/useThemeSettings';
import { useLogoUrl } from '@/hooks/useSiteSettings';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RotateCcw, Save, Palette, Wand2, ImageIcon } from 'lucide-react';
import { extractColorsFromImage, generateThemeFromColors, type ExtractedColors } from '@/utils/colorExtractor';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function hslToHex(hsl: string): string {
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
  let h = 0;
  let s = 0;
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

function ColorInput({ label, value, onChange, description }: ColorInputProps) {
  const hexValue = hslToHex(value);
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-md border border-border shadow-sm flex-shrink-0 cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: `hsl(${value})` }}
        >
          <input
            type="color"
            value={hexValue}
            onChange={(e) => onChange(hexToHsl(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <Input
          value={hexValue}
          onChange={(e) => {
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
              onChange(hexToHsl(e.target.value));
            }
          }}
          className="flex-1 font-mono text-sm"
          placeholder="#000000"
        />
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

const fontOptions = [
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond (Élégant)' },
  { value: 'Playfair Display', label: 'Playfair Display (Classique)' },
  { value: 'Lora', label: 'Lora (Moderne)' },
  { value: 'Merriweather', label: 'Merriweather (Traditionnel)' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville (Éditorial)' },
];

const fontSansOptions = [
  { value: 'Inter', label: 'Inter (Moderne)' },
  { value: 'Roboto', label: 'Roboto (Neutre)' },
  { value: 'Open Sans', label: 'Open Sans (Lisible)' },
  { value: 'Lato', label: 'Lato (Élégant)' },
  { value: 'Montserrat', label: 'Montserrat (Géométrique)' },
];

const presetThemes = [
  {
    name: 'Élégant Neutre',
    theme: getDefaultTheme(),
  },
  {
    name: 'Noir & Or',
    theme: {
      colors: {
        primary: '0 0% 8%', secondary: '45 30% 90%', accent: '45 70% 50%', background: '0 0% 100%', foreground: '0 0% 8%', muted: '0 0% 96%', card: '0 0% 99%', border: '0 0% 90%', gold: '45 70% 50%', navbarBg: '0 0% 5%', navbarText: '0 0% 95%', buttonColor: '', hoverColor: '', footerBg: '', footerText: '',
      },
      fontSerif: 'Playfair Display', fontSans: 'Montserrat', borderRadius: '0rem',
    },
  },
  {
    name: 'Terres & Or',
    theme: {
      colors: {
        primary: '32 23% 44%', secondary: '38 35% 80%', accent: '43 74% 49%', background: '40 38% 93%', foreground: '30 22% 29%', muted: '36 26% 78%', card: '38 35% 92%', border: '36 26% 82%', gold: '43 74% 49%', navbarBg: '30 22% 29%', navbarText: '40 38% 93%', buttonColor: '', hoverColor: '', footerBg: '', footerText: '',
      },
      fontSerif: 'Playfair Display', fontSans: 'Space Grotesk', borderRadius: '0.75rem',
    },
  },
  {
    name: 'Vert Forêt',
    theme: {
      colors: {
        primary: '150 30% 25%', secondary: '150 20% 92%', accent: '150 40% 75%', background: '150 10% 98%', foreground: '150 30% 10%', muted: '150 10% 94%', card: '150 10% 97%', border: '150 15% 88%', gold: '45 60% 55%', navbarBg: '150 30% 12%', navbarText: '150 10% 95%', buttonColor: '', hoverColor: '', footerBg: '', footerText: '',
      },
      fontSerif: 'Merriweather', fontSans: 'Open Sans', borderRadius: '0.375rem',
    },
  },
  {
    name: 'Bleu Océan',
    theme: {
      colors: {
        primary: '210 70% 35%', secondary: '210 30% 92%', accent: '195 80% 45%', background: '210 20% 98%', foreground: '210 40% 12%', muted: '210 15% 93%', card: '210 20% 97%', border: '210 20% 88%', gold: '38 60% 55%', navbarBg: '210 40% 15%', navbarText: '210 20% 95%', buttonColor: '', hoverColor: '', footerBg: '', footerText: '',
      },
      fontSerif: 'Libre Baskerville', fontSans: 'Inter', borderRadius: '0.5rem',
    },
  },
  {
    name: 'Rose Poudré',
    theme: {
      colors: {
        primary: '340 40% 45%', secondary: '340 30% 93%', accent: '340 50% 70%', background: '340 20% 98%', foreground: '340 20% 15%', muted: '340 15% 94%', card: '340 20% 97%', border: '340 20% 88%', gold: '35 65% 55%', navbarBg: '340 20% 18%', navbarText: '340 20% 95%', buttonColor: '', hoverColor: '', footerBg: '', footerText: '',
      },
      fontSerif: 'Cormorant Garamond', fontSans: 'Lato', borderRadius: '1rem',
    },
  },
  {
    name: 'Bordeaux Luxe',
    theme: {
      colors: {
        primary: '350 60% 25%', secondary: '350 20% 92%', accent: '35 70% 50%', background: '30 15% 97%', foreground: '350 30% 12%', muted: '350 10% 93%', card: '30 15% 96%', border: '350 15% 87%', gold: '35 70% 50%', navbarBg: '350 40% 15%', navbarText: '30 15% 95%', buttonColor: '', hoverColor: '', footerBg: '', footerText: '',
      },
      fontSerif: 'Playfair Display', fontSans: 'Montserrat', borderRadius: '0.25rem',
    },
  },
  {
    name: 'Terracotta',
    theme: {
      colors: {
        primary: '15 55% 45%', secondary: '25 30% 90%', accent: '25 60% 60%', background: '30 25% 96%', foreground: '15 30% 15%', muted: '25 15% 92%', card: '30 20% 95%', border: '25 20% 85%', gold: '40 65% 52%', navbarBg: '15 30% 18%', navbarText: '30 25% 93%', buttonColor: '', hoverColor: '', footerBg: '', footerText: '',
      },
      fontSerif: 'Lora', fontSans: 'Open Sans', borderRadius: '0.625rem',
    },
  },
  {
    name: 'Minimaliste',
    theme: {
      colors: {
        primary: '0 0% 15%', secondary: '0 0% 96%', accent: '0 0% 40%', background: '0 0% 100%', foreground: '0 0% 10%', muted: '0 0% 96%', card: '0 0% 99%', border: '0 0% 92%', gold: '0 0% 30%', navbarBg: '0 0% 100%', navbarText: '0 0% 10%', buttonColor: '', hoverColor: '', footerBg: '', footerText: '',
      },
      fontSerif: 'Libre Baskerville', fontSans: 'Inter', borderRadius: '0.125rem',
    },
  },
  {
    name: 'Violet Royal',
    theme: {
      colors: {
        primary: '270 45% 35%', secondary: '270 25% 93%', accent: '280 50% 60%', background: '270 15% 98%', foreground: '270 30% 12%', muted: '270 10% 93%', card: '270 15% 97%', border: '270 15% 88%', gold: '45 65% 55%', navbarBg: '270 30% 15%', navbarText: '270 15% 95%', buttonColor: '', hoverColor: '', footerBg: '', footerText: '',
      },
      fontSerif: 'Playfair Display', fontSans: 'Montserrat', borderRadius: '0.5rem',
    },
  },
  {
    name: 'Sahara',
    theme: {
      colors: {
        primary: '35 40% 35%', secondary: '40 30% 90%', accent: '28 55% 55%', background: '42 30% 96%', foreground: '30 25% 15%', muted: '38 20% 91%', card: '40 25% 95%', border: '38 20% 84%', gold: '43 70% 50%', navbarBg: '30 25% 18%', navbarText: '42 30% 93%', buttonColor: '', hoverColor: '', footerBg: '', footerText: '',
      },
      fontSerif: 'Lora', fontSans: 'Roboto', borderRadius: '0.375rem',
    },
  },
];

export function ThemeCustomizer() {
  const { data: savedTheme, isLoading } = useThemeSettings();
  const { logoUrl, isLoading: isLoadingLogo } = useLogoUrl();
  const updateTheme = useUpdateThemeSettings();
  const { toast } = useToast();
  
  const [theme, setTheme] = useState<ThemeSettings>(getDefaultTheme());
  const [hasChanges, setHasChanges] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedColors, setExtractedColors] = useState<ExtractedColors | null>(null);

  useEffect(() => {
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [savedTheme]);

  const updateColor = (key: keyof ThemeSettings['colors'], value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateTheme.mutateAsync(theme);
      setHasChanges(false);
      toast({
        title: 'Succès',
        description: 'Le thème a été enregistré avec succès.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de sauvegarder le thème.',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setTheme(getDefaultTheme());
    setHasChanges(true);
  };

  const applyPreset = (preset: ThemeSettings) => {
    setTheme(preset);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Thèmes prédéfinis
          </CardTitle>
          <CardDescription>
            Choisissez un thème de base ou personnalisez chaque couleur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {presetThemes.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.theme)}
                className="p-3 border rounded-lg text-left hover:border-primary transition-colors"
              >
                <div className="flex gap-1 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: `hsl(${preset.theme.colors.primary})` }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: `hsl(${preset.theme.colors.accent})` }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: `hsl(${preset.theme.colors.gold})` }}
                  />
                </div>
                <span className="text-sm font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logo Theme Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Générer un thème depuis le logo
          </CardTitle>
          <CardDescription>
            Extrayez automatiquement les couleurs dominantes de votre logo pour créer un thème harmonieux
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLogo ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !logoUrl ? (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-border bg-muted/30">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Aucun logo configuré</p>
                <p className="text-xs text-muted-foreground">
                  Ajoutez un logo dans l'onglet Général pour utiliser cette fonctionnalité
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                  <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1">
                  <Button
                    onClick={async () => {
                      setIsExtracting(true);
                      try {
                        const colors = await extractColorsFromImage(logoUrl);
                        setExtractedColors(colors);
                        const generatedColors = generateThemeFromColors(colors);
                        setTheme(prev => ({ ...prev, colors: { ...prev.colors, ...generatedColors } }));
                        setHasChanges(true);
                        toast({
                          title: 'Thème généré',
                          description: 'Les couleurs ont été extraites du logo. Vous pouvez ajuster le résultat.',
                        });
                      } catch (error: any) {
                        toast({
                          title: 'Erreur',
                          description: error.message || 'Impossible d\'extraire les couleurs du logo.',
                          variant: 'destructive',
                        });
                      } finally {
                        setIsExtracting(false);
                      }
                    }}
                    disabled={isExtracting}
                    className="w-full"
                  >
                    {isExtracting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    {isExtracting ? 'Analyse en cours…' : 'Extraire les couleurs du logo'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    L'algorithme détecte les couleurs dominantes et génère une palette cohérente
                  </p>
                </div>
              </div>

              {extractedColors && (
                <div className="space-y-3 p-4 rounded-lg border bg-muted/20">
                  <p className="text-sm font-medium">Couleurs extraites</p>
                  <div className="flex gap-2">
                    {[
                      { color: extractedColors.dominant, label: 'Dominante' },
                      { color: extractedColors.secondary, label: 'Secondaire' },
                      { color: extractedColors.accent, label: 'Accent' },
                      { color: extractedColors.dark, label: 'Sombre' },
                      { color: extractedColors.light, label: 'Claire' },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col items-center gap-1">
                        <div
                          className="w-10 h-10 rounded-full border border-border shadow-sm"
                          style={{ backgroundColor: `hsl(${item.color.h} ${item.color.s}% ${item.color.l}%)` }}
                        />
                        <span className="text-[10px] text-muted-foreground">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Le thème a été appliqué en aperçu. Ajustez les couleurs ci-dessous si nécessaire, puis enregistrez.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Couleurs</CardTitle>
          <CardDescription>
            Personnalisez la palette de couleurs de votre boutique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ColorInput
              label="Couleur principale"
              value={theme.colors.primary}
              onChange={(v) => updateColor('primary', v)}
              description="Boutons, liens actifs, éléments clés"
            />
            <ColorInput
              label="Couleur secondaire"
              value={theme.colors.secondary}
              onChange={(v) => updateColor('secondary', v)}
              description="Arrière-plans secondaires"
            />
            <ColorInput
              label="Couleur d'accent"
              value={theme.colors.accent}
              onChange={(v) => updateColor('accent', v)}
              description="Badges, highlights"
            />
            <ColorInput
              label="Arrière-plan"
              value={theme.colors.background}
              onChange={(v) => updateColor('background', v)}
              description="Fond de page principal"
            />
            <ColorInput
              label="Texte"
              value={theme.colors.foreground}
              onChange={(v) => updateColor('foreground', v)}
              description="Couleur du texte principal"
            />
            <ColorInput
              label="Cartes"
              value={theme.colors.card}
              onChange={(v) => updateColor('card', v)}
              description="Fond des cartes produits"
            />
            <ColorInput
              label="Atténué"
              value={theme.colors.muted}
              onChange={(v) => updateColor('muted', v)}
              description="Éléments désactivés, placeholders"
            />
            <ColorInput
              label="Bordures"
              value={theme.colors.border}
              onChange={(v) => updateColor('border', v)}
              description="Bordures et séparateurs"
            />
            <ColorInput
              label="Doré / Accent spécial"
              value={theme.colors.gold}
              onChange={(v) => updateColor('gold', v)}
              description="Prix promo, badges spéciaux"
            />
            <ColorInput
              label="Fond navbar"
              value={theme.colors.navbarBg || theme.colors.foreground}
              onChange={(v) => updateColor('navbarBg', v)}
              description="Couleur de fond de la barre de navigation"
            />
            <ColorInput
              label="Texte navbar"
              value={theme.colors.navbarText || theme.colors.background}
              onChange={(v) => updateColor('navbarText', v)}
              description="Couleur du texte dans la barre de navigation"
            />
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typographie</CardTitle>
          <CardDescription>
            Choisissez les polices pour les titres et le texte courant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Police des titres</Label>
              <Select
                value={theme.fontSerif}
                onValueChange={(value) => {
                  setTheme(prev => ({ ...prev, fontSerif: value }));
                  setHasChanges(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-2xl mt-2" style={{ fontFamily: theme.fontSerif }}>
                Aperçu du titre
              </p>
            </div>
            <div className="space-y-2">
              <Label>Police du texte</Label>
              <Select
                value={theme.fontSans}
                onValueChange={(value) => {
                  setTheme(prev => ({ ...prev, fontSans: value }));
                  setHasChanges(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSansOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2" style={{ fontFamily: theme.fontSans }}>
                Aperçu du texte courant. Lorem ipsum dolor sit amet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card>
        <CardHeader>
          <CardTitle>Arrondis</CardTitle>
          <CardDescription>
            Ajustez le rayon des bordures des éléments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Slider
                value={[parseFloat(theme.borderRadius) * 16]}
                onValueChange={([value]) => {
                  setTheme(prev => ({ ...prev, borderRadius: `${value / 16}rem` }));
                  setHasChanges(true);
                }}
                max={24}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-16">
                {theme.borderRadius}
              </span>
            </div>
            <div className="flex gap-4">
              <div 
                className="w-24 h-16 border-2"
                style={{ 
                  borderRadius: theme.borderRadius,
                  backgroundColor: `hsl(${theme.colors.card})`,
                  borderColor: `hsl(${theme.colors.border})`
                }}
              />
              <div 
                className="px-4 py-2 text-sm font-medium"
                style={{ 
                  borderRadius: theme.borderRadius,
                  backgroundColor: `hsl(${theme.colors.primary})`,
                  color: `hsl(${theme.colors.background})`
                }}
              >
                Bouton
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
        <div className="text-sm text-muted-foreground">
          {hasChanges ? 'Modifications non enregistrées' : 'Thème à jour'}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
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
    </div>
  );
}
