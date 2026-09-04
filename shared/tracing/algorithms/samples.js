/**
 * Algorithm samples in all supported languages for IR equivalence testing.
 */

export const ALGORITHM_SAMPLES = {
  'bubble-sort': {
    python: `arr = [5, 1, 4, 2, 8]
n = 5
for i in range(n):
    for j in range(0, n - i - 1):
        if arr[j] > arr[j + 1]:
            temp = arr[j]
            arr[j] = arr[j + 1]
            arr[j + 1] = temp
print(arr)`,
    javascript: `const arr = [5, 1, 4, 2, 8];
const n = 5;
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n - i - 1; j++) {
    if (arr[j] > arr[j + 1]) {
      const temp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = temp;
    }
  }
}
console.log(arr);`,
    java: `public class Main {
  public static void main(String[] args) {
    int[] arr = {5, 1, 4, 2, 8};
    int n = 5;
    for (int i = 0; i < n; i++) {
      for (int j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          int temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
        }
      }
    }
    System.out.println(arr[0]);
  }
}`,
    c: `#include <stdio.h>
int main() {
  int arr[] = {5, 1, 4, 2, 8};
  int n = 5;
  for (int i = 0; i < n; i++) {
    for (int j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        int temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  printf("%d", arr[0]);
  return 0;
}`,
    cpp: `#include <iostream>
using namespace std;
int main() {
  int arr[] = {5, 1, 4, 2, 8};
  int n = 5;
  for (int i = 0; i < n; i++) {
    for (int j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        int temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  cout << arr[0] << endl;
  return 0;
}`,
  },

  'linear-search': {
    python: `arr = [10, 20, 30, 40, 50]
target = 30
found = -1
for i in range(5):
    if arr[i] == target:
        found = i
print(found)`,
    javascript: `const arr = [10, 20, 30, 40, 50];
const target = 30;
let found = -1;
for (let i = 0; i < 5; i++) {
  if (arr[i] === target) {
    found = i;
  }
}
console.log(found);`,
    java: `public class Main {
  public static void main(String[] args) {
    int[] arr = {10, 20, 30, 40, 50};
    int target = 30;
    int found = -1;
    for (int i = 0; i < 5; i++) {
      if (arr[i] == target) {
        found = i;
      }
    }
    System.out.println(found);
  }
}`,
    c: `#include <stdio.h>
int main() {
  int arr[] = {10, 20, 30, 40, 50};
  int target = 30;
  int found = -1;
  for (int i = 0; i < 5; i++) {
    if (arr[i] == target) {
      found = i;
    }
  }
  printf("%d", found);
  return 0;
}`,
    cpp: `#include <iostream>
using namespace std;
int main() {
  int arr[] = {10, 20, 30, 40, 50};
  int target = 30;
  int found = -1;
  for (int i = 0; i < 5; i++) {
    if (arr[i] == target) {
      found = i;
    }
  }
  cout << found << endl;
  return 0;
}`,
  },

  'binary-search': {
    python: `arr = [1, 3, 5, 7, 9]
target = 5
low = 0
high = 4
found = -1
while low <= high:
    mid = (low + high) // 2
    if arr[mid] == target:
        found = mid
        low = high + 1
    if arr[mid] < target and found == -1:
        low = mid + 1
    if arr[mid] > target and found == -1:
        high = mid - 1
print(found)`,
    javascript: `const arr = [1, 3, 5, 7, 9];
const target = 5;
let low = 0;
let high = 4;
let found = -1;
while (low <= high) {
  const mid = Math.floor((low + high) / 2);
  if (arr[mid] === target) {
    found = mid;
    low = high + 1;
  } else if (arr[mid] < target) {
    low = mid + 1;
  } else {
    high = mid - 1;
  }
}
console.log(found);`,
    java: `public class Main {
  public static void main(String[] args) {
    int[] arr = {1, 3, 5, 7, 9};
    int target = 5;
    int low = 0;
    int high = 4;
    int found = -1;
    while (low <= high) {
      int mid = (low + high) / 2;
      if (arr[mid] == target) {
        found = mid;
        low = high + 1;
      } else if (arr[mid] < target) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    System.out.println(found);
  }
}`,
    c: `#include <stdio.h>
int main() {
  int arr[] = {1, 3, 5, 7, 9};
  int target = 5;
  int low = 0;
  int high = 4;
  int found = -1;
  while (low <= high) {
    int mid = (low + high) / 2;
    if (arr[mid] == target) {
      found = mid;
      low = high + 1;
    } else if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  printf("%d", found);
  return 0;
}`,
    cpp: `#include <iostream>
using namespace std;
int main() {
  int arr[] = {1, 3, 5, 7, 9};
  int target = 5;
  int low = 0;
  int high = 4;
  int found = -1;
  while (low <= high) {
    int mid = (low + high) / 2;
    if (arr[mid] == target) {
      found = mid;
      low = high + 1;
    } else if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  cout << found << endl;
  return 0;
}`,
  },

  recursion: {
    python: `result = 5
total = 0
for i in range(1, result + 1):
    total = total + i
print(total)`,
    javascript: `let result = 5;
let total = 0;
for (let i = 1; i <= result; i++) {
  total = total + i;
}
console.log(total);`,
    java: `public class Main {
  public static void main(String[] args) {
    int result = 5;
    int total = 0;
    for (int i = 1; i <= result; i++) {
      total = total + i;
    }
    System.out.println(total);
  }
}`,
    c: `#include <stdio.h>
int main() {
  int result = 5;
  int total = 0;
  for (int i = 1; i <= result; i++) {
    total = total + i;
  }
  printf("%d", total);
  return 0;
}`,
    cpp: `#include <iostream>
using namespace std;
int main() {
  int result = 5;
  int total = 0;
  for (int i = 1; i <= result; i++) {
    total = total + i;
  }
  cout << total << endl;
  return 0;
}`,
  },
};

export const ALGORITHM_IDS = Object.keys(ALGORITHM_SAMPLES);
export const SUPPORTED_LANGS = ['python', 'javascript', 'java', 'c', 'cpp'];

export default { ALGORITHM_SAMPLES, ALGORITHM_IDS, SUPPORTED_LANGS };
