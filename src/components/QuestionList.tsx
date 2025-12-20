import React from 'react';

type QuestionListProps = {
  total: number;
  currentIndex: number;
  answeredCount: number;
  onSelect: (index: number) => void;
};

const QuestionList: React.FC<QuestionListProps> = ({ total, currentIndex, answeredCount, onSelect }) => (
  <aside className="question-list">
    <div className="question-list-header">
      <h3>Sorular</h3>
      <p>{answeredCount} / {total} cevaplandı</p>
    </div>
    <div className="question-grid">
      {Array.from({ length: total }, (_, index) => {
        const className = ['question-pill', index === currentIndex ? 'active' : '']
          .filter(Boolean)
          .join(' ');
        return (
          <button key={index} type="button" className={className} onClick={() => onSelect(index)}>
            {index + 1}
          </button>
        );
      })}
    </div>
  </aside>
);

export default QuestionList;
