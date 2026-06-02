import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section id="product" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top,_rgba(91,168,255,0.18),_transparent_42%),radial-gradient(circle_at_80%_20%,_rgba(91,168,255,0.12),_transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-64px)] max-w-screen-xl flex-col justify-center px-4 py-10 md:px-8 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0 }}
          className="mx-auto flex w-full max-w-5xl flex-col items-center text-center"
        >
          <div aria-hidden="true" className="h-8" />

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-balance text-foreground md:text-6xl lg:text-7xl">
            Secure assessments with a cleaner, smarter <span className="rounded-md bg-light/15 px-2 py-0.5 text-light shadow-[0_0_20px_rgba(91,168,255,0.18)]">Veritas</span> experience.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            Build trusted exam flows, monitor activity in real time, and present every tenant, subscription, and audit signal in one calm dashboard.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button as={Link} href="#pricing" color="primary" variant="solid" className="px-6">
              Get Started
            </Button>
            <Button
              as={Link}
              href="#system-modules"
              variant="flat"
              className="border border-border bg-background/70 px-6 text-foreground transition-all duration-200 hover:border-light hover:bg-light hover:text-white hover:shadow-[0_0_18px_rgba(91,168,255,0.55)]"
            >
              Sign In
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3 rounded-full border border-border bg-background/75 px-4 py-2 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-0.5 text-amber-400">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <span className="font-semibold text-foreground">5.0</span>
              <span className="text-muted-foreground">From 80+ reviews</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-background/75 px-4 py-2 shadow-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]" />
              <span className="font-medium text-foreground">Trusted by academic and enterprise teams</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, type: "spring", bounce: 0 }}
          className="relative mx-auto mt-10 w-full max-w-6xl"
        >
          <div className="absolute -left-4 top-10 hidden h-24 w-24 rounded-full bg-light/15 blur-3xl md:block" />
          <div className="absolute -right-4 bottom-12 hidden h-32 w-32 rounded-full bg-light/20 blur-3xl md:block" />

          <div className="relative overflow-hidden rounded-[1.75rem] bg-transparent">
            <img
              src="/Images/snapshot.png"
              alt="Veritas dashboard snapshot"
              width={1600}
              height={1816}
              className="h-auto w-full object-contain"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
