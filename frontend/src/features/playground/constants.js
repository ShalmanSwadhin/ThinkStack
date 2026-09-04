import { LANGUAGES } from 'shared/constants';

export const LANGUAGE_LIST = Object.entries(LANGUAGES).map(([key, value]) => ({
  key,
  id: value.id,
  name: value.name,
  monaco: value.monaco,
}));

export const DEFAULT_TEMPLATES = {
  c: `#include <stdio.h>

int main() {
  printf("Hello, ThinkStack!\\n");
  return 0;
}`,
  cpp: `#include <iostream>

int main() {
  std::cout << "Hello, ThinkStack!" << std::endl;
  return 0;
}`,
  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, ThinkStack!");
  }
}`,
  python: 'print("Hello, ThinkStack!")',
  javascript: 'console.log("Hello, ThinkStack!");',
};

export const VERDICT_LABELS = {
  accepted: 'Accepted',
  wrong_answer: 'Wrong Answer',
  tle: 'Time Limit Exceeded',
  mle: 'Memory Limit Exceeded',
  runtime_error: 'Runtime Error',
  compile_error: 'Compile Error',
  pending: 'Pending',
};

export const VERDICT_COLORS = {
  accepted: 'text-emerald-600 dark:text-emerald-400',
  wrong_answer: 'text-amber-600 dark:text-amber-400',
  tle: 'text-orange-600 dark:text-orange-400',
  mle: 'text-orange-600 dark:text-orange-400',
  runtime_error: 'text-red-600 dark:text-red-400',
  compile_error: 'text-red-600 dark:text-red-400',
  pending: 'text-slate-500 dark:text-slate-400',
};

export default { LANGUAGE_LIST, DEFAULT_TEMPLATES, VERDICT_LABELS, VERDICT_COLORS };
