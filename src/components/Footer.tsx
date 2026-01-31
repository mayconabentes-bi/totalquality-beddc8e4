import { CheckCircle, Linkedin, Instagram, Youtube, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-background">
                TotalQuality
              </span>
            </a>
            <p className="text-background/60 text-sm mb-6">
              Sistema completo para Gestão da Qualidade. Simplifique processos, garanta conformidade.
            </p>
            <div className="flex items-center gap-3">
              <SocialLink icon={Linkedin} href="#" />
              <SocialLink icon={Instagram} href="#" />
              <SocialLink icon={Youtube} href="#" />
              <SocialLink icon={Mail} href="#" />
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">Produto</h4>
            <ul className="space-y-3">
              <FooterLink href="#">Recursos</FooterLink>
              <FooterLink href="#">Módulos</FooterLink>
              <FooterLink href="#">Preços</FooterLink>
              <FooterLink href="#">Integrações</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">Empresa</h4>
            <ul className="space-y-3">
              <FooterLink href="#">Sobre Nós</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Carreiras</FooterLink>
              <FooterLink href="#">Parceiros</FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">Recursos</h4>
            <ul className="space-y-3">
              <FooterLink href="#">Documentação</FooterLink>
              <FooterLink href="#">Tutoriais</FooterLink>
              <FooterLink href="#">Webinars</FooterLink>
              <FooterLink href="#">FAQ</FooterLink>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">Legal</h4>
            <ul className="space-y-3">
              <FooterLink href="#">Termos de Uso</FooterLink>
              <FooterLink href="#">Privacidade</FooterLink>
              <FooterLink href="#">LGPD</FooterLink>
              <FooterLink href="#">Segurança</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/60">
            © 2024 TotalQuality. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-background/40">Feito com ❤️ no Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface SocialLinkProps {
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const SocialLink = ({ icon: Icon, href }: SocialLinkProps) => (
  <a 
    href={href} 
    className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
  >
    <Icon className="w-5 h-5 text-background/80" />
  </a>
);

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

const FooterLink = ({ href, children }: FooterLinkProps) => (
  <li>
    <a href={href} className="text-background/60 hover:text-background transition-colors text-sm">
      {children}
    </a>
  </li>
);

export default Footer;
