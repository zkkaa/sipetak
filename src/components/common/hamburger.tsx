import { motion } from "framer-motion";

const sidebarVariants = {
  open: {
    clipPath: `circle(1200px at 90vw 10px)`,
    transition: {
      type: "spring",
      stiffness: 20,
      restDelta: 2,
    },
    pointerEvents: "auto" as const,
  },
  closed: {
    clipPath: "circle(30px at 110vw 10px)",
    transition: {
      delay: 0.2,
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
    pointerEvents: "none" as const,
  },
};

const backgroundVariants = {
  open: { opacity: 1, transition: { delay: 0.1 } },
  closed: { opacity: 1 },
};

const navVariants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};


// eslint-disable-next-line
const Path = (props: any) => ( 
  <motion.path
    fill="transparent"
    strokeWidth="3"
    stroke="hsl(0, 0%, 18%)"
    strokeLinecap="round"
    {...props}
  />
);

const MenuToggle = ({ toggle, isOpen }: { toggle: () => void; isOpen: boolean }) => (
  <button
    style={{
      outline: "none",
      border: "none",
      cursor: "pointer",
      width: 50,
      height: 50,
      borderRadius: "50%",
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
    aria-label="Toggle menu"
    onClick={toggle}
  >
    <svg width="23" height="23" viewBox="0 0 23 23">
      <Path
        variants={{
          closed: { d: "M 2 2.5 L 20 2.5" },
          open: { d: "M 3 16.5 L 17 2.5" },
        }}
        animate={isOpen ? "open" : "closed"}
      />
      <Path
        d="M 2 9.423 L 20 9.423"
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 },
        }}
        transition={{ duration: 0.1 }}
        animate={isOpen ? "open" : "closed"}
      />
      <Path
        variants={{
          closed: { d: "M 2 16.346 L 20 16.346" },
          open: { d: "M 3 2.5 L 17 16.346" },
        }}
        animate={isOpen ? "open" : "closed"}
      />
    </svg>
  </button>
)

export {
  sidebarVariants,
  backgroundVariants,
  navVariants,
  itemVariants,
  Path,
  MenuToggle,
};