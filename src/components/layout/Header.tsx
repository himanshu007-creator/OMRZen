import { Moon, Sun, RotateCcw, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header({ onReset }: { onReset: () => void }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = () => {
    // Clear all test-related data from localStorage
    localStorage.removeItem("testConfig");
    localStorage.removeItem("answers");
    localStorage.removeItem("timeLeft");
    localStorage.removeItem("testCompleted");
    localStorage.removeItem("correctAnswers");
    onReset();
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50"
    >
      <div className="container flex h-16 items-center justify-between px-6 sm:px-12">
        <h1 
          className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent animate-pulse [animation-duration:3s]"
        >
          OMRZen
        </h1>
        <motion.div 
          className="flex gap-1 sm:gap-3"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.a
                  href="https://www.producthunt.com/posts/omrzen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 transition-transform flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image 
                    src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=897849&theme=${theme}&t=1740023496918`}
                    alt="OMRZen - Modern omr sheet testing platform | Product Hunt"
                    width={150}
                    height={36}
                    className="h-7 w-auto sm:h-9 sm:w-auto mx-3"
                    priority
                  />
                </motion.a>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-medium">
                Featured on Product Hunt
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open('https://github.com/himanshu007-creator/omrzen', '_blank')}
                  className="hover:scale-105 transition-transform"
                >
                  <Github className="h-5 w-5 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-medium">
                Star on GitHub
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="hover:scale-105 transition-transform"
                >
                  <RotateCcw className="h-5 w-5 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-medium">
                Reset Test
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="relative hover:scale-105 transition-transform"
                >
                  <Sun className="h-5 w-5 absolute rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-primary" />
                  <Moon className="h-5 w-5 absolute rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-medium">
                {mounted ? (theme === "light" ? "Dark mode" : "Light mode") : "Toggle theme"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      </div>
    </motion.header>
  );
}