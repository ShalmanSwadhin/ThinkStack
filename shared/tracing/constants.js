export const TRACING_LANGUAGES = [
  { id: 'python', label: 'Python', monaco: 'python' },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { id: 'java', label: 'Java', monaco: 'java' },
  { id: 'cpp', label: 'C++', monaco: 'cpp' },
  { id: 'c', label: 'C', monaco: 'c' },
];

export const SAMPLE_CODE = {
  python: `# Manual tracing example
name = "ThinkStack"
numbers = [3, 1, 4, 1, 5]
total = 0

for num in numbers:
    total = total + num

print("Sum:", total)
`,
  javascript: `// Manual tracing example
const name = "ThinkStack";
const numbers = [3, 1, 4, 1, 5];
let total = 0;

for (const num of numbers) {
  total = total + num;
}

console.log("Sum:", total);
`,
  java: `public class Main {
  public static void main(String[] args) {
    String name = "ThinkStack";
    int[] numbers = {3, 1, 4, 1, 5};
    int total = 0;
    for (int num : numbers) {
      total = total + num;
    }
    System.out.println("Sum: " + total);
  }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
  string name = "ThinkStack";
  int numbers[] = {3, 1, 4, 1, 5};
  int total = 0;
  for (int i = 0; i < 5; i++) {
    total = total + numbers[i];
  }
  cout << "Sum: " << total << endl;
  return 0;
}`,
  c: `#include <stdio.h>

int main() {
  char name[] = "ThinkStack";
  int numbers[] = {3, 1, 4, 1, 5};
  int total = 0;
  for (int i = 0; i < 5; i++) {
    total = total + numbers[i];
  }
  printf("Sum: %d\\n", total);
  return 0;
}`,
};

export default { TRACING_LANGUAGES, SAMPLE_CODE };
