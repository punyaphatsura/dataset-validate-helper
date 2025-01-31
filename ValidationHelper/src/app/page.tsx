'use client';
import { useState, useEffect, FC } from 'react';
import { DataRowType, FileData, parseCsvFile } from '@/utils/parseCsv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Check, X, SkipForward, History } from 'lucide-react';
import FileUploadButton from '@/components/FileUploadButton';
import DataRow from '@/components/DataRow';
import {
  EditHistory,
  ValidationHistory,
  ValidationStats,
} from '@/types/validation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [isInit, setIsInit] = useState<boolean>(true);
  const [status, setStatus] = useState<'Write' | 'Read'>('Read');

  useEffect(() => {
    if (data.length === 0) return;
    clearProgress();
    const savedProgress = localStorage.getItem(
      `validationProgress-${FileData.getFileName()}`
    );
    if (savedProgress) {
      const { currentRow, stats, history, editHistory } =
        JSON.parse(savedProgress);
      setCurrentRow(currentRow);
      setStats(stats);
      setHistory(history || []);
      setEditHistory(editHistory || []);
      setIsInit(false);
    } else {
      localStorage.setItem(
        `validationProgress-${FileData.getFileName()}`,
        JSON.stringify({
          currentRow,
          stats,
          history,
          editHistory,
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
          editHistory,
        })
      );
    }
  }, [currentRow, stats, history, editHistory, data]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status === 'Write') return;
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
        if (editHistory.find((eh) => eh.rowIndex === currentRow)) {
          setEditHistory((prev) => {
            const filtered = prev.filter(
              (edit) => edit.rowIndex !== currentRow
            );
            return filtered;
          });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setStatus('Write');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentRow, history, status]);

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
    setEditHistory([]);
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
      setEditHistory([]);
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

  const handleEditDone = (
    thaiText: string,
    englishText: string,
    isChanged: boolean
  ) => {
    setStatus('Read');
    if (isChanged && data[currentRow]) {
      const originalThai = data[currentRow]['thai sentence'];
      const originalEnglish = data[currentRow]['english sentence'];

      // Only add to edit history if the text actually changed
      if (thaiText !== originalThai || englishText !== originalEnglish) {
        const newEdit: EditHistory = {
          rowIndex: currentRow,
          originalThai,
          originalEnglish,
          editedThai: thaiText,
          editedEnglish: englishText,
        };

        setEditHistory((prev) => {
          const filtered = prev.filter((edit) => edit.rowIndex !== currentRow);
          return [...filtered, newEdit];
        });
      }
    } else if (
      !isChanged &&
      editHistory.find((eh) => eh.rowIndex === currentRow)
    ) {
      console.log('removing', currentRow);
      setEditHistory((prev) => {
        const filtered = prev.filter((edit) => edit.rowIndex !== currentRow);
        return filtered;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Dataset Validator
            </div>
            {data.length > 0 && (
              <button
                onClick={handleReset}
                className="rounded-md bg-red-50 px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-100">
                Reset Progress
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <FileUploadButton
                onChange={handleFileUpload}
                buttonText="Upload Dataset File"
                id="upload-file"
                accept=".csv"
                showFileName
              />
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            {data.length > 0 && (
              <>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold">Progress</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={downloadProgress}
                      className="rounded-md bg-green-100 px-3 py-2 text-sm font-semibold text-green-800 transition-colors hover:bg-green-200">
                      Download Progress
                    </button>
                    <FileUploadButton
                      onChange={handleUploadProgress}
                      buttonText="Upload Progress"
                      id="upload-progress"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {data.length > 0 && (
                    <p className="text-sm font-normal text-gray-500">
                      {Math.min(data.length, currentRow + 1)} / {data.length}
                    </p>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress: {progress}%</span>
                    <span>Remaining: {data.length - currentRow}</span>
                  </div>
                  <Progress value={progress} className="w-full" />

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="h-4 w-4" />
                      Ok: {stats.ok}
                    </div>
                    <div className="flex items-center gap-2 text-red-600">
                      <X className="h-4 w-4" />
                      Weird: {stats.weird}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <SkipForward className="h-4 w-4" />
                      Skipped: {stats.skip}
                    </div>
                  </div>
                </div>
              </>
            )}

            {loading ? (
              <div className="py-8 text-center">Loading...</div>
            ) : (
              data.length > 0 && (
                <DataRow
                  status={status}
                  setStatus={setStatus}
                  onEditDone={handleEditDone}
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
                  editHistory={editHistory.find(
                    (eh) => eh.rowIndex === currentRow
                  )}
                />
              )
            )}
          </div>
        </CardContent>
      </Card>
      {data.length > 0 && (
        <Tabs defaultValue="skip" className="mx-auto mt-8 max-w-3xl">
          <TabsList>
            <TabsTrigger value="skip">Skip</TabsTrigger>
            <TabsTrigger value="wried">Wried</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>
          <TabsContent value="skip">
            <Card className="mx-auto max-w-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SkipForward className="h-6 w-6 text-orange-500" />
                  <span>Skipped Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {history
                    .filter((entry) => entry.mark === 'skip')
                    .map((entry) => (
                      <div
                        key={entry.rowIndex}
                        className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="rounded-md bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                            Row {entry.rowIndex + 1}
                          </span>
                        </div>

                        {/* Content container */}
                        <div className="rounded-lg bg-gray-50 p-4">
                          {/* Thai text section */}
                          <div className="mb-4">
                            <div className="mb-2 font-medium text-gray-700">
                              Thai Text
                            </div>
                            <div className="rounded border border-gray-200 bg-white p-3">
                              {data && data[entry.rowIndex] && (
                                <span className="text-gray-800">
                                  {data[entry.rowIndex]['thai sentence']}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* English text section */}
                          <div>
                            <div className="mb-2 font-medium text-gray-700">
                              English Text
                            </div>
                            <div className="rounded border border-gray-200 bg-white p-3">
                              {data && data[entry.rowIndex] && (
                                <span className="text-gray-800">
                                  {data[entry.rowIndex]['english sentence']}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-4">
                          <button
                            onClick={() => {
                              setStats((prev) => ({
                                ...prev,
                                weird: prev.weird + 1,
                                skip: prev.skip - 1,
                              }));
                              setHistory((prev) =>
                                prev.map((h) =>
                                  h.rowIndex === entry.rowIndex
                                    ? { ...h, mark: 'weird' }
                                    : h
                                )
                              );
                            }}
                            className="min-w-32 rounded-md bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-200">
                            Mark as Weird
                          </button>
                          <button
                            onClick={() => {
                              setStats((prev) => ({
                                ...prev,
                                ok: prev.ok + 1,
                                skip: prev.skip - 1,
                              }));
                              setHistory((prev) =>
                                prev.map((h) =>
                                  h.rowIndex === entry.rowIndex
                                    ? { ...h, mark: 'ok' }
                                    : h
                                )
                              );
                            }}
                            className="min-w-32 rounded-md bg-green-100 px-3 py-2 text-sm font-semibold text-green-700 transition-colors hover:bg-green-200">
                            Mark as Ok
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="wried">
            <Card className="mx-auto max-w-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <X className="h-6 w-6 text-red-600" />
                  <span>Wried Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {history
                    .filter((entry) => entry.mark === 'weird')
                    .map((entry) => (
                      <div
                        key={entry.rowIndex}
                        className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            Row {entry.rowIndex + 1}
                          </span>
                        </div>

                        {/* Content container */}
                        <div className="rounded-lg bg-gray-50 p-4">
                          {/* Thai text section */}
                          <div className="mb-4">
                            <div className="mb-2 font-medium text-gray-700">
                              Thai Text
                            </div>
                            <div className="rounded border border-gray-200 bg-white p-3">
                              {data && data[entry.rowIndex] && (
                                <span className="text-gray-800">
                                  {data[entry.rowIndex]['thai sentence']}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* English text section */}
                          <div>
                            <div className="mb-2 font-medium text-gray-700">
                              English Text
                            </div>
                            <div className="rounded border border-gray-200 bg-white p-3">
                              {data && data[entry.rowIndex] && (
                                <span className="text-gray-800">
                                  {data[entry.rowIndex]['english sentence']}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="edit">
            <Card className="mx-auto max-w-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-600" />
                  <span>Edit History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {editHistory.map((edit) => (
                    <div
                      key={`${edit.rowIndex}`}
                      className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                            Row {edit.rowIndex + 1}
                          </span>
                        </div>
                      </div>

                      {/* Thai Section */}
                      <div className="mb-6 rounded-lg bg-gray-50 p-4">
                        <div className="mb-3 font-medium text-gray-700">
                          Thai Text
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-col gap-2">
                            <div className="text-sm font-medium text-gray-500">
                              Original
                            </div>
                            <div className="rounded border border-gray-200 bg-white p-2">
                              {edit.originalThai}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="text-sm font-medium text-gray-500">
                              Edited
                            </div>
                            <div className="rounded border border-blue-100 bg-blue-50 p-2 text-blue-900">
                              {edit.editedThai}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* English Section */}
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="mb-3 font-medium text-gray-700">
                          English Text
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-col gap-2">
                            <div className="text-sm font-medium text-gray-500">
                              Original
                            </div>
                            <div className="rounded border border-gray-200 bg-white p-2">
                              {edit.originalEnglish}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="text-sm font-medium text-gray-500">
                              Edited
                            </div>
                            <div className="rounded border border-blue-100 bg-blue-50 p-2 text-blue-900">
                              {edit.editedEnglish}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Home;
