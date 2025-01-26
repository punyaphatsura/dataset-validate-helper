'use client';
import { useState, useEffect, FC, useRef } from 'react';
import { FileData, parseCsvFile } from '../utils/parseCsv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Check, X, SkipForward } from 'lucide-react';

interface DataRowType {
  'thai sentence': string;
  'english sentence': string;
}

interface ValidationStats {
  weird: number;
  ok: number;
  skip: number;
}

// Add interface for validation history
interface ValidationHistory {
  rowIndex: number;
  mark: 'weird' | 'ok' | 'skip';
}

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
      `validationProgress-${FileData.getFileName()}`
    );
    if (savedProgress) {
      const { currentRow, stats, history } = JSON.parse(savedProgress);
      setCurrentRow(currentRow);
      setStats(stats);
      setHistory(history || []);
      setIsInit(false);
    } else {
      localStorage.setItem(
        `validationProgress-${FileData.getFileName()}`,
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
        `validationProgress-${FileData.getFileName()}`,
        JSON.stringify({
          currentRow,
          stats,
          history,
        })
      );
    }
  }, [currentRow, stats, history, data]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      setError('');
      try {
        const parsedData = await parseCsvFile(e.target.files[0]);
        setData(parsedData);
        // setCurrentRow(0);
        // setStats({ weird: 0, ok: 0, skip: 0 });
        // setHistory([]);
        // localStorage.removeItem('validationProgress');
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
    mark: 'weird' | 'ok' | 'skip',
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
      localStorage.removeItem(`validationProgress-${FileData.getFileName()}`);
    }
  };

  const downloadProgress = () => {
    const savedProgress = localStorage.getItem(
      `validationProgress-${FileData.getFileName()}`
    );
    if (savedProgress) {
      const blob = new Blob([savedProgress], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `validationProgress-${FileData.getFileName()}.txt`;
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
          `validationProgress-${FileData.getFileName()}`,
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
              <input
                type='file'
                accept='.csv'
                onChange={handleFileUpload}
                className='block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100'
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
                  onMark={handleMark}
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

interface DataRowProps {
  rowNumber: number;
  thaiText?: string;
  englishText?: string;
  onMark: (
    mark: 'weird' | 'ok' | 'skip',
    direction?: 'forward' | 'back'
  ) => void;
  canGoBack: boolean;
  dataLength: number;
}

const DataRow: FC<DataRowProps> = ({
  rowNumber,
  thaiText,
  englishText,
  onMark,
  canGoBack,
  dataLength,
}) => {
  useEffect(() => {
    const element = document.getElementById('data-row');
    if (element) {
      element.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      onMark('ok', 'forward');
    } else if (e.key === 'w' || e.key === 'ไ') {
      e.preventDefault();
      onMark('weird', 'forward');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onMark('skip', 'forward');
    } else if (e.key === 'ArrowLeft' && canGoBack) {
      e.preventDefault();
      onMark('skip', 'back');
    }
  };

  return rowNumber - 1 >= dataLength ? (
    <div className='flex flex-col gap-4'>
      <div className='text-center text-green-600'>All rows processed! 🎉</div>
      <button
        className='text-sm px-3 py-2 font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors'
        onClick={() => {
          onMark('skip', 'back');
        }}>
        Back
      </button>
    </div>
  ) : (
    thaiText && englishText && (
      <div
        id='data-row'
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`p-6 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 `}>
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <span className='font-medium text-gray-600'>Row {rowNumber}</span>
            <div className='text-sm text-gray-500'>
              Press <kbd className='px-2 py-1 bg-gray-100 rounded'>Space</kbd>{' '}
              for OK,
              <kbd className='px-2 py-1 bg-gray-100 rounded ml-1'>W</kbd> for
              Weird,
              <kbd className='px-2 py-1 bg-gray-100 rounded ml-1'>→</kbd> to
              Skip
              {canGoBack && (
                <>
                  , <kbd className='px-2 py-1 bg-gray-100 rounded ml-1'>←</kbd>{' '}
                  to Go Back
                </>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='p-3 bg-gray-50 rounded'>
              <div className='text-sm text-gray-500 mb-1'>Thai</div>
              <div className='text-lg'>{thaiText}</div>
            </div>

            <div className='p-3 bg-gray-50 rounded'>
              <div className='text-sm text-gray-500 mb-1'>English</div>
              <div className='text-lg'>{englishText}</div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

interface FileUploadButtonProps {
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  buttonText: string;
}

const FileUploadButton: FC<FileUploadButtonProps> = ({
  id,
  onChange,
  buttonText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  return (
    <div className='relative'>
      <input
        ref={fileInputRef}
        id={id}
        type='file'
        accept='.txt'
        onChange={onChange}
        className='hidden'
      />
      <button
        onClick={handleClick}
        className='text-sm px-4 py-2 bg-blue-50 text-blue-700 rounded-md 
                 hover:bg-blue-100 transition-colors font-semibold'>
        {buttonText}
      </button>
    </div>
  );
};
