import { Accordion, AccordionItem } from "@heroui/react";
import { motion } from "framer-motion";

export default function Faq() {
  const accordionItems = [
    {
      title: "How does Veritas detect cheating without violating examinee privacy?",
      content: (
        <div className="text-muted-foreground">
          Veritas conducts proctoring calculations directly within the browser sandbox. Gaze vectors and facial landmarks are analyzed mathematically without recording, storing, or streaming raw video feeds. This safeguards student identity sovereignty completely.
        </div>
      ),
    },
    {
      title: "Is Veritas compliant with Ethiopia's Personal Data Protection Proclamation (EPDPP)?",
      content: (
        <div className="text-muted-foreground">
          Yes. Veritas supports local server deployments and end-to-end database encryption. All candidate records, exam results, and biometric features remain strictly stored in localized database residency, compliant with the legislative parameters of the Ethiopian EPDPP act.
        </div>
      ),
    },
    {
      title: "Does the system support unstable internet connections (offline resiliency)?",
      content: (
        <div className="text-muted-foreground">
          Yes. Veritas integrates offline cache-mechanisms. If a candidate experiences a temporary network drop, client-side proctoring models continue executing locally, storing time-stamped incident logs in secure memory. Once connection is re-established, the telemetry logs sync seamlessly.
        </div>
      ),
    },
    {
      title: "Does Veritas automatically fail a student if an anomaly is flagged?",
      content: (
        <div className="text-muted-foreground">
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

          <div className="mt-12 w-full max-w-4xl mx-auto">
            <Accordion
              fillWidth
              selectionMode="multiple"
              variant="splitted"
              motionProps={{
                variants: {
                  enter: {
                    y: 0,
                    opacity: 1,
                    height: "auto",
                    transition: {
                      height: {
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        duration: 1,
                      },
                      opacity: {
                        easings: "ease",
                        duration: 1,
                      },
                    },
                  },
                  exit: {
                    y: -10,
                    opacity: 0,
                    height: 0,
                    transition: {
                      height: {
                        easings: "ease",
                        duration: 0.25,
                      },
                      opacity: {
                        easings: "ease",
                        duration: 0.3,
                      },
                    },
                  },
                },
              }}
            >
              {accordionItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  aria-label={item.title}
                  title={item.title}
                  className="text-muted-foreground"
                >
                  {item.content}
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
