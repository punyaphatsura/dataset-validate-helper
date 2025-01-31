'use client';
import { FC, useEffect, useState } from 'react';
import { TextArea } from './ui/textarea';
import { ChevronLeft, Edit2, Check, RotateCcw } from 'lucide-react';
import { EditHistory } from '@/types/validation';

interface DataRowProps {
  rowNumber: number;
  thaiText?: string;
  englishText?: string;
  onBack: () => void;
  canGoBack: boolean;
  dataLength: number;
  onEditDone: (
    thaiText: string,
    englishText: string,
    isChanged: boolean
  ) => void;
  status: 'Read' | 'Write';
  setStatus: (status: 'Write' | 'Read') => void;
  editHistory?: EditHistory;
}

const DataRow: FC<DataRowProps> = ({
  rowNumber,
  thaiText,
  englishText,
  canGoBack,
  dataLength,
  onBack,
  onEditDone,
  status,
  setStatus,
  editHistory,
}) => {
  const [currentThaiText, setCurrentThaiText] = useState<string>('');
  const [currentEnglishText, setCurrentEnglishText] = useState<string>('');

  useEffect(() => {
    console.log('editHistory', editHistory);
    if (editHistory) {
      setCurrentThaiText(editHistory.editedThai);
      setCurrentEnglishText(editHistory.editedEnglish);
    } else {
      if (thaiText) setCurrentThaiText(thaiText);
      if (englishText) setCurrentEnglishText(englishText);
    }
  }, [thaiText, englishText, editHistory]);

  useEffect(() => {
    const handleKeyEnter = (e: KeyboardEvent) => {
      if (status === 'Read') return;
      if (e.key === 'Enter') handleEditDone();
    };

    window.addEventListener('keydown', handleKeyEnter);
    return () => window.removeEventListener('keydown', handleKeyEnter);
  }, [currentThaiText, currentEnglishText, thaiText, englishText, status]);

  const handleEditDone = () => {
    const thaiTrim = currentThaiText.trim();
    const englishTrim = currentEnglishText.trim();
    const englishFormatted = englishTrim.endsWith('?')
      ? englishTrim
      : englishTrim.endsWith('.')
        ? englishTrim
        : englishTrim + '.';
    console.log('thaiTrim', thaiTrim);
    console.log('englishFormatted', englishFormatted);
    setCurrentEnglishText(englishFormatted);
    setCurrentThaiText(thaiTrim);
    onEditDone(
      thaiTrim,
      englishFormatted,
      !(thaiText === thaiTrim && englishText === englishFormatted)
    );
  };

  if (rowNumber - 1 >= dataLength) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-lg border border-green-200 bg-green-50 p-8">
        <div className="flex items-center gap-2 font-medium text-green-700">
          <Check className="h-5 w-5" />
          All rows processed! 🎉
        </div>
        <button
          className="flex items-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-2 text-green-700 shadow-sm transition-all hover:shadow-md"
          onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      </div>
    );
  }

  return (
    thaiText &&
    englishText && (
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                Row {rowNumber}
              </div>
              <div className="text-sm text-gray-500">
                {status === 'Write' ? 'Edit Mode' : 'Review Mode'}
              </div>
            </div>
            {status === 'Read' && (
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <KeyboardShortcut label="Space" description="OK" />
                <KeyboardShortcut label="W" description="Weird" />
                <KeyboardShortcut label="→" description="Skip" />
                {canGoBack && <KeyboardShortcut label="←" description="Back" />}
              </div>
            )}
          </div>

          <div
            className="space-y-4 p-6"
            onClick={() => status === 'Read' && setStatus('Write')}>
            <LanguageSection
              label="Thai"
              originalText={thaiText}
              currentText={currentThaiText}
              status={status}
              onChange={setCurrentThaiText}
            />
            <LanguageSection
              label="English"
              originalText={englishText}
              currentText={currentEnglishText}
              status={status}
              onChange={setCurrentEnglishText}
            />
          </div>

          {status === 'Write' && (
            <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditDone();
                }}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
                <Check className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    )
  );
};

const LanguageSection: FC<{
  label: string;
  originalText: string;
  currentText: string;
  status: 'Read' | 'Write';
  onChange: (value: string) => void;
}> = ({ label, originalText, currentText, status, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <span className="font-medium text-gray-700">{label}</span>
      {status === 'Write' && <Edit2 className="h-4 w-4 text-gray-400" />}
    </div>
    {status === 'Read' ? (
      <div className="rounded-lg bg-gray-50 p-4 text-lg">{currentText}</div>
    ) : (
      <div className="space-y-2">
        <div className="text-sm text-gray-500">Original text:</div>
        <div className="flex items-center justify-between rounded-lg bg-gray-100 p-3 text-gray-600">
          {originalText}
          <button
            onClick={() => {
              onChange(originalText);
            }}
            className="ml-2 rounded-full bg-blue-50 p-1 text-gray-500 transition-all duration-300 hover:rotate-[-360deg] hover:bg-blue-100">
            <RotateCcw color="rgb(29 78 216)" size={18} />
          </button>
        </div>
        <TextArea
          value={currentText}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[100px] w-full rounded-lg border-gray-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
    )}
  </div>
);

const KeyboardShortcut: FC<{ label: string; description: string }> = ({
  label,
  description,
}) => (
  <div className="flex items-center gap-1">
    <kbd className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium shadow-sm">
      {label}
    </kbd>
    <span className="text-gray-400">{description}</span>
  </div>
);

export default DataRow;
