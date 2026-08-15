import { Header } from './Header';
import { Footer } from './Footer';
import { ChatBot } from '@/components/chat/ChatBot';
import { CustomCssInjector } from './CustomCssInjector';
import { motion } from 'framer-motion';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useDocumentMeta();
  return (
    <div className="min-h-screen flex flex-col bg-background noise-overlay">
      <CustomCssInjector />
      <Header />
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1"
      >
        {children}
      </motion.main>
      <Footer />
      {/* <ChatBot /> */}
    </div>
  );
}
