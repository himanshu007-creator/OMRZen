"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [testConfig, setTestConfig] = useState({
    questionCount: 10,
    positiveMarks: 4,
    negativeMarks: 1,
    timeInMinutes: 30,
  });

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleStartTest = () => {
    localStorage.setItem("testConfig", JSON.stringify(testConfig));
    router.push("/test");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onReset={handleReset} />
      <main className="container max-w-lg mx-auto pt-24 px-6 sm:px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-1 sm:space-y-4 text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent animate-pulse [animation-duration:3s]">
              OMRZen
            </h1>
            <p className="text-sm sm:text-md text-muted-foreground max-w-md mx-auto">
              A minimalist OMR sheet checker. Take tests, check answers instantly, and save reports for future reference.
            </p>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6 bg-card p-6 rounded-2xl border dark:shadow-primary/5 shadow-xl dark:shadow-primary/10 transition-shadow"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Test Configuration</h2>
              <p className="text-muted-foreground text-sm">Set up your test parameters</p>
            </div>

            <div className="space-y-2">
              <motion.div 
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="questionCount">Number of Questions (Max 100)</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min={1}
                  max={100}
                  value={testConfig.questionCount}
                  onChange={(e) =>
                    setTestConfig({
                      ...testConfig,
                      questionCount: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)),
                    })
                  }
                />
              </motion.div>

              <motion.div 
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="positiveMarks">Marks for Correct Answer</Label>
                <Input
                  id="positiveMarks"
                  type="number"
                  min={0}
                  step={0.5}
                  value={testConfig.positiveMarks}
                  onChange={(e) =>
                    setTestConfig({
                      ...testConfig,
                      positiveMarks: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </motion.div>

              <motion.div 
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="negativeMarks">Marks for Incorrect Answer</Label>
                <Input
                  id="negativeMarks"
                  type="number"
                  min={0}
                  step={0.5}
                  value={testConfig.negativeMarks}
                  onChange={(e) =>
                    setTestConfig({
                      ...testConfig,
                      negativeMarks: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </motion.div>

              <motion.div 
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="timeInMinutes">Test duration (in minutes)</Label>
                <Input
                  id="timeInMinutes"
                  type="number"
                  min={1}
                  value={testConfig.timeInMinutes}
                  onChange={(e) =>
                    setTestConfig({
                      ...testConfig,
                      timeInMinutes: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </motion.div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base font-medium sm:text-lg sm:font-semibold"
                size="lg"
                onClick={handleStartTest}
              >
                Start Test
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
