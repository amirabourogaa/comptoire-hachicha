import { useSiteSetting } from '@/hooks/useSiteSettings';

export function CustomCssInjector() {
  const { data: customCssSetting } = useSiteSetting('custom_css');
  const css = customCssSetting?.value;

  if (!css) return null;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
