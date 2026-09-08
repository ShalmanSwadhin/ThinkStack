#include <stdio.h>

int main() {
    int total = 125;
    int score = 48;
    int bonus = 7;
    int count = 0;
    int i, j, k;

    for (i = 2; i <= 5; i++) {

        total += i * 6;
        score = score + i++;

        for (j = 3; j <= 6; j++) {

            bonus += (i * j) % 11;
            count++;

            if ((total + bonus) % 4 == 0) {

                score += bonus--;

                if (score > 100) {
                    total -= score / 5;
                }
                else if (score > 70) {
                    total += score % 9;
                    bonus += j++;
                }
                else {
                    score += total % 13;
                }

            }
            else if (j % 2 == 0) {

                total = total + j * 3;

                if (bonus > 25) {
                    bonus -= i;
                    continue;
                }
                else {
                    score += j + bonus;
                }

            }
            else {

                bonus += i + j;
                score -= bonus % 5;
            }

            for (k = 1; k <= 4; k++) {

                total += (i * j * k) % 17;

                if (k == 2 && total % 3 == 0) {
                    score += k * bonus;
                }
                else if (k == 3 && score > 120) {
                    total -= bonus / 2;
                    break;
                }
                else {
                    bonus += k++;
                    count += k;
                }
            }

            if (count > 35) {
                break;
            }
        }

        if (total > 250) {
            total -= bonus * 2;
        }
        else {
            score += total % 10;
        }
    }

    printf("total=%d score=%d bonus=%d count=%d\n",
           total, score, bonus, count);

    return 0;
}
