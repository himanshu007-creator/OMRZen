"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { clearLocalStorage } from "@/lib/utils";
import { Toast } from "@/components/ui/toast";
import { useForm } from "react-hook-form";

type TestConfigForm = {
  questionCount: string;
  positiveMarks: string;
  negativeMarks: string;
  timeInMinutes: string;
};

export default function Home() {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch } = useForm<TestConfigForm>({
    defaultValues: {
      questionCount: "10",
      positiveMarks: "4",
      negativeMarks: "1",
      timeInMinutes: "30",
    },
  });

  const handleReset = () => {
    clearLocalStorage();
    localStorage.removeItem("timeLeft");
    window.location.reload();
  };

  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [isTimeInHours, setIsTimeInHours] = useState(false);

  const handleStartTest = (data: TestConfigForm) => {
    const parsedConfig = {
      questionCount: data.questionCount ? parseInt(data.questionCount) : 0,
      positiveMarks: data.positiveMarks ? parseFloat(data.positiveMarks) : 0,
      negativeMarks: data.negativeMarks ? parseFloat(data.negativeMarks) : 0,
      timeInMinutes: data.timeInMinutes ? (isTimeInHours ? parseInt(data.timeInMinutes) * 60 : parseInt(data.timeInMinutes)) : 0,
    };

    // Validate question count
    if (parsedConfig.questionCount < 5 || parsedConfig.questionCount > 100) {
      showToast('Number of questions must be between 5 and 100', 'error');
      return;
    }

    // Validate marks
    if (parsedConfig.positiveMarks <= 0) {
      showToast('Marks for correct answer must be greater than 0', 'error');
      return;
    }

    if (parsedConfig.negativeMarks < 0) {
      showToast('Marks for incorrect answer cannot be negative', 'error');
      return;
    }

    // Validate time
    const maxMinutes = isTimeInHours ? 300 : 300;
    const minMinutes = 1;
    const currentMinutes = parsedConfig.timeInMinutes;

    if (currentMinutes < minMinutes || currentMinutes > maxMinutes) {
      showToast(`Test duration must be between ${minMinutes} minute and 5 hours`, 'error');
      return;
    }

    localStorage.setItem("testConfig", JSON.stringify(parsedConfig));
    router.push("/test");
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
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
              Replace OMR sheets with this minimalist checker: Take tests, check answers instantly, and save reports for future reference
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
                <Label htmlFor="questionCount">Number of Questions (Max 200)</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min={1}
                  max={200}
                  {...register("questionCount")}
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
                  step={1}
                  {...register("positiveMarks")}
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
                  step={1}
                  {...register("negativeMarks")}
                />
              </motion.div>

              <motion.div 
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center">
                  <Label htmlFor="timeInMinutes">Test duration (in {isTimeInHours ? 'hours' : 'minutes'})</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentValue = parseInt(watch("timeInMinutes") || "0");
                      if (isTimeInHours) {
                        // Converting hours to minutes
                        setValue("timeInMinutes", Math.min(300, (currentValue * 60)).toString());
                      } else {
                        // Converting minutes to hours
                        setValue("timeInMinutes", Math.min(5, Math.floor(currentValue / 60)).toString());
                      }
                      setIsTimeInHours(!isTimeInHours);
                    }}
                    className="text-xs"
                  >
                    Switch to {isTimeInHours ? 'minutes' : 'hours'}
                  </Button>
                </div>
                <Input
                  id="timeInMinutes"
                  type="number"
                  min={1}
                  max={isTimeInHours ? 5 : 300}
                  step={isTimeInHours ? 0.5 : 1}
                  placeholder={`Enter duration in ${isTimeInHours ? 'hours (max 5)' : 'minutes (max 300)'}`}
                  {...register("timeInMinutes")}
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
                onClick={handleSubmit(handleStartTest)}
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
