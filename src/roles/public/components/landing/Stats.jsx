import { motion } from "framer-motion";

export default function Stats() {
  const stats = [
    { number: "99.8%", label: "Proctoring accuracy" },
    { number: "5,000+", label: "Concurrent candidates" },
    { number: "< 50ms", label: "Telemetry response" },
    { number: "100%", label: "EPDPP compliant" },
  ];

  return (
    <section className="relative px-4 py-20 md:px-8">
      <div className="mx-auto max-w-screen-xl rounded-[2rem] border border-border bg-card/55 px-4 py-10 shadow-sm md:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="inline-flex w-fit rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            At a glance
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Built to keep complex operations clear.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className="rounded-2xl border border-border bg-background/90 p-5 text-center shadow-sm"
            >
              <div className="text-3xl font-semibold tracking-tight md:text-4xl">
                {stat.number}
              </div>
              <div className="mt-2 text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
