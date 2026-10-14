import { useState, useCallback } from 'react';
import type { Screen, ScanResult } from '@/types';
import { analyzeFishImage } from '@/services/aiAnalyzer';
import { saveScan } from '@/services/scanHistory';
import { BottomNav } from '@/components/Navigation';
import { HomeScreen } from '@/screens/HomeScreen';
import { UploadScreen } from '@/screens/UploadScreen';
import { ScanningScreen } from '@/screens/ScanningScreen';
import { ResultsScreen } from '@/screens/ResultsScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { ExplorerScreen } from '@/screens/ExplorerScreen';
import { SpeciesDetailScreen } from '@/screens/SpeciesDetailScreen';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [uploadMode, setUploadMode] = useState<'upload' | 'camera'>('upload');
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleNavigate = useCallback((next: Screen) => {
    setScreen(next);
  }, []);

  const handleUpload = useCallback(() => {
    setUploadMode('upload');
    setScreen('upload');
  }, []);

  const handleCamera = useCallback(() => {
    setUploadMode('camera');
    setScreen('upload');
  }, []);

  const handleImageSelected = useCallback(async (imageData: string) => {
    setScanError(null);
    setScanImage(imageData);
    setScreen('scanning');
    try {
      const result = await analyzeFishImage(imageData);
      setScanResult(result);
      saveScan(result);
      setScreen('results');
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Fish scan failed. Please try again.');
      setScreen('upload');
    }
  }, []);

  const handleSelectScan = useCallback((result: ScanResult) => {
    setScanResult(result);
    setScreen('results');
  }, []);

  const handleSpeciesSelect = useCallback((speciesId: string) => {
    setSelectedSpeciesId(speciesId);
    setScreen('speciesDetail');
  }, []);

  const handleBackToHome = useCallback(() => {
    setScreen('home');
  }, []);

  const handleBackToExplorer = useCallback(() => {
    setScreen('explorer');
  }, []);

  const handleBackToHistory = useCallback(() => {
    setHistoryRefreshKey((k) => k + 1);
    setScreen('history');
  }, []);

  const showBottomNav = !['scanning', 'upload'].includes(screen);

  return (
    <div className="min-h-screen bg-slate-50">
      {screen === 'home' && (
        <HomeScreen onNavigate={handleNavigate} onUpload={handleUpload} onCamera={handleCamera} />
      )}

      {screen === 'upload' && (
        <UploadScreen
          onImageSelected={handleImageSelected}
          onBack={handleBackToHome}
          mode={uploadMode}
          submissionError={scanError}
        />
      )}

      {screen === 'scanning' && scanImage && <ScanningScreen imageData={scanImage} />}

      {screen === 'results' && scanResult && (
        <ResultsScreen
          result={scanResult}
          onBack={handleBackToHome}
          onSpeciesSelect={handleSpeciesSelect}
        />
      )}

      {screen === 'history' && (
        <HistoryScreen
          onSelectScan={handleSelectScan}
          onBack={handleBackToHome}
          refreshKey={historyRefreshKey}
        />
      )}

      {screen === 'explorer' && (
        <ExplorerScreen onSpeciesSelect={handleSpeciesSelect} />
      )}

      {screen === 'speciesDetail' && selectedSpeciesId && (
        <SpeciesDetailScreen
          speciesId={selectedSpeciesId}
          onBack={handleBackToExplorer}
          onSpeciesSelect={handleSpeciesSelect}
        />
      )}

      {showBottomNav && <BottomNav current={screen} onNavigate={handleNavigate} />}
    </div>
  );
}

export default App;
