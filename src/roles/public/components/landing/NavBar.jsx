import { Button } from "@/components/ui/Button";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function NavBar() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = !mounted
    ? "/Images/Veritas_logo.png"
    : resolvedTheme === "dark"
      ? "/Images/Veritas_dark.png"
      : "/Images/Veritas_logo.png";

  const menuItems = [
    { name: "Home", href: "#product" },
    { name: "Pricing", href: "#pricing" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl flex h-16 items-center justify-between">
        
        {/* Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-4 sm:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 -ml-2 text-foreground">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <a
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-lg hover:opacity-80 transition-opacity"
          >
            <img
              src={logoSrc}
              alt="Veritas logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-contain"
            />
            Veritas
          </a>
        </div>

        {/* Desktop Brand */}
        <div className="hidden sm:flex items-center gap-6">
          <a
            href="/"
            className="flex items-center gap-3 font-semibold tracking-tight text-2xl hover:opacity-80 transition-opacity mr-8"
          >
            <img
              src={logoSrc}
              alt="Veritas logo"
              width={34}
              height={34}
              className="h-8 w-8 rounded-lg object-contain"
            />
            Veritas
          </a>
          
          <nav className="flex items-center gap-4 text-sm font-medium">
            <a href="#product" className="transition-colors hover:text-foreground/80 text-foreground/60">Home</a>
            <a href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</a>
            <a href="#testimonials" className="transition-colors hover:text-foreground/80 text-foreground/60">Testimonials</a>
            <a href="#faq" className="transition-colors hover:text-foreground/80 text-foreground/60">FAQ</a>
            <a href="#system-modules" className="transition-colors hover:text-foreground/80 text-foreground/60">System Modules</a>
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 justify-end flex-1 sm:flex-none">
          <div className="hidden sm:block">
            <Link to="/login">
              <Button size="sm" className="px-4 transition-all duration-200 hover:bg-light hover:text-white hover:shadow-[0_0_18px_rgba(91,168,255,0.55)]">
                Sign In
              </Button>
            </Link>
          </div>
          <ThemeSwitcher />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-border/40 px-4 py-4 space-y-4 bg-background">
          <nav className="flex flex-col gap-4">
            {menuItems.map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                className="text-lg font-medium transition-colors hover:text-foreground/80"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </nav>
          <div className="pt-4 border-t border-border/40">
            <Link to="/login">
              <Button className="w-full h-12 text-lg">Sign In</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
