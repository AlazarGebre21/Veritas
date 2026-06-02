import { motion } from "framer-motion";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Dr. Solomon Kassa",
      role: "Academic Coordinator at Addis Ababa University (AAU)",
      avatar: "https://i.pravatar.cc/150?img=68",
      content:
        "Veritas transformed our semester examinations. The continuous face checks and tab lockdown features fully restored academic integrity across remote evaluations.",
      rating: 5,
    },
    {
      name: "Liya Tsegaye",
      role: "Director of Talent Acquisition at Ethio Telecom",
      avatar: "https://i.pravatar.cc/150?img=47",
      content:
        "Recruiting thousands of fresh graduates was an administrative nightmare. Veritas automated screening, proctored assessments flawlessly, and verified true candidate scores.",
      rating: 5,
    },
    {
      name: "Bekele Yohannes",
      role: "VP of Human Capital at Commercial Bank of Ethiopia (CBE)",
      avatar: "https://i.pravatar.cc/150?img=11",
      content:
        "The strict compliance with Ethiopia's data residency act (EPDPP) was a non-negotiable for us. Veritas delivered enterprise-grade security and complete auditability.",
      rating: 5,
    },
    {
      name: "Dr. Mulugeta Abebe",
      role: "Dean of Computing at Addis Ababa Science and Technology University (AASTU)",
      avatar: "https://i.pravatar.cc/150?img=57",
      content:
        "Seeing a student-led capstone project reach this production standard is outstanding. Veritas matches global proctoring standards with localized infrastructure flexibility.",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20 flex flex-col gap-3 items-center"
        >
          <span className="text-xs uppercase tracking-wide px-3 py-1 rounded-full border border-border bg-background/70">Testimonials</span>
          <h2 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Trusted by Major Universities, HR Directors, and CAP Recruiting Teams
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground text-center">
            Restoring examinee transparency and confidence with Veritas proctoring analytics.
          </p>
        </motion.div>

        <InfiniteMovingCards
          className="mt-2"
          items={testimonials.map((t) => ({
            quote: t.content,
            name: t.name,
            title: t.role,
            rating: t.rating,
          }))}
          direction="right"
          speed="slow"
          pauseOnHover
        />
      </div>
    </section>
  );
}
