import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { useExam, useSettings } from '../lib/state';
import { generateExam } from '../lib/generator';
import { ExamType } from '../types/question';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { setExam } = useExam();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startExam = async (examType: ExamType) => {
    setError(null);
    if (!settings.apiKey) {
      setError('Deneme oluşturmak için API anahtarınızı girin.');
      return;
    }
    setLoading(true);
    setProgress(0);
    setProgressMessage('Sorular hazırlanıyor...');
    try {
      const questions = await generateExam(examType, {
        apiKey: settings.apiKey,
        model: settings.model,
        difficultyDistribution: settings.difficulty,
        gkGyWeights: settings.gkGyWeightOverrides,
        onProgress: (value, message) => {
          setProgress(value);
          setProgressMessage(message);
        }
      });
      const answers = Object.fromEntries(questions.map((question) => [question.id, null]));
      setExam({ examType, questions, answers, startedAt: Date.now() });
      navigate('/deneme');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sorular üretilemedi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="hero">
        <div>
          <h1>KPSS denemenizi dakikalar içinde üretin.</h1>
          <p>
            Soru üretimi Hugging Face üzerinden yapılır. API anahtarınızı ekleyin, denemenizi
            oluşturun ve anında çözmeye başlayın.
          </p>
        </div>
        <div className="status-pill">
          <span className={`status-dot ${settings.apiKey ? 'active' : 'inactive'}`} />
          <span>{settings.apiKey ? 'API Anahtarı bağlı' : 'API Anahtarı eksik'}</span>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="card-grid">
        <Card title="GK-GY Denemesi Oluştur (120)" subtitle="Genel kültür ve genel yetenek">
          <p>Türkçe, Matematik, Tarih, Coğrafya ve Vatandaşlık dersleri.</p>
          <Button onClick={() => startExam('GK-GY')} disabled={loading}>
            GK-GY Denemesi Oluştur
          </Button>
        </Card>
        <Card title="A Grubu Denemesi Oluştur (200)" subtitle="Alan bazlı 5 ders">
          <p>Her ders için 40 soru, dengeli konu dağılımı.</p>
          <Button onClick={() => startExam('A-GRUBU')} disabled={loading}>
            A Grubu Denemesi Oluştur
          </Button>
        </Card>
      </div>

      {loading && (
        <div className="progress-wrapper">
          <ProgressBar value={progress} label={progressMessage} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
