import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Cta() {
  return (
    <section id="cta" className="relative px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-screen-xl">
        <div className="relative z-10 flex items-center justify-center">
          <div className="w-full max-w-4xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0 }}
              className="mx-auto"
            >
              <div className="relative w-full rounded-[2.25rem] border border-border bg-card px-6 py-10 text-center shadow-sm sm:px-10 sm:py-14 transform-gpu transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(2,6,23,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/25">
                <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Join these enterprises
                </div>

                <h3 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  Join these enterprises and modernize your solutions.
                </h3>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Bring secure assessments, real-time oversight, and cleaner workflows into one trusted Veritas experience for teams that need clarity at scale.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button as={Link} href="#pricing" color="primary" variant="solid" className="px-7">
                    Start now
                  </Button>
                  <Button
                    as={Link}
                    href="#system-modules"
                    variant="flat"
                    className="border border-border bg-background px-7 text-foreground shadow-sm transition-all duration-200 hover:border-light hover:bg-light hover:text-white"
                  >
                    Explore modules
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
