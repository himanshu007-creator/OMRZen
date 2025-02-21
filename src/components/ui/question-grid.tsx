"use client";

import { motion } from "framer-motion";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { MoveHorizontal } from "lucide-react";

type QuestionGridProps = {
  totalQuestions: number;
  currentQuestion?: number | null;
  answers: Record<number, string>;
  onQuestionClick?: (questionNumber: number) => void;
  sidebarPosition?: 'left' | 'right';
  onToggleSidebar?: () => void;
  showToggle?: boolean;
  className?: string;
  showAttemptedOnly?: boolean;
};

export function QuestionGrid({
  totalQuestions,
  currentQuestion,
  answers,
  onQuestionClick,
  sidebarPosition = 'right',
  onToggleSidebar,
  showToggle = true,
  className = "",
  showAttemptedOnly = false,
}: QuestionGridProps) {
  const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  const filteredQuestions = showAttemptedOnly ? questions.filter(num => answers[num]) : questions;

  return (
    <div className={`w-16 md:w-[320px] border-x border-gray-100 h-screen sticky top-0 overflow-hidden bg-secondary flex flex-col  pt-20 ${className}`}>
      {showToggle && (
        <div className="p-2 md:p-4 md:pb-1 pb-1 sticky top-0 z-10 pr-2 bg-secondary border-b">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleSidebar}
                  className="mb-1 w-full flex items-center justify-center hover:bg-muted"
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
      )}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pb-4">
          {filteredQuestions.map((num) => (
            <motion.button
              key={num}
              onClick={() => onQuestionClick?.(num)}
              className={`h-12 w-full md:h-6 md:w-6 text-xs flex border border-primary items-center justify-center rounded mx-auto 
                ${answers[num] ? 'bg-blue-500 text-white' : 'border border-gray-100 hover:bg-muted'} 
                ${currentQuestion === num ? 'ring-1 ring-primary' : ''}`}
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
}