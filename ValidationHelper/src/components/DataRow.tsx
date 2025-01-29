import { FC } from 'react';

interface DataRowProps {
  rowNumber: number;
  thaiText?: string;
  englishText?: string;
  onBack: () => void;
  canGoBack: boolean;
  dataLength: number;
}

const DataRow: FC<DataRowProps> = ({
  rowNumber,
  thaiText,
  englishText,
  canGoBack,
  dataLength,
  onBack,
}) => {
  return rowNumber - 1 >= dataLength ? (
    <div className='flex flex-col gap-4'>
      <div className='text-center text-green-600'>All rows processed! 🎉</div>
      <button
        className='text-sm px-3 py-2 font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors'
        onClick={onBack}>
        Back
      </button>
    </div>
  ) : (
    thaiText && englishText && (
      <div
        tabIndex={0}
        className={`p-6 border rounded-lg transition-colors duration-200`}>
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

export default DataRow;
