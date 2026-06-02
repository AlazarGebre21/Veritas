import { useState } from "react";
import { Card, CardBody, CardFooter } from "@heroui/react";
import { Button } from "@heroui/react";
import { Divider } from "@heroui/react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Pricing() {
  const [billing, setBilling] = useState("monthly");

  const plans = [
    {
      name: "Basic",
      desc: "Academic essentials for departments to host secure quiz pools",
      monthlyPriceETB: 600,
      isMostPop: false,
      cta: "Get Veritas Basic",
      features: [
        "Unlimited assessments",
        "Manual/Auto grading panel",
        "Tab-switch limit triggers",
        "Smart mouse & activity logs",
        "JWT secure student tokens",
      ],
    },
    {
      name: "Premium",
      desc: "Best for high-stakes university courses and screening recruitments",
      monthlyPriceETB: 1200,
      isMostPop: true,
      cta: "Get Veritas Premium",
      features: [
        "Everything in Basic",
        "Continuous facial recognition checks",
        "Eye-gaze and pupil focus tracking",
        "Cheating probability index reports",
        "Automated digital certificate engine",
      ],
    },
    {
      name: "Enterprise",
      desc: "Multi-tenant scale for universities, large banks, and enterprises",
      monthlyPriceETB: 3900,
      isMostPop: false,
      cta: "Get Veritas Enterprise",
      features: [
        "Everything in Premium",
        "Isolated multi-tenant workspaces",
        "Custom domains (exams.aau.edu.et)",
        "SSO (SAML, LDAP, OAuth2) sync",
        "EPDPP compliant cloud residency",
        "Priority 24/7 technical integration SLA",
      ],
    },
  ];

  const formatETB = (amount) =>
    amount.toLocaleString("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    });

  const priceForCycle = (monthlyPriceETB, cycle) => {
    if (cycle === "monthly") return monthlyPriceETB;
    return Math.round(monthlyPriceETB * 0.85);
  };

  return (
    <motion.section
      id="pricing"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{
        y: 0,
        opacity: 1,
      }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.5, type: "spring", bounce: 0 }}
      className="max-w-screen-xl w-full mx-auto px-4 py-28 gap-5 md:px-8 flex flex-col justify-center items-center"
    >
      <div className="flex flex-col gap-3 items-center text-center">
        <span className="text-xs uppercase tracking-wide px-3 py-1 rounded-full border border-border bg-background/70">Pricing</span>
        <h3 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
          Flexible Pricing Models Built for Local Institutions & Enterprises
        </h3>
        <p className="max-w-xl text-muted-foreground text-center">
          Secure your remote examinations at any scale. Pick a proctoring tier aligned with your evaluation stakes.
        </p>
      </div>
      <div className="mt-6">
        <Tabs
          defaultValue={billing}
          onValueChange={(v) => setBilling(v ?? "monthly")}
          className="items-center"
        >
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly"></TabsContent>
          <TabsContent value="yearly"></TabsContent>
        </Tabs>
      </div>
      <div className="mt-16 gap-10 grid lg:grid-cols-3 place-content-center">
        {plans.map((item, idx) => (
          <Card
            key={idx}
            shadow="none"
            className={`relative rounded-[20px] p-[3px] will-change-transform ${
              item.isMostPop ? "sm:scale-110" : ""
            }`}
          >
            {item.isMostPop ? (
              <span className="absolute inset-[-1000%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#016FEE_70%,#C7DBFB_100%)]" />
            ) : (
              <span className="absolute inset-[-1000%] bg-border" />
            )}
            <div className="z-[2] flex flex-col justify-between w-full h-full bg-card rounded-[18px] p-5">
              <CardBody className="w-full flex items-start gap-3">
                <div className="flex flex-col">
                  <h4 className="text-xl font-medium">{item.name}</h4>
                  <span className="text-muted-foreground text-sm font-light">
                    {item.desc}
                  </span>
                </div>
                <div className="flex flex-col items-start gap-1">
                  {billing === "yearly" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="w-full"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-medium">
                          {formatETB(priceForCycle(item.monthlyPriceETB, "yearly"))}
                          <span className="text-sm font-light"> / month</span>
                        </span>
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          className="p-2 bg-primary/10 rounded-lg border border-primary/20"
                        >
                          <span className="text-lg font-medium text-primary">
                            {formatETB(priceForCycle(item.monthlyPriceETB, "yearly") * 12)}
                            <span className="text-sm font-light"> / year</span>
                          </span>
                        </motion.div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <span className="text-xs text-muted-foreground font-light">billed yearly</span>
                        <div className="text-xs text-muted-foreground font-light">
                          Save {formatETB(item.monthlyPriceETB * 12 - priceForCycle(item.monthlyPriceETB, "yearly") * 12)} annually
                        </div>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="w-full"
                    >
                      <span className="text-lg font-medium">
                        {formatETB(priceForCycle(item.monthlyPriceETB, "monthly"))}
                        <span className="text-sm font-light"> / month</span>
                      </span>
                    </motion.div>
                  )}
                </div>

                <Divider />

                <div className="flex flex-col gap-5 pb-5">
                  <span className="text-muted-foreground text-sm font-medium">
                    Includes
                  </span>
                  <ul className="flex flex-col gap-2">
                    {item.features.map((feature, index) => (
                      <li key={index} className="text-sm font-light">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardBody>
              <CardFooter className="p-0">
                <Button
                  className="w-full"
                  variant="solid"
                  color={item.isMostPop ? "primary" : "default"}
                >
                  {item.cta}
                </Button>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}
