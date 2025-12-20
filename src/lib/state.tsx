import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnswerOption, ExamType, Question } from '../types/question';
import { AppSettings, defaultSettings, loadSettings, saveSettings } from './settings';

export type ExamState = {
  examType: ExamType | null;
  questions: Question[];
  answers: Record<string, AnswerOption | 'bos' | null>;
  startedAt: number | null;
};

const defaultExam: ExamState = {
  examType: null,
  questions: [],
  answers: {},
  startedAt: null
};

const SettingsContext = createContext<{
  settings: AppSettings;
  updateSettings: (next: AppSettings) => void;
} | null>(null);

const ExamContext = createContext<{
  exam: ExamState;
  setExam: React.Dispatch<React.SetStateAction<ExamState>>;
  resetExam: () => void;
} | null>(null);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [exam, setExam] = useState<ExamState>(defaultExam);

  const updateSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const resetExam = useCallback(() => setExam(defaultExam), []);

  const settingsValue = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings]);
  const examValue = useMemo(() => ({ exam, setExam, resetExam }), [exam, setExam, resetExam]);

  return (
    <SettingsContext.Provider value={settingsValue}>
      <ExamContext.Provider value={examValue}>{children}</ExamContext.Provider>
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('SettingsContext kullanılmadan erişildi.');
  }
  return context;
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('ExamContext kullanılmadan erişildi.');
  }
  return context;
};
