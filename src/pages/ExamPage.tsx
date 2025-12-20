import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import QuestionCard from '../components/QuestionCard';
import QuestionList from '../components/QuestionList';
import { useExam } from '../lib/state';
import { AnswerOption } from '../types/question';

const ExamPage: React.FC = () => {
  const navigate = useNavigate();
  const { exam, setExam } = useExam();
  const [currentIndex, setCurrentIndex] = useState(0);

  const questions = exam.questions;
  const currentQuestion = questions[currentIndex];

  const answeredCount = useMemo(
    () => Object.values(exam.answers).filter((value) => value && value !== 'bos').length,
    [exam.answers]
  );

  const handleSelect = (answer: AnswerOption | 'bos') => {
    if (!currentQuestion) return;
    setExam((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: answer
      }
    }));
  };

  const goNext = () => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  const goPrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  if (!exam.examType || questions.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>Henüz deneme oluşturulmadı.</h2>
          <p>Ana sayfadan yeni bir deneme oluşturabilirsiniz.</p>
          <Button onClick={() => navigate('/')}>Ana Sayfaya Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page exam-layout">
      <QuestionList
        total={questions.length}
        currentIndex={currentIndex}
        answeredCount={answeredCount}
        onSelect={setCurrentIndex}
      />
      <div className="exam-main">
        <div className="exam-header">
          <div>
            <h1>{exam.examType} Denemesi</h1>
            <p>{currentIndex + 1}. soru / {questions.length}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/sonuc')}>
            Sonuçları Gör
          </Button>
        </div>
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            selected={exam.answers[currentQuestion.id] ?? null}
            onSelect={handleSelect}
          />
        )}
        <div className="nav-row">
          <Button variant="ghost" onClick={goPrev} disabled={currentIndex === 0}>
            Önceki
          </Button>
          <Button onClick={goNext} disabled={currentIndex === questions.length - 1}>
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
