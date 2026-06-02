import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const icon = mounted && resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />;

  return (
    <Button isIconOnly variant="light" onPress={handleClick}>
      {icon}
    </Button>
  );
}
