import { useEffect } from 'react';
import { useSiteSetting } from '@/hooks/useSiteSettings';
import { useLogoUrl } from '@/hooks/useSiteSettings';

/**
 * Synchronise le titre du document et le favicon avec les paramètres du site.
 * @param suffix - Texte ajouté après le nom du site (ex: "Admin")
 */
export function useDocumentMeta(suffix?: string) {
  const { data: nameSetting } = useSiteSetting('site_name');
  const { logoUrl } = useLogoUrl();

  const siteName = nameSetting?.value || 'SEC';
  const title = suffix ? `${siteName} — ${suffix}` : siteName;

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (!logoUrl) return;

    // Update favicon
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = logoUrl;
  }, [logoUrl]);

  return { siteName, title };
}
