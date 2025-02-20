import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const  clearLocalStorage  = () => {
  // Clear all test-related data from localStorage
  localStorage.removeItem("testConfig");
  localStorage.removeItem("answers");
  localStorage.removeItem("timeLeft");
  localStorage.removeItem("testCompleted");
  localStorage.removeItem("correctAnswers");
  localStorage.removeItem("testCompleted")
};
