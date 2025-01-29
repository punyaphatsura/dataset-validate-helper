'use client';
import { useState, useEffect, FC } from 'react';
import { DataRowType, FileData, parseCsvFile } from '@/utils/parseCsv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Check, X, SkipForward } from 'lucide-react';
import FileUploadButton from '@/components/FileUploadButton';
import DataRow from '@/components/DataRow';
import { ValidationStats, ValidationHistory } from '@/types/validation';

const Home: FC = () => {
  const [data, setData] = useState<DataRowType[]>([]);
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [stats, setStats] = useState<ValidationStats>({
    weird: 0,
    ok: 0,
    skip: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [history, setHistory] = useState<ValidationHistory[]>([]);
  const [isInit, setIsInit] = useState<boolean>(true);

  useEffect(() => {
    if (data.length === 0) return;
    clearProgress();
    const savedProgress = localStorage.getItem(
      `validationProgress-${FileData.getFileName().split('.')[0]}`
    );
    if (savedProgress) {
      const { currentRow, stats, history } = JSON.parse(savedProgress);
      setCurrentRow(currentRow);
      setStats(stats);
      setHistory(history || []);
      setIsInit(false);
    } else {
      localStorage.setItem(
        `validationProgress-${FileData.getFileName().split('.')[0]}`,
        JSON.stringify({
          currentRow,
          stats,
          history,
        })
      );
      setIsInit(false);
    }
  }, [data]);

  useEffect(() => {
    if (isInit) return;
    if (data.length > 0) {
      localStorage.setItem(
        `validationProgress-${FileData.getFileName().split('.')[0]}`,
        JSON.stringify({
          currentRow,
          stats,
          history,
        })
      );
    }
  }, [currentRow, stats, history, data]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        handleMark('ok', 'forward');
      } else if (e.key === 'w' || e.key === 'ไ') {
        e.preventDefault();
        handleMark('weird', 'forward');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleMark('skip', 'forward');
      } else if (e.key === 'ArrowLeft' && history.length > 0) {
        e.preventDefault();
        handleMark('skip', 'back');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentRow, history]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      setError('');
      try {
        const parsedData = await parseCsvFile(e.target.files[0]);
        setData(parsedData);
      } catch (error) {
        setError(
          "Error parsing CSV file. Please make sure it's properly formatted."
        );
        console.error('Error parsing CSV:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const clearProgress = () => {
    setCurrentRow(0);
    setStats({ weird: 0, ok: 0, skip: 0 });
    setHistory([]);
  };

  const handleMark = (
    mark: ValidationHistory['mark'],
    direction: 'forward' | 'back' = 'forward'
  ) => {
    if (direction === 'forward') {
      // Add to history and update stats
      setHistory((prev) => [...prev, { rowIndex: currentRow, mark }]);
      setStats((prev) => ({ ...prev, [mark]: prev[mark] + 1 }));
      setCurrentRow((prev) => prev + 1);
    } else {
      // Go back to previous row
      if (history.length > 0) {
        const lastValidation = history[history.length - 1];
        // Decrease the count for the previous mark
        setStats((prev) => ({
          ...prev,
          [lastValidation.mark]: prev[lastValidation.mark] - 1,
        }));
        // Remove the last validation from history
        setHistory((prev) => prev.slice(0, -1));
        // Go back one row
        setCurrentRow((prev) => prev - 1);
      }
    }
  };

  const progress = data.length
    ? Math.round((currentRow / data.length) * 100)
    : 0;

  const handleReset = () => {
    if (
      confirm('Are you sure you want to reset progress? This cannot be undone.')
    ) {
      setCurrentRow(0);
      setStats({ weird: 0, ok: 0, skip: 0 });
      setHistory([]);
      localStorage.removeItem(
        `validationProgress-${FileData.getFileName().split('.')[0]}`
      );
    }
  };

  const downloadProgress = () => {
    const savedProgress = localStorage.getItem(
      `validationProgress-${FileData.getFileName().split('.')[0]}`
    );
    if (savedProgress) {
      const blob = new Blob([savedProgress], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `validationProgress-${
        FileData.getFileName().split('.')[0]
      }.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleUploadProgress = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      setError('');
      try {
        const file = e.target.files[0];
        const text = await file.text();
        const progress = JSON.parse(text);
        setCurrentRow(progress.currentRow);
        setStats(progress.stats);
        setHistory(progress.history);
        localStorage.setItem(
          `validationProgress-${FileData.getFileName().split('.')[0]}`,
          text
        );
      } catch (error) {
        setError('Error parsing progress file. Please make sure it is valid.');
        console.error('Error parsing progress file:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Upload className='w-6 h-6' />
              Dataset Validator
            </div>
            {data.length > 0 && (
              <button
                onClick={handleReset}
                className='text-sm px-3 py-1 bg-red-50 text-red-600 rounded-md 
                         hover:bg-red-100 transition-colors'>
                Reset Progress
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            <div className='flex flex-col gap-2'>
              <FileUploadButton
                onChange={handleFileUpload}
                buttonText='Upload Dataset File'
                id='upload-file'
                accept='.csv'
                showFileName
              />
              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            {data.length > 0 && (
              <>
                <div className='space-y-2'>
                  <h3 className='text-base font-semibold'>Progress</h3>
                  <div className='flex gap-4'>
                    <button
                      onClick={downloadProgress}
                      className='text-sm px-3 py-2 font-semibold bg-green-100 text-green-800 rounded-md 
              hover:bg-green-200 transition-colors'>
                      Download Progress
                    </button>
                    <FileUploadButton
                      onChange={handleUploadProgress}
                      buttonText='Upload Progress'
                      id='upload-progress'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  {data.length > 0 && (
                    <p className='text-gray-500 text-sm font-norma'>
                      {Math.min(data.length, currentRow + 1)} / {data.length}
                    </p>
                  )}
                  <div className='flex justify-between text-sm text-gray-600'>
                    <span>Progress: {progress}%</span>
                    <span>Remaining: {data.length - currentRow}</span>
                  </div>
                  <Progress value={progress} className='w-full' />

                  <div className='grid grid-cols-3 gap-4 mt-4'>
                    <div className='flex items-center gap-2 text-green-600'>
                      <Check className='w-4 h-4' />
                      Ok: {stats.ok}
                    </div>
                    <div className='flex items-center gap-2 text-red-600'>
                      <X className='w-4 h-4' />
                      Weird: {stats.weird}
                    </div>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <SkipForward className='w-4 h-4' />
                      Skipped: {stats.skip}
                    </div>
                  </div>
                </div>
              </>
            )}

            {loading ? (
              <div className='text-center py-8'>Loading...</div>
            ) : (
              data.length > 0 && (
                <DataRow
                  rowNumber={currentRow + 1}
                  thaiText={
                    data[currentRow]
                      ? data[currentRow]['thai sentence']
                      : undefined
                  }
                  englishText={
                    data[currentRow]
                      ? data[currentRow]['english sentence']
                      : undefined
                  }
                  onBack={() => handleMark('skip', 'back')}
                  canGoBack={history.length > 0}
                  dataLength={data.length}
                />
              )
            )}
          </div>
        </CardContent>
      </Card>
      {data.length > 0 && stats.weird > 0 && (
        <div className='mt-8'>
          <Card className='max-w-2xl mx-auto'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <X className='w-6 h-6 text-red-600' />
                Weird Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {history
                  .filter((entry) => entry.mark === 'weird')
                  .map((entry) => (
                    <div
                      key={entry.rowIndex}
                      className='p-4 bg-gray-50 rounded'>
                      <div className='text-sm text-gray-500 mb-1'>
                        Row {entry.rowIndex + 1}
                      </div>
                      <div className='text-lg'>
                        {data &&
                          data[entry.rowIndex] &&
                          data[entry.rowIndex]['thai sentence']}
                      </div>
                      <div className='text-lg'>
                        {data &&
                          data[entry.rowIndex] &&
                          data[entry.rowIndex]['english sentence']}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Home;
