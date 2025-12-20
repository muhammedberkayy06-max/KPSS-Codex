import { Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './lib/state';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import ExamPage from './pages/ExamPage';
import ResultsPage from './pages/ResultsPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => (
  <AppStateProvider>
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ayarlar" element={<SettingsPage />} />
        <Route path="/deneme" element={<ExamPage />} />
        <Route path="/sonuc" element={<ResultsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  </AppStateProvider>
);

export default App;
