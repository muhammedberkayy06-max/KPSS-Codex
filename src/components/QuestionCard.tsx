import React from 'react';
import { AnswerOption, Question } from '../types/question';
import Button from './Button';

type QuestionCardProps = {
  question: Question;
  selected: AnswerOption | 'bos' | null;
  onSelect: (answer: AnswerOption | 'bos') => void;
};

const options: AnswerOption[] = ['A', 'B', 'C', 'D', 'E'];

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selected, onSelect }) => {
  const isAnswered = selected !== null;
  const isCorrect = selected === question.dogru;

  return (
    <div className="question-card">
      <div className="question-meta">
        <span>{question.ders}</span>
        <span>•</span>
        <span>{question.konu}</span>
        <span>•</span>
        <span>{question.zorluk}</span>
      </div>
      <h2>{question.soru}</h2>
      <div className="options">
        {options.map((option) => {
          const isSelected = selected === option;
          const isRight = question.dogru === option;
          const className = [
            'option',
            isSelected ? 'selected' : '',
            isAnswered && isRight ? 'correct' : '',
            isAnswered && isSelected && !isRight ? 'incorrect' : ''
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={option}
              className={className}
              onClick={() => onSelect(option)}
              type="button"
            >
              <span className="option-key">{option}</span>
              <span>{question.secenekler[option]}</span>
            </button>
          );
        })}
      </div>
      <div className="question-actions">
        <Button variant="ghost" onClick={() => onSelect('bos')}>
          Boş bırak
        </Button>
      </div>
      {isAnswered && (
        <div className={`feedback ${isCorrect ? 'success' : 'error'}`}>
          <strong>{isCorrect ? 'Doğru!' : 'Yanlış.'}</strong>
          <p>{question.aciklama}</p>
          {question.adimAdimCozum && (
            <div className="solution">
              <h4>Adım Adım Çözüm</h4>
              <p>{question.adimAdimCozum}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
