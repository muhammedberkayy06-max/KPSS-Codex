import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { useExam } from '../lib/state';
import { updateGamification, getMotivation } from '../lib/gamification';

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { exam, resetExam } = useExam();

  const { courseStats, topicStats, correctCount, total } = useMemo(() => {
    const courseMap: Record<string, { correct: number; total: number }> = {};
    const topicMap: Record<string, { correct: number; total: number }> = {};
    let correct = 0;
    exam.questions.forEach((question) => {
      const selected = exam.answers[question.id];
      const isCorrect = selected === question.dogru;
      if (isCorrect) {
        correct += 1;
      }
      courseMap[question.ders] = courseMap[question.ders] ?? { correct: 0, total: 0 };
      courseMap[question.ders].total += 1;
      if (isCorrect) {
        courseMap[question.ders].correct += 1;
      }
      topicMap[question.konu] = topicMap[question.konu] ?? { correct: 0, total: 0 };
      topicMap[question.konu].total += 1;
      if (isCorrect) {
        topicMap[question.konu].correct += 1;
      }
    });
    return {
      courseStats: courseMap,
      topicStats: topicMap,
      correctCount: correct,
      total: exam.questions.length
    };
  }, [exam.answers, exam.questions]);

  const weakTopics = useMemo(() => {
    return Object.entries(topicStats)
      .map(([topic, data]) => ({ topic, ratio: data.correct / data.total }))
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, 3);
  }, [topicStats]);

  const gamification = useMemo(() => updateGamification(correctCount, total), [correctCount, total]);

  if (!exam.examType || exam.questions.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>Sonuç yok.</h2>
          <p>Önce bir deneme oluşturun.</p>
          <Button onClick={() => navigate('/')}>Ana Sayfaya Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="results-header">
        <div>
          <h1>Sonuç & Analiz</h1>
          <p>{exam.examType} denemesinde {correctCount} / {total} doğru.</p>
        </div>
        <div className="results-actions">
          <Button variant="secondary" onClick={() => navigate('/deneme')}>Sorulara Dön</Button>
          <Button
            variant="ghost"
            onClick={() => {
              resetExam();
              navigate('/');
            }}
          >
            Yeni Deneme
          </Button>
        </div>
      </div>

      <div className="card-grid">
        <Card title="Ders Bazlı Başarı">
          <ul className="stat-list">
            {Object.entries(courseStats).map(([course, data]) => {
              const ratio = Math.round((data.correct / data.total) * 100);
              return (
                <li key={course}>
                  <span>{course}</span>
                  <strong>%{ratio}</strong>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Zayıf Konular" subtitle="En düşük doğruluk oranına sahip 3 konu">
          <ul className="stat-list">
            {weakTopics.map((topic) => (
              <li key={topic.topic}>
                <span>{topic.topic}</span>
                <strong>%{Math.round(topic.ratio * 100)}</strong>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Bugün Öneri" subtitle="2 saatlik mini plan">
          <ol className="plan-list">
            <li>30 dk: {weakTopics[0]?.topic ?? 'Temel tekrar'} konu özeti.</li>
            <li>40 dk: Konu soruları çözümü ve yanlış analizi.</li>
            <li>30 dk: Karma test + not çıkarma.</li>
            <li>20 dk: Gün sonu hızlı tekrar.</li>
          </ol>
        </Card>

        <Card title="Motivasyon & Oyunlaştırma">
          <div className="gamification">
            <div>
              <p>Streak</p>
              <strong>{gamification.streak} gün</strong>
            </div>
            <div>
              <p>Puan</p>
              <strong>{gamification.points}</strong>
            </div>
            <div>
              <p>Seviye</p>
              <strong>{gamification.level}</strong>
            </div>
          </div>
          <p className="motivation">{getMotivation(gamification.streak)}</p>
        </Card>
      </div>
    </div>
  );
};

export default ResultsPage;
