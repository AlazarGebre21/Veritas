import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const accordionItems = [
    {
      title: "How does Veritas detect cheating without violating examinee privacy?",
      content: (
        <div className="text-muted-foreground pb-4">
          Veritas conducts proctoring calculations directly within the browser sandbox. Gaze vectors and facial landmarks are analyzed mathematically without recording, storing, or streaming raw video feeds. This safeguards student identity sovereignty completely.
        </div>
      ),
    },
    {
      title: "Is Veritas compliant with Ethiopia's Personal Data Protection Proclamation (EPDPP)?",
      content: (
        <div className="text-muted-foreground pb-4">
          Yes. Veritas supports local server deployments and end-to-end database encryption. All candidate records, exam results, and biometric features remain strictly stored in localized database residency, compliant with the legislative parameters of the Ethiopian EPDPP act.
        </div>
      ),
    },
    {
      title: "Does the system support unstable internet connections (offline resiliency)?",
      content: (
        <div className="text-muted-foreground pb-4">
          Yes. Veritas integrates offline cache-mechanisms. If a candidate experiences a temporary network drop, client-side proctoring models continue executing locally, storing time-stamped incident logs in secure memory. Once connection is re-established, the telemetry logs sync seamlessly.
        </div>
      ),
    },
    {
      title: "Does Veritas automatically fail a student if an anomaly is flagged?",
      content: (
        <div className="text-muted-foreground pb-4">
          No. Veritas does not take automated punitive actions. The system calculates a Cheating Probability Score and highlights activities in the admin cockpit. Final evaluation verdicts are left to authorized academic coordinators and proctors to prevent unfair penalties.
        </div>
      ),
    },
  ];

  return (
    <motion.section
      id="faq"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{
        y: 0,
        opacity: 1,
      }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.5, type: "spring", bounce: 0 }}
      className="relative w-full max-w-screen-2xl mx-auto px-4 md:px-8 py-28 flex flex-col justify-center items-center"
    >
      <div className="relative w-full rounded-3xl overflow-hidden bg-card/70">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-light/10 dark:from-card/80 dark:to-light/5" />
 
        <div className="relative z-[1] w-full px-6 md:px-14 py-16">
          <div className="flex flex-col gap-3 justify-center items-center text-center">
            <span className="text-xs uppercase tracking-wide px-3 py-1 rounded-full border border-border bg-background/70">FAQs</span>
            <h2 className="text-4xl font-semibold sm:text-5xl md:text-6xl tracking-tight bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-4xl text-base md:text-lg text-muted-foreground">
              Everything you need to know about Veritas and how it helps deliver secure, transparent online examinations.
            </p>
          </div>

          <div className="mt-12 w-full max-w-3xl mx-auto space-y-4">
            {accordionItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="rounded-2xl border border-border bg-card/50 px-6 py-2 transition-colors hover:bg-card">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between py-4 text-left font-medium text-foreground outline-none focus:ring-0"
                  >
                    <span className="tracking-tight">{item.title}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        {item.content}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
