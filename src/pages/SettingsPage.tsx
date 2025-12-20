import React, { useMemo, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useSettings } from '../lib/state';
import { testApiKey } from '../lib/huggingfaceClient';
import { gkGyCourses } from '../lib/syllabus';

const normalizeDifficulty = (values: { kolay: number; orta: number; zor: number }) => {
  const total = values.kolay + values.orta + values.zor;
  if (total === 100) {
    return values;
  }
  const factor = total === 0 ? 0 : 100 / total;
  return {
    kolay: Math.round(values.kolay * factor),
    orta: Math.round(values.orta * factor),
    zor: Math.max(0, 100 - Math.round(values.kolay * factor) - Math.round(values.orta * factor))
  };
};

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey ?? '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [testing, setTesting] = useState(false);

  const difficulty = useMemo(() => settings.difficulty, [settings.difficulty]);

  const handleSaveKey = () => {
    updateSettings({
      ...settings,
      apiKey: apiKeyInput.trim() ? apiKeyInput.trim() : null
    });
    setStatusType('success');
    setStatusMessage('API anahtarı kaydedildi.');
  };

  const handleClearKey = () => {
    setApiKeyInput('');
    updateSettings({ ...settings, apiKey: null });
    setStatusType('success');
    setStatusMessage('API anahtarı temizlendi.');
  };

  const handleTestKey = async () => {
    if (!apiKeyInput.trim()) {
      setStatusType('error');
      setStatusMessage('Test etmek için API anahtarı girin.');
      return;
    }
    setTesting(true);
    setStatusMessage(null);
    try {
      await testApiKey({ apiKey: apiKeyInput.trim(), model: settings.model });
      setStatusType('success');
      setStatusMessage('API anahtarı doğrulandı.');
    } catch (error) {
      setStatusType('error');
      setStatusMessage('API anahtarı doğrulanamadı.');
    } finally {
      setTesting(false);
    }
  };

  const updateDifficulty = (partial: Partial<typeof difficulty>) => {
    const normalized = normalizeDifficulty({ ...difficulty, ...partial });
    updateSettings({ ...settings, difficulty: normalized });
  };

  const updateWeight = (ders: string, topic: string, value: number) => {
    updateSettings({
      ...settings,
      gkGyWeightOverrides: {
        ...settings.gkGyWeightOverrides,
        [ders]: {
          ...settings.gkGyWeightOverrides[ders],
          [topic]: value
        }
      }
    });
  };

  return (
    <div className="page">
      <h1>Ayarlar</h1>
      <div className="stack">
        <Card title="API Anahtarı">
          <div className="form-row">
            <label htmlFor="apiKey">Hugging Face API Key</label>
            <input
              id="apiKey"
              type="password"
              placeholder="hf_xxx"
              value={apiKeyInput}
              onChange={(event) => setApiKeyInput(event.target.value)}
            />
          </div>
          <div className="button-row">
            <Button onClick={handleSaveKey}>Kaydet</Button>
            <Button variant="secondary" onClick={handleTestKey} disabled={testing}>
              {testing ? 'Test ediliyor...' : 'API Key Test Et'}
            </Button>
            <Button variant="ghost" onClick={handleClearKey}>
              Temizle
            </Button>
          </div>
          {statusMessage && (
            <div className={`alert ${statusType === 'success' ? 'success' : 'error'}`}>
              {statusMessage}
            </div>
          )}
        </Card>

        <Card title="Zorluk Oranları" subtitle="Toplam %100 olacak şekilde ayarlanır.">
          <div className="slider-group">
            <label>
              Kolay: {difficulty.kolay}%
              <input
                type="range"
                min={0}
                max={100}
                value={difficulty.kolay}
                onChange={(event) => updateDifficulty({ kolay: Number(event.target.value) })}
              />
            </label>
            <label>
              Orta: {difficulty.orta}%
              <input
                type="range"
                min={0}
                max={100}
                value={difficulty.orta}
                onChange={(event) => updateDifficulty({ orta: Number(event.target.value) })}
              />
            </label>
            <label>
              Zor: {difficulty.zor}%
              <input
                type="range"
                min={0}
                max={100}
                value={difficulty.zor}
                onChange={(event) => updateDifficulty({ zor: Number(event.target.value) })}
              />
            </label>
          </div>
        </Card>

        <Card title="GK-GY Konu Ağırlıkları" subtitle="Ders bazlı konu ağırlıklarını ayarlayın.">
          <div className="weights">
            {gkGyCourses.map((course) => (
              <div key={course.ders} className="weight-course">
                <h4>{course.ders}</h4>
                {course.topics.map((topic) => (
                  <label key={topic.topic}>
                    {topic.topic}
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={settings.gkGyWeightOverrides[course.ders]?.[topic.topic] ?? topic.weight}
                      onChange={(event) => updateWeight(course.ders, topic.topic, Number(event.target.value))}
                    />
                  </label>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
