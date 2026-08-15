import { Link } from 'react-router-dom';
import { useSiteSettings, useSiteSetting } from '@/hooks/useSiteSettings';
import { Mail, Phone, MapPin, Sparkles, ArrowUpRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { sanitizeRichTextHtml } from '@/lib/sanitizeRichTextHtml';

// Composant pour les icônes sociales statiques
const StaticSocialIcon = ({ type, url }: { type: string; url: string }) => {
  const icons: Record<string, JSX.Element> = {
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 7.056c-2.732 0-4.944 2.212-4.944 4.944s2.212 4.944 4.944 4.944 4.944-2.212 4.944-4.944-2.212-4.944-4.944-4.944zm0 8.153c-1.773 0-3.209-1.436-3.209-3.209 0-1.773 1.436-3.209 3.209-3.209s3.209 1.436 3.209 3.209c0 1.773-1.436 3.209-3.209 3.209zm5.293-8.352c0 .638-.517 1.155-1.155 1.155s-1.155-.517-1.155-1.155.517-1.155 1.155-1.155 1.155.517 1.155 1.155z"/>
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/>
      </svg>
    ),
  };

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="p-2.5 rounded-lg bg-white/10 hover:bg-orange-500 text-black hover:text-black transition-all duration-300 hover:scale-110 hover:shadow-lg"
      aria-label={type}
    >
      {icons[type]}
    </a>
  );
};

export function Footer() {
  const { data: settings } = useSiteSettings();
  const logoUrl = settings?.find(s => s.key === 'logo_url')?.value;
  const { data: logoSizeSetting } = useSiteSetting('logo_size');
  const logoSize = parseInt(logoSizeSetting?.value || '40', 10);
  const companyName = settings?.find(s => s.key === 'company_name')?.value || '';
  const footerDescription = settings?.find(s => s.key === 'footer_description')?.value || '';
  const companyEmail = settings?.find(s => s.key === 'company_email')?.value;
  const companyPhone = settings?.find(s => s.key === 'company_phone')?.value;
  const companyAddress = settings?.find(s => s.key === 'company_address')?.value;

  // Deuxième numéro de téléphone statique
  const secondaryPhone = "+216 23 625 625"; // À modifier selon votre besoin

  // Liens statiques pour les réseaux sociaux
  const staticSocialLinks = {
    facebook: "https://www.facebook.com/SocieteEquipementsEtCoffrageSEC?locale=fr_FR", 
    instagram: "/en-cours", 
    linkedin: "/en-cours", 
  };

  const navLinksRaw = settings?.find(s => s.key === 'footer_nav_links')?.value;
  let navLinks: { label: string; url: string }[] = [];
  try { if (navLinksRaw) navLinks = JSON.parse(navLinksRaw); } catch {}

  const bottomLinksRaw = settings?.find(s => s.key === 'footer_bottom_links')?.value;
  let bottomLinks: { label: string; url: string }[] = [];
  try { if (bottomLinksRaw) bottomLinks = JSON.parse(bottomLinksRaw); } catch {}

  const newsletterTitle = settings?.find(s => s.key === 'footer_newsletter_title')?.value || '';
  const newsletterText = settings?.find(s => s.key === 'footer_newsletter_text')?.value || '';
  const copyrightText = settings?.find(s => s.key === 'footer_copyright')?.value;

  return (
    <footer className="relative mt-32 overflow-hidden text-black" style={{ backgroundColor: 'hsl(var(--footer-bg))' }}>
      
      {/* Décorations oranges */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-orange-400/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-auto mb-6" style={{ height: `${logoSize}px` }} />
            ) : (
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-orange-400" />
                <h3 className="text-2xl">{companyName}</h3>
              </div>
            )}

            <div
              className="text-black/80 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(footerDescription) }}
            />

            {/* Icônes sociales statiques uniquement */}
            <div className="flex gap-2 mt-6">
              <StaticSocialIcon type="facebook" url={staticSocialLinks.facebook} />
              <StaticSocialIcon type="instagram" url={staticSocialLinks.instagram} />
              <StaticSocialIcon type="linkedin" url={staticSocialLinks.linkedin} />
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="mb-6 text-orange-400 font-semibold text-lg relative inline-block">
              Boutique
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-orange-400 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.url} className="text-black/70 hover:text-orange-400 flex items-center gap-2 group transition-colors duration-300">
                    <ChevronRight className="w-3 h-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="mb-6 text-orange-400 font-semibold text-lg relative inline-block">
              Contact
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-orange-400 rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              {companyEmail && (
                <li>
                  <a href={`mailto:${companyEmail}`} className="flex items-center gap-3 text-black/70 hover:text-orange-400 transition-colors group">
                    <Mail className="h-4 w-4 text-orange-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="break-all">{companyEmail}</span>
                  </a>
                </li>
              )}
              {companyPhone && (
                <li>
                  <a href={`tel:${companyPhone}`} className="flex items-center gap-3 text-black/70 hover:text-orange-400 transition-colors group">
                    <Phone className="h-4 w-4 text-orange-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{companyPhone}</span>
                  </a>
                </li>
              )}
              {/* Deuxième numéro de téléphone statique */}
              <li>
                <a href={`tel:${secondaryPhone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-black/70 hover:text-orange-400 transition-colors group">
                  <Phone className="h-4 w-4 text-orange-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>{secondaryPhone}</span>
                </a>
              </li>
              {companyAddress && (
                <li className="flex items-start gap-3 text-black/70">
                  <MapPin className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span>{companyAddress}</span>
                </li>
              )}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="mb-6 text-orange-400 font-semibold text-lg relative inline-block">
              {newsletterTitle || "Newsletter"}
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-orange-400 rounded-full"></span>
            </h4>
            <p className="text-black/70 mb-6 text-sm">{newsletterText || "Recevez nos offres exclusives"}</p>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="p-3 rounded-lg bg-white/10 text-black placeholder:text-black/40 border border-white/20 focus:border-orange-400 focus:outline-none transition-all duration-300" 
              />
              <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 transform hover:scale-105">
                S'inscrire
              </button>
            </div>
          </motion.div>

        </div>

        {/* Bottom */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-black text-sm">
            {copyrightText || `© ${new Date().getFullYear()} ${companyName}`}
          </p>

          <div className="flex gap-6">
            {bottomLinks.map((link) => (
              <Link key={link.url} to={link.url} className="text-black hover:text-orange-400 text-sm transition-colors duration-300">
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </footer>
  );
}