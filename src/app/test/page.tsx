"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock1, Clock2, Clock3, Clock4, Clock5, Clock6, Clock7, Clock8, Clock9, Clock10, Clock11, Clock12, MoveHorizontal, ChevronLeft, Eraser } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { clearLocalStorage } from "@/lib/utils";

type TestConfig = {
  questionCount: number;
  positiveMarks: number;
  negativeMarks: number;
  timeInMinutes: number;
};

type Answer = "A" | "B" | "C" | "D";

export default function TestPage() {
  const router = useRouter();
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>('right');

    const instructions = [
        "Breathe; answer mindfully.",
        "Trust yourself; stay present.",
        "Choose questions freely."
    ];

  useEffect(() => {
    const instructionInterval = setInterval(() => {
      setCurrentInstruction((prev) => (prev + 1) % instructions.length);
    }, 3000);

    return () => clearInterval(instructionInterval);
  }, []);

  useEffect(() => {
    const savedConfig = localStorage.getItem("testConfig");
    if (!savedConfig) {
      router.push("/");
      return;
    }
    const config = JSON.parse(savedConfig) as TestConfig;
    setTestConfig(config);

    const savedTime = localStorage.getItem("timeLeft");
    if (savedTime) {
      setTimeLeft(parseInt(savedTime));
    } else {
      setTimeLeft(config.timeInMinutes * 60);
    }

    const savedAnswers = localStorage.getItem("answers");
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, [router]);

  const handleSubmit = useCallback(() => {
    localStorage.setItem("answers", JSON.stringify(answers))
    localStorage.setItem("testCompleted", "true");
    router.push("/check");
  }, [router]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    localStorage.setItem("timeLeft", timeLeft.toString());

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const buttonParentRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    if (Object.keys(answers).length === 0) {
      setToast({ message: "Test not attempted! Please answer at least one question.", type: "error" });
      setTimeout(() => {
        clearLocalStorage();
        router.push("/");
      }, 2000);
      return;
    }
    clearLocalStorage();
    router.push("/");
  };

  const handleAnswer = (answer: Answer) => {
    const newAnswers = { ...answers, [currentQuestion]: answer };
    setAnswers(newAnswers);
    localStorage.setItem("answers", JSON.stringify(newAnswers));

    if (currentQuestion < (testConfig?.questionCount || 0)) {
      // Remove hover and focus states from all buttons
      const buttons = buttonParentRef.current?.querySelectorAll('button');
      buttons?.forEach(button => {
        button.blur();
        button.classList.remove('hover');
      });

      // Synthetic click on parent
      buttonParentRef.current?.click();

      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    }
  };

  if (!testConfig) return null;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isTimeRunningLow = () => {
    if (!testConfig) return false;
    const totalSeconds = testConfig.timeInMinutes * 60;
    return timeLeft <= totalSeconds * 0.05;
  };

  const toggleSidebarPosition = () => {
    setSidebarPosition(prev => prev === 'right' ? 'left' : 'right');
  };

  const sidebarContent = (
    <div className="w-16 md:w-[320px] border-x border-gray-100 h-screen overflow-hidden bg-secondary flex flex-col">
      <div className="p-2 md:p-4 md:pb-1 pb-1 sticky top-14 z-10 bg-secondary border-b">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebarPosition}
                className="mb-4 w-full flex items-center justify-center hover:bg-muted"
              >
                <MoveHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={sidebarPosition === 'right' ? 'left' : 'right'}>
              Move to {sidebarPosition === 'right' ? 'left' : 'right'} side
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex-1 overflow-y-auto p-2 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 py-4 pt-16">
          {Array.from({ length: testConfig.questionCount }, (_, i) => i + 1).map((num) => (
            <motion.button
              key={num}
              onClick={() => setCurrentQuestion(num)}
              className={`h-12 w-full md:h-6 md:w-6 text-xs flex border border-primary items-center justify-center rounded mx-auto ${answers[num] ? 'bg-blue-500 text-white' : 'border border-gray-100 hover:bg-muted'} ${currentQuestion === num ? 'ring-1 ring-primary' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                scale: answers[num] ? [1, 1.1, 1] : 1,
                transition: { duration: 0.2 }
              }}
            >
              {num}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {sidebarPosition === 'left' && sidebarContent}
      <div className="flex-1 h-screen overflow-y-auto">
        <Header onReset={handleReset} />
        {toast && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white z-50`}>
            {toast.message}
          </div>
        )}
        <main className="container max-w-lg mx-auto pt-16 sm:pt-24 px-4 pb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="p-4 sm:p-6 mt-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Instructions</h3>
              <div className="sm:hidden">
                <motion.div
                  key={currentInstruction}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-muted-foreground text-sm"
                >
                  {instructions[currentInstruction]}
                </motion.div>
              </div>
              <ul className="hidden sm:block space-y-2 text-muted-foreground text-base">
                {instructions.map((instruction, index) => (
                  <li key={index}>{index + 1}) {instruction}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 my-auto">
              <div className="flex items-center gap-4">
                <h2 className="text-lg sm:text-lg font-bold tracking-tight">Question <span className="text-lg sm:text-2xl text-primary">{currentQuestion}</span></h2>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-1.5">
                  ( {Object.keys(answers).length} / {testConfig.questionCount} ) answered
                </div>
              </div>
              <div className={`flex items-center gap-2 ${isTimeRunningLow() ? 'text-red-500' : ''}`}>
                <div className="text-base sm:text-xl font-mono font-bold">{formatTime(timeLeft)}</div>
                <motion.div
                  key={Math.floor((timeLeft % 12) + 1)}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {(() => {
                    const clockIcons = [
                      Clock12, Clock1, Clock2, Clock3, Clock4, Clock5,
                      Clock6, Clock7, Clock8, Clock9, Clock10, Clock11
                    ];
                    const ClockIcon = clockIcons[Math.floor((timeLeft % 12))];
                    return <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
                  })()}
                </motion.div>
              </div>
            </div>

            <div 
              ref={buttonParentRef} 
              id="buttonParent" 
              className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
            >
              {["A", "B", "C", "D"].map((option, index) => (
                <motion.div
                  key={option}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: answers[currentQuestion] === option ? [1, 1.05, 1] : 1
                  }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.1,
                    scale: { duration: 0.2 }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={answers[currentQuestion] === option ? "default" : "outline"}
                    className="h-12 sm:h-16 md:h-24 text-xl sm:text-2xl md:text-3xl w-full transition-colors duration-200"
                    onClick={() => handleAnswer(option as Answer)}
                  >
                    {option}
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((prev) => Math.max(1, prev - 1))}
                disabled={currentQuestion === 1}
                className="w-full h-8 sm:h-10 text-sm sm:text-lg px-3 sm:px-6"
              >
                <ChevronLeft className="h-4 w-4 mr-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const newAnswers = { ...answers };
                  delete newAnswers[currentQuestion];
                  setAnswers(newAnswers);
                  localStorage.setItem("answers", JSON.stringify(newAnswers));
                }}
                disabled={!answers[currentQuestion]}
                className="w-full h-8 sm:h-10 text-sm sm:text-lg px-3 sm:px-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10"
              >
                <Eraser className="h-4 w-4 mr-4" />
                Clear selection
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((prev) => Math.min(testConfig.questionCount, prev + 1))}
                disabled={currentQuestion === testConfig.questionCount}
                className="w-full h-8 sm:h-10 text-sm sm:text-lg px-3 sm:px-6"
              >
                Next
                <ChevronLeft className="h-4 w-4 transform rotate-180 ml-4" />
              </Button>
            </div>

            <Button
              className="w-full h-12 sm:h-14 mt-4 sm:mt-6 text-base sm:text-xl font-medium"
              size="lg"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length === 0}
            >
              Submit and Check
            </Button>
          </motion.div>
        </main>
      </div>
      {sidebarPosition === 'right' && sidebarContent}
    </div>
  );
}