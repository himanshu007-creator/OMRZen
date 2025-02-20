"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Hourglass } from "lucide-react";

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


  const handleSubmit = () => {
    localStorage.setItem("testCompleted", "true");
    router.push("/check");
  };

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

  const handleAnswer = (answer: Answer) => {
    const newAnswers = { ...answers, [currentQuestion]: answer };
    setAnswers(newAnswers);
    localStorage.setItem("answers", JSON.stringify(newAnswers));

    if (currentQuestion < (testConfig?.questionCount || 0)) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleReset = () => {
    localStorage.clear();
    router.push("/");
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

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <div className="flex-1 h-screen overflow-y-auto">
        <Header onReset={handleReset} />
        <main className="container max-w-lg mx-auto pt-16 sm:pt-24 px-4 pb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Instructions</h3>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <li>1) Keep calm and make your move</li>
                <li>2) Greed is bad, but believe yourself</li>
                <li>3) You can visit any question randomly via sidebar on right</li>
              </ul>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Question <span className="text-2xl sm:text-4xl text-primary">{currentQuestion}</span></h2>
              <div className={`flex items-center gap-2 ${isTimeRunningLow() ? 'text-red-500' : ''}}`}>
                <div className="text-lg sm:text-2xl font-mono font-bold">{formatTime(timeLeft)}</div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Hourglass className="w-4 h-4 sm:w-6 sm:h-6" />
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {["A", "B", "C", "D"].map((option) => (
                <motion.div
                  key={option}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    scale: answers[currentQuestion] === option ? [1, 1.05, 1] : 1,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Button
                    variant={answers[currentQuestion] === option ? "default" : "outline"}
                    className="h-12 sm:h-16 md:h-24 text-xl sm:text-2xl md:text-3xl w-full"
                    onClick={() => handleAnswer(option as Answer)}
                  >
                    {option}
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((prev) => Math.max(1, prev - 1))}
                disabled={currentQuestion === 1}
                className="text-base sm:text-lg px-4 sm:px-6 py-2 h-10 sm:h-12"
              >
                Previous
              </Button>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {Object.keys(answers).length} of {testConfig.questionCount} answered
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((prev) => Math.min(testConfig.questionCount, prev + 1))}
                disabled={currentQuestion === testConfig.questionCount}
                className="text-base sm:text-lg px-4 sm:px-6 py-2 h-10 sm:h-12"
              >
                Next
              </Button>
            </div>

            <Button
              className="w-full mt-6 text-lg sm:text-xl py-4 sm:py-6"
              size="lg"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length === 0}
            >
              Submit and Check
            </Button>
          </motion.div>
        </main>
      </div>
      <div className="w-16 md:w-[320px] border-l border-gray-100 h-screen overflow-y-auto">
        <div className="p-2 md:p-4 mt-14">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Array.from({ length: testConfig.questionCount }, (_, i) => i + 1).map((num) => (
              <motion.button
                key={num}
                onClick={() => setCurrentQuestion(num)}
                className={`h-12 w-full md:h-6 md:w-6 text-xs flex items-center justify-center rounded mx-auto ${answers[num] ? 'bg-blue-500 text-white' : 'border border-gray-100 hover:bg-muted'} ${currentQuestion === num ? 'ring-1 ring-primary' : ''}`}
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
    </div>
  );
}