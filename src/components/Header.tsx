import { Button } from "@/components/ui/button";
import { CheckCircle, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow duration-300">
              <CheckCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Total<span className="gradient-text">Quality</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Recursos
            </a>
            <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Benefícios
            </a>
            <a href="#modules" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Módulos
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Contato
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" className="font-medium" onClick={() => navigate("/auth")}>
              Entrar
            </Button>
            <Button className="gradient-bg font-medium shadow-soft hover:shadow-medium transition-shadow" onClick={() => navigate("/auth")}>
              Começar Grátis
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Recursos
              </a>
              <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Benefícios
              </a>
              <a href="#modules" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Módulos
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Contato
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <Button variant="ghost" className="w-full font-medium" onClick={() => navigate("/auth")}>
                  Entrar
                </Button>
                <Button className="w-full gradient-bg font-medium" onClick={() => navigate("/auth")}>
                  Começar Grátis
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
