"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Eraser, X } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { QuestionGrid } from "@/components/ui/question-grid";
import { clearLocalStorage } from "@/lib/utils";
type TestConfig = {
  questionCount: number;
  positiveMarks: number;
  negativeMarks: number;
  timeInMinutes: number;
};

type Answer = "A" | "B" | "C" | "D";

type Toast = {
  message: string;
  type: 'success' | 'error';
};

export default function CheckPage() {
  const router = useRouter();
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, Answer>>({});
  const [correctAnswers, setCorrectAnswers] = useState<Record<number, Answer>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number | null>(null);
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>('right');

  const generateReport = (type: 'csv' | 'json') => {
    const reportData = {
      testName,
      totalQuestions: testConfig?.questionCount,
      attempted: Object.keys(userAnswers).length,
      correctAnswers: Object.entries(userAnswers).filter(([q, a]) => correctAnswers[parseInt(q)] === a).length,
      incorrectAnswers: Object.entries(userAnswers).filter(([q, a]) => correctAnswers[parseInt(q)] && correctAnswers[parseInt(q)] !== a).length,
      score,
      answers: Object.entries(userAnswers).map(([q, a]) => ({
        question: parseInt(q),
        userAnswer: a,
        correctAnswer: correctAnswers[parseInt(q)],
        isCorrect: a === correctAnswers[parseInt(q)]
      }))
    };

    if (type === 'csv') {
      const csvContent = [
        ['Test Name', testName],
        ['Total Questions', testConfig?.questionCount.toString()],
        ['Attempted', Object.keys(userAnswers).length.toString()],
        ['Correct Answers', Object.entries(userAnswers).filter(([q, a]) => correctAnswers[parseInt(q)] === a).length.toString()],
        ['Incorrect Answers', Object.entries(userAnswers).filter(([q, a]) => correctAnswers[parseInt(q)] && correctAnswers[parseInt(q)] !== a).length.toString()],
        ['Final Score', score.toString()],
        [],
        ['Question', 'User Answer', 'Correct Answer', 'Status'],
        ...Object.entries(userAnswers).map(([q, a]) => [
          q,
          a,
          correctAnswers[parseInt(q)],
          a === correctAnswers[parseInt(q)] ? 'Correct' : 'Incorrect'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${testName.replace(/\s+/g, '-')}-report.csv`;
      link.click();
    } else {
      const jsonContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${testName.replace(/\s+/g, '-')}-report.json`;
      link.click();
    }
  };

  const [testName, setTestName] = useState<string>('Untitled Test');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem("testConfig");
    const savedAnswers = localStorage.getItem("answers");
    const completed = localStorage.getItem("testCompleted");

    if (!savedConfig || !savedAnswers || !completed) {
      router.push("/");
      return;
    }

    setTestConfig(JSON.parse(savedConfig));
    setUserAnswers(JSON.parse(savedAnswers));

    const savedCorrectAnswers = localStorage.getItem("correctAnswers");
    if (savedCorrectAnswers) {
      setCorrectAnswers(JSON.parse(savedCorrectAnswers));
    }
  }, [router]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAnswer = (questionNum: number, answer: Answer) => {
    const newAnswers = { ...correctAnswers, [questionNum]: answer };
    setCorrectAnswers(newAnswers);
    localStorage.setItem("correctAnswers", JSON.stringify(newAnswers));

    const userAnswer = userAnswers[questionNum];
    if (userAnswer === answer) {
      showToast(`Question ${questionNum}: Correct answer!`, 'success');
    } else {
      showToast(`Question ${questionNum}: Incorrect answer`, 'error');
    }
  };

  const calculateScore = () => {
    if (!testConfig) return;

    let totalScore = 0;

    Object.entries(userAnswers).forEach(([question, answer]) => {
      const correctAnswer = correctAnswers[parseInt(question)];

      if (correctAnswer === answer) {
        totalScore += testConfig.positiveMarks;
      } else if (correctAnswer) { // Only deduct marks if there's a correct answer marked
        totalScore -= testConfig.negativeMarks;
      }
    });

    setScore(Number(totalScore.toFixed(3)));
    setShowResults(true);
  };

  const handleReset = () => {
    clearLocalStorage();
    router.push("/");
  };

  if (!testConfig) return null;

  if (showResults) {
    return (
      <div className="min-h-screen bg-background flex items-center">
        <Header onReset={handleReset} />
        <main className="container max-w-2xl mx-auto px-4 my-8 flex items-center justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 w-full"
          >
            <div className="space-y-3 text-center">
              <motion.h1
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold"
              >
                Test Results
              </motion.h1>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4 p-6 rounded-xl border bg-card text-card-foreground shadow-lg"
            >
              <div className="grid gap-3">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium">Correct Answers</span>
                    <div className="text-xl font-bold">
                      {Object.entries(userAnswers).filter(
                        ([q, a]) => correctAnswers[parseInt(q)] === a
                      ).length}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-75">Score</div>
                    <div className="text-lg font-semibold">
                      + {(Object.entries(userAnswers).filter(
                        ([q, a]) => correctAnswers[parseInt(q)] === a
                      ).length * testConfig.positiveMarks).toFixed(1)}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium">Incorrect Answers</span>
                    <div className="text-xl font-bold">
                      {Object.entries(userAnswers).filter(
                        ([q, a]) => correctAnswers[parseInt(q)] && correctAnswers[parseInt(q)] !== a
                      ).length}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-75">Penalty</div>
                    <div className="text-lg font-semibold">
                      - {(Object.entries(userAnswers).filter(
                        ([q, a]) => correctAnswers[parseInt(q)] && correctAnswers[parseInt(q)] !== a
                      ).length * testConfig.negativeMarks).toFixed(1)}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium">Unattempted</span>
                    <div className="text-xl font-bold">
                      {testConfig.questionCount - Object.keys(userAnswers).length}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-75">No Score</div>
                    <div className="text-lg font-semibold">0.0</div>
                  </div>
                </motion.div>
              </div>

              <div className="h-px bg-border my-3" />

              <div className="grid gap-1.5 text-lg">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Marks</span>
                  <span>{score}</span>
                </div>
              </div>

              <div className="h-px bg-border my-3" />

              <div className="text-center relative">
                <div className="flex items-center justify-center gap-4">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value.slice(0, 40))}
                      onBlur={() => setIsEditingName(false)}
                      autoFocus
                      className="text-xl font-semibold bg-transparent text-center border-b border-primary outline-none transition-colors max-w-[300px]"
                      placeholder="Enter test name"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{testName}</span>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        title="Edit Test Name"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {!showDownloadOptions ? (
                    <button
                      onClick={() => setShowDownloadOptions(true)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      title="Download Report"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          generateReport('csv');
                          setShowDownloadOptions(false);
                        }}
                        className="px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => {
                          generateReport('json');
                          setShowDownloadOptions(false);
                        }}
                        className="px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        JSON
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-xl transform transition-all hover:scale-105"
                onClick={handleReset}
              >
                Start New Test
              </Button>
            </motion.div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden relative">
       {sidebarPosition === 'left' && (
      <QuestionGrid
        totalQuestions={testConfig.questionCount}
        currentQuestion={currentQuestion}
        answers={userAnswers}
        onQuestionClick={(num) => {
          const element = document.getElementById(`question-${num}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setCurrentQuestion(num);
          }
        }}
        sidebarPosition={sidebarPosition}
        onToggleSidebar={() => setSidebarPosition(prev => prev === 'right' ? 'left' : 'right')}
        showAttemptedOnly={true}
        className="fixed"
      />)}
      <div className="flex-1 h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <Header onReset={handleReset} />
        <AnimatePresence>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>
        <main className="container max-w-4xl mx-auto pt-24 px-4 pb-8 relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="p-4 sm:p-6 rounded-lg border bg-card text-card-foreground shadow-sm space-y-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold">Checking instructions</h3>
                <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li>1) Check your answers carefully, and revisit your mistakes</li>
                  <li>2) Final report will be available after calculating results</li>
                </ul>
              </div>
              <Button
                className="text-base sm:text-xl py-4 sm:py-6 px-6 sm:px-8 w-full sm:w-auto"
                size="lg"
                onClick={calculateScore}
                disabled={Object.keys(correctAnswers).length !== Object.keys(userAnswers).length}
              >
                Calculate Results
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-row flex-wrap">
              {Object.keys(userAnswers).sort((a, b) => parseInt(a) - parseInt(b)).map((questionNum) => {
                const qNum = parseInt(questionNum);
                const userAnswer = userAnswers[qNum];
                const correctAnswer = correctAnswers[qNum];
                const isAnswered = correctAnswer !== undefined;
                const isCorrect = isAnswered && userAnswer === correctAnswer;

                return (
                  <motion.div
                    key={questionNum}
                    id={`question-${questionNum}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-4 border rounded-lg space-y-4 ${isAnswered ? (isCorrect ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-red-50/50 dark:bg-red-900/10') : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Question {questionNum}</span>
                      <div className="flex items-center gap-2">
                        {isAnswered && (
                          <span className={`text-sm font-medium ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={() => {
                                  const newAnswers = { ...correctAnswers };
                                  delete newAnswers[qNum];
                                  setCorrectAnswers(newAnswers);
                                  localStorage.setItem("correctAnswers", JSON.stringify(newAnswers));
                                  showToast(`Question ${questionNum}: Answer cleared`, 'success');
                                }}
                                disabled={!isAnswered}
                              >
                                <Eraser className="h-4 w-4 text-gray-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Clear marked answer
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 xs:grid-cols-2 gap-2">
                      {["A", "B", "C", "D"].map((option) => {
                        const isUserAnswer = userAnswer === option;
                        const isCorrectAnswer = correctAnswer === option;

                        return (
                          <Button
                            key={option}
                            variant={isAnswered ? "ghost" : "outline"}
                            className={`h-12 text-lg relative ${isAnswered ? (
                              isCorrectAnswer ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300' :
                                isUserAnswer ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 line-through' :
                                  'hover:bg-gray-100 dark:hover:bg-gray-800'
                            ) : ''}`}
                            onClick={() => !isAnswered && handleAnswer(qNum, option as Answer)}
                            disabled={isAnswered}
                          >
                            {option}
                            {isAnswered && isUserAnswer && !isCorrect && (
                              <div className="absolute top-0 right-0 h-20 w-20 flex items-center justify-center">
                                <X className="h-20 w-20 text-red-600 relative -right-3 -top-4 opacity-20" />
                              </div>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Add floating button for mobile */}
            {Object.keys(correctAnswers).length === Object.keys(userAnswers).length && (
              <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
                <Button
                  className="w-full text-base py-4 px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                  size="lg"
                  onClick={calculateScore}
                >
                  Calculate Results
                </Button>
              </div>
            )}
          </motion.div>
        </main>
      </div>
      {sidebarPosition === 'right' && (
      <QuestionGrid
        totalQuestions={testConfig.questionCount}
        currentQuestion={currentQuestion}
        answers={userAnswers}
        onQuestionClick={(num) => {
          const element = document.getElementById(`question-${num}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setCurrentQuestion(num);
          }
        }}
        sidebarPosition={sidebarPosition}
        onToggleSidebar={() => setSidebarPosition(prev => prev === 'right' ? 'left' : 'right')}
        showAttemptedOnly={true}
        className="fixed"
      />)}
    </div>
  );
}