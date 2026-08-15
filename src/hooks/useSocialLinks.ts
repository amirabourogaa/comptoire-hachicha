import { useSiteSettings } from '@/hooks/useSiteSettings';

export interface SocialLinks {
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  twitter: string | null;
  youtube: string | null;
}

const SOCIAL_KEYS = ['social_facebook', 'social_instagram', 'social_tiktok', 'social_twitter', 'social_youtube'] as const;

export function useSocialLinks(): { socialLinks: SocialLinks; isLoading: boolean } {
  const { data: settings, isLoading } = useSiteSettings();

  const get = (key: string) => settings?.find(s => s.key === key)?.value || null;

  return {
    socialLinks: {
      facebook: get('social_facebook'),
      instagram: get('social_instagram'),
      tiktok: get('social_tiktok'),
      twitter: get('social_twitter'),
      youtube: get('social_youtube'),
    },
    isLoading,
  };
}

export { SOCIAL_KEYS };
