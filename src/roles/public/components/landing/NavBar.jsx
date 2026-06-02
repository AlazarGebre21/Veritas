import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button
} from "@heroui/react";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function NavBar() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
    <Navbar 
      isBlurred 
      maxWidth="xl" 
      className="px-4 sm:px-6 lg:px-8"
      classNames={{
        wrapper: "px-0",
        base: "bg-background/90 backdrop-blur-xl",
      }}
    >
      {/* Mobile Menu Toggle */}
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle />
      </NavbarContent>

      {/* Mobile Brand */}
      <NavbarContent className="sm:hidden" justify="center">
        <NavbarBrand>
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-inherit text-lg hover:opacity-80 transition-opacity"
          >
            <img
              src={logoSrc}
              alt="Veritas logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-contain"
            />
            Veritas
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Navigation */}
      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        <NavbarBrand className="mr-8">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold tracking-tight text-2xl hover:opacity-80 transition-opacity"
          >
            <img
              src={logoSrc}
              alt="Veritas logo"
              width={34}
              height={34}
              className="h-8 w-8 rounded-lg object-contain"
            />
            Veritas
          </Link>
        </NavbarBrand>
        
        <div className="flex items-center gap-2">
          <NavbarItem>
            <Button as={Link} href="#product" variant="light" size="sm" className="px-3">
              Home
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} href="#pricing" variant="light" size="sm" className="px-3">
              Pricing
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} href="#testimonials" variant="light" size="sm" className="px-3">
              Testimonials
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} href="#faq" variant="light" size="sm" className="px-3">
              FAQ
            </Button>
          </NavbarItem>
        </div>

        <NavbarItem>
            <Button as={Link} href="#system-modules" variant="light" size="sm" className="px-3">
              System Modules
            </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Right Side Actions */}
      <NavbarContent justify="end" className="gap-3">
        <NavbarItem className="hidden sm:flex">
          <Button
            as={Link}
            href="#pricing"
            variant="solid"
            size="sm"
            className="px-4 transition-all duration-200 hover:bg-light hover:text-white hover:shadow-[0_0_18px_rgba(91,168,255,0.55)]"
          >
            Sign In
          </Button>
        </NavbarItem>
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className="pt-6">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              className="w-full text-lg"
              href={item.href}
              size="lg"
              color="foreground"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem className="pt-4">
          <Button
            as={Link}
            href="#pricing"
            variant="solid"
            size="lg"
            className="w-full transition-all duration-200 hover:bg-light hover:text-white hover:shadow-[0_0_18px_rgba(91,168,255,0.55)]"
          >
            Sign In
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
