import { motion } from "framer-motion";
import {
  XCircle,
  CheckCircle,
  Plus
} from "lucide-react";
import { FollowerPointerCard } from "@/components/ui/following-pointer";

const traditionalPlatforms = [
  "Scattered tools for registration, exams, proctoring, and reporting",
  "Manual monitoring that makes suspicious activity easy to miss",
  "Weak tenant separation and limited branding control",
  "Slow audits because logs live in different systems",
  "Hard to scale without adding more admin overhead",
];

const veritasAdvantages = [
  "Centralized exam dashboard with identity, scheduling, and reporting in one place",
  "Real-time monitoring for tab switches, webcam verification, and session anomalies",
  "Support for essay-type questions with AI-enhanced answer analysis and grading insights",
  "Tenant-based setup for institutions, departments, or client organizations",
  "Structured audit trails that make compliance and incident review faster",
];

export default function HowItWorks() {
  return (
    <section className="relative max-w-screen-xl w-full mx-auto px-4 py-24 md:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, type: "spring", bounce: 0 }}
          className="text-center"
        >
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-border bg-background/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground shadow-sm mx-auto">
              Comparison
            </span>
            <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-balance text-foreground md:text-5xl">
              From Chaos to Clarity: Simplify Assessment Management
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Traditional assessment platforms split critical work across multiple tools. Veritas keeps everything in one secure flow so teams can work faster, audit easier, and scale with less friction.
            </p>
          </div>
        </motion.div>

        <FollowerPointerCard title="Veritas vs Traditional Platforms">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-border bg-background/70 p-4 shadow-sm dark:bg-transparent">
              <div className="rounded-2xl bg-background px-4 py-3 text-center text-sm font-semibold text-foreground shadow-inner dark:bg-transparent">
                Traditional Platforms
              </div>
              <div className="mt-4 space-y-3 rounded-2xl bg-white/70 p-4 dark:bg-transparent dark:border dark:border-white/10">
                <p className="text-sm font-medium text-foreground">Challenges</p>
                <div className="space-y-3">
                  {traditionalPlatforms.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sky-400/50 text-sky-500">
                        <XCircle className="h-3.5 w-3.5" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-[#0f3f59] p-4 shadow-[0_18px_50px_rgba(15,63,89,0.32)]">
              <div className="rounded-2xl bg-light px-4 py-3 text-center text-sm font-semibold text-white shadow-sm">
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Veritas
                </span>
              </div>
              <div className="mt-4 space-y-3 rounded-2xl bg-[#0d3146] p-4">
                <p className="text-sm font-medium text-white/90">Our solution</p>
                <div className="space-y-3">
                  {veritasAdvantages.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm leading-6 text-white/85">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-sky-200">
                        <CheckCircle className="h-3.5 w-3.5" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FollowerPointerCard>
      </div>
    </section>
  );
}
