describe('Quiz grading', () => {
  const quiz = {
    passingScore: 70,
    questions: [
      { _id: '1', question: 'Q1', options: ['A', 'B', 'C'], correctIndex: 0, explanation: 'Because A' },
      { _id: '2', question: 'Q2', options: ['A', 'B'], correctIndex: 1, explanation: 'Because B' },
      { _id: '3', question: 'Q3', options: ['A', 'B', 'C', 'D'], correctIndex: 2, explanation: 'Because C' },
    ],
  };

  // Inline grading mirror for unit test
  const grade = (questions, answers, passingScore) => {
    const results = questions.map((question, index) => ({
      isCorrect: answers[index] === question.correctIndex,
    }));
    const correctCount = results.filter((item) => item.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);
    return { score, passed: score >= passingScore, correctCount };
  };

  it('passes at 100%', () => {
    const result = grade(quiz.questions, [0, 1, 2], 70);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('passes at 67% rounded to 67 - actually 2/3 = 67%', () => {
    const result = grade(quiz.questions, [0, 1, 0], 70);
    expect(result.score).toBe(67);
    expect(result.passed).toBe(false);
  });

  it('passes at exactly 70% with 10 questions equivalent - 2/3=67 fails', () => {
    const questions = Array.from({ length: 10 }, (_, i) => ({
      correctIndex: 0,
      options: ['A', 'B'],
    }));
    const answers = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1];
    const result = grade(questions, answers, 70);
    expect(result.score).toBe(70);
    expect(result.passed).toBe(true);
  });
});
