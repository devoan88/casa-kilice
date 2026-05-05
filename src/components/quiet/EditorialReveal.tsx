"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function EditorialReveal({
  children,
  className,
  delay = 0,
  ...rest
}: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px", amount: 0.15 }}
      transition={{ duration: 0.85, ease, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
