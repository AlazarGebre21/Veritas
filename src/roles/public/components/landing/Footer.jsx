import { Link } from "react-router-dom";
import {
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  const linkClass =
    "text-sm text-muted-foreground hover:text-foreground transition-colors";

  return (
    <footer className="w-full px-0 py-16 md:py-24">
      <div className="w-full">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
          <div className="absolute inset-0 bg-gradient-to-b from-background to-light/20 dark:from-card dark:to-light/10" />

          {/* Constrain inner content to align with navbar brand gutter */}
          <div className="relative z-[1] py-12 md:py-16 max-w-screen-xl mx-auto pr-4 sm:pr-6 lg:pr-8 pl-0 sm:pl-2 lg:pl-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
              <div className="md:col-span-2 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-light tracking-tighter text-2xl text-foreground">Veritas</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  An AI-Enhanced Online Assessment & Monitoring System designed to guarantee remote evaluation integrity with non-intrusive smart proctoring analytics.
                </p>
                <div className="mt-2 text-xs text-muted-foreground border-l-2 border-primary/40 pl-3">
                  <span className="font-bold text-foreground block mb-1">Addis Ababa Science & Technology University</span>
                  Department of Software Engineering, Oct 2025
                </div>

                <div className="flex items-center gap-3">
                  <Link href="#" aria-label="X / Twitter" className="text-muted-foreground hover:text-foreground">
                    <Twitter size={18} />
                  </Link>
                  <Link href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground">
                    <Linkedin size={18} />
                  </Link>
                  <Link href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground">
                    <Github size={18} />
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium">Platform</span>
                <ul className="flex flex-col gap-2">
                  <li>
                    <Link href="#product" className={linkClass}>
                      Features
                    </Link>
                  </li>
                  <li>
                    <a href="#pricing" className={linkClass}>
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#testimonials" className={linkClass}>
                      Testimonials
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className={linkClass}>
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium">AASTU Project Team</span>
                <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <li className="font-semibold text-foreground">1. Abraham Mulugeta</li>
                  <li className="pl-3">ID: ETS0107/14</li>
                  <li className="font-semibold text-foreground">2. Alazar Gebre</li>
                  <li className="pl-3">ID: ETS0132/14</li>
                  <li className="font-semibold text-foreground">3. Tadiyos Dejene</li>
                  <li className="pl-3">ID: ETS1522/14</li>
                  <li className="font-semibold text-foreground">4. Tamirat Dejene</li>
                  <li className="pl-3">ID: ETS1518/14</li>
                  <li className="font-semibold text-foreground">5. Yohannes Tigistu</li>
                  <li className="pl-3">ID: ETS1703/14</li>
                </ul>
              </div>
            </div>

            <div className="w-full h-px bg-border my-8" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>© {year} Veritas. All rights reserved.</span>
                <span className="text-border">|</span>
                <span>
                  AASTU Software Engineering Capstone
                </span>
              </div>
              <div className="flex items-center gap-6">
                <Link href="#" className={linkClass}>
                  Privacy Policy
                </Link>
                <Link href="#" className={linkClass}>
                  Terms of Service
                </Link>
                <Link href="#" className={linkClass}>
                  Cookie Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
