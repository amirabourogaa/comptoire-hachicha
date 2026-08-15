import React, { createContext, useContext, useEffect } from 'react';
import { useThemeSettings, ThemeSettings, getDefaultTheme } from '@/hooks/useThemeSettings';

interface ThemeContextType {
  theme: ThemeSettings;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to parse HSL string and adjust lightness/saturation
function adjustHsl(hsl: string, lightnessOffset: number, saturationOffset = 0): string {
  const parts = hsl.split(' ');
  if (parts.length < 3) return hsl;
  const h = parts[0];
  const s = Math.max(0, Math.min(100, parseFloat(parts[1]) + saturationOffset));
  const l = Math.max(0, Math.min(100, parseFloat(parts[2]) + lightnessOffset));
  return `${h} ${Math.round(s)}% ${Math.round(l)}%`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: theme, isLoading } = useThemeSettings();

  const currentTheme = theme || getDefaultTheme();

  useEffect(() => {
    if (!currentTheme) return;

    const root = document.documentElement;
    const c = currentTheme.colors;
    
    // Apply core semantic color variables
    root.style.setProperty('--primary', c.primary);
    root.style.setProperty('--secondary', c.secondary);
    root.style.setProperty('--accent', c.accent);
    root.style.setProperty('--background', c.background);
    root.style.setProperty('--foreground', c.foreground);
    root.style.setProperty('--muted', c.muted);
    root.style.setProperty('--card', c.card);
    root.style.setProperty('--border', c.border);
    root.style.setProperty('--gold', c.gold);
    
    // Apply derived semantic colors
    root.style.setProperty('--card-foreground', c.foreground);
    root.style.setProperty('--popover', c.card);
    root.style.setProperty('--popover-foreground', c.foreground);
    root.style.setProperty('--primary-foreground', c.background);
    root.style.setProperty('--secondary-foreground', c.foreground);
    root.style.setProperty('--muted-foreground', adjustHsl(c.foreground, 20, -10));
    root.style.setProperty('--accent-foreground', c.foreground);
    root.style.setProperty('--input', c.border);
    root.style.setProperty('--ring', c.primary);

    // Derive custom earthy tokens from theme colors
    // espresso = darkest (foreground)
    root.style.setProperty('--espresso', c.foreground);
    // earth = primary
    root.style.setProperty('--earth', c.primary);
    // mushroom = muted
    root.style.setProperty('--mushroom', c.muted);
    // putty = secondary
    root.style.setProperty('--putty', c.secondary);
    // bone = background
    root.style.setProperty('--bone', c.background);
    // gold variants derived from gold
    root.style.setProperty('--gold-light', adjustHsl(c.gold, 10, -10));
    root.style.setProperty('--gold-dark', adjustHsl(c.gold, -10, 5));
    // terracotta = accent shifted
    root.style.setProperty('--terracotta', adjustHsl(c.accent, -5, 10));
    // sage = muted shifted
    root.style.setProperty('--sage', adjustHsl(c.muted, -10, 5));

    // Update gradients
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${c.primary}), hsl(${c.foreground}), hsl(${adjustHsl(c.primary, 10)}))`);
    root.style.setProperty('--gradient-accent', `linear-gradient(135deg, hsl(${c.gold}), hsl(${adjustHsl(c.gold, 5, 5)}), hsl(${adjustHsl(c.gold, 10)}))`);
    root.style.setProperty('--gradient-earth', `linear-gradient(135deg, hsl(${c.foreground}), hsl(${c.primary}))`);
    root.style.setProperty('--gradient-shimmer', `linear-gradient(90deg, transparent, hsl(${c.gold} / 0.4), transparent)`);

    // Update shadows
    root.style.setProperty('--shadow-soft', `0 4px 20px -4px hsl(${c.foreground} / 0.12)`);
    root.style.setProperty('--shadow-elevated', `0 20px 40px -15px hsl(${c.foreground} / 0.18)`);
    root.style.setProperty('--shadow-glow', `0 0 40px -10px hsl(${c.gold} / 0.35)`);
    root.style.setProperty('--shadow-gold', `0 0 30px -8px hsl(${c.gold} / 0.45)`);

    // Update glass effects
    root.style.setProperty('--glass-bg', `hsl(${c.background} / 0.85)`);
    root.style.setProperty('--glass-border', `hsl(${c.border} / 0.5)`);

    // Update sidebar colors
    root.style.setProperty('--sidebar-background', c.background);
    root.style.setProperty('--sidebar-foreground', c.foreground);
    root.style.setProperty('--sidebar-primary', c.primary);
    root.style.setProperty('--sidebar-primary-foreground', c.background);
    root.style.setProperty('--sidebar-accent', adjustHsl(c.secondary, 5));
    root.style.setProperty('--sidebar-accent-foreground', c.foreground);
    root.style.setProperty('--sidebar-border', c.border);
    root.style.setProperty('--sidebar-ring', c.gold);

    // Status colors (derived from theme for consistency)
    // These provide semantic status colors that adapt to the theme
    root.style.setProperty('--status-success', '160 84% 39%');
    root.style.setProperty('--status-success-foreground', '160 84% 20%');
    root.style.setProperty('--status-success-muted', '160 40% 92%');
    root.style.setProperty('--status-warning', '38 92% 50%');
    root.style.setProperty('--status-warning-foreground', '38 92% 30%');
    root.style.setProperty('--status-warning-muted', '38 50% 92%');
    root.style.setProperty('--status-info', '210 100% 50%');
    root.style.setProperty('--status-info-foreground', '210 100% 30%');
    root.style.setProperty('--status-info-muted', '210 50% 92%');
    root.style.setProperty('--status-danger', '0 84% 60%');
    root.style.setProperty('--status-danger-foreground', '0 84% 35%');
    root.style.setProperty('--status-danger-muted', '0 40% 93%');

    // Navbar colors
    const navBg = c.navbarBg || c.foreground;
    const navText = c.navbarText || c.background;
    root.style.setProperty('--navbar-bg', navBg);
    root.style.setProperty('--navbar-text', navText);

    // Button colors (fallback to primary)
    const btnColor = c.buttonColor || c.primary;
    const btnHover = c.hoverColor || '';
    root.style.setProperty('--button-color', btnColor);
    if (btnHover) {
      root.style.setProperty('--button-hover', btnHover);
    } else {
      root.style.setProperty('--button-hover', adjustHsl(btnColor, -8, 5));
    }

    // Footer colors (fallback to foreground/background)
    const ftBg = c.footerBg || c.foreground;
    const ftText = c.footerText || c.background;
    root.style.setProperty('--footer-bg', ftBg);
    root.style.setProperty('--footer-text', ftText);
    
    // Apply fonts
    root.style.setProperty('--font-serif', `'${currentTheme.fontSerif}', Georgia, serif`);
    root.style.setProperty('--font-sans', `'${currentTheme.fontSans}', -apple-system, BlinkMacSystemFont, sans-serif`);
    
    // Apply border radius
    root.style.setProperty('--radius', currentTheme.borderRadius);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
