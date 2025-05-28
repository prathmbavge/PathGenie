import React, { useState, memo } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

// Glow color palette
const glowStyles = {
  blue: "border-neon-blue/70 hover:border-neon-blue shadow-neon-blue/20 hover:shadow-neon-blue/40",
  pink: "border-neon-pink/70 hover:border-neon-pink shadow-neon-pink/20 hover:shadow-neon-pink/40",
  purple:
    "border-neon-purple/70 hover:border-neon-purple shadow-neon-purple/20 hover:shadow-neon-purple/40",
};

const AccordionSection = memo(({ title, icon: Icon, glow, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div
      className={`group backdrop-blur-lg ${glowStyles[glow]} transition-all duration-300 border-2 border-neon-blue/30 hover:border-neon-blue/50 hover:shadow-[0_0_15px_#00f0ff]`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-3">
          {Icon}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown className="h-5 w-5 text-neon-pink transition-colors" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
export default AccordionSection;
