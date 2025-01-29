import { FC, useState, useRef } from 'react';

interface FileUploadButtonProps {
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  buttonText: string;
  accept?: string;
  showFileName?: boolean;
}

const FileUploadButton: FC<FileUploadButtonProps> = ({
  id,
  onChange,
  buttonText,
  accept = '.txt',
  showFileName = false,
}) => {
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
    onChange(e);
  };

  return (
    <div className='relative flex items-center gap-x-2'>
      <input
        ref={fileInputRef}
        id={id}
        type='file'
        accept={accept}
        onChange={handleChange}
        className='hidden'
      />
      <button
        onClick={handleClick}
        className='text-sm px-4 py-2 bg-blue-50 text-blue-700 rounded-md 
                   hover:bg-blue-100 transition-colors font-semibold'>
        {buttonText}
      </button>
      {showFileName && fileName && (
        <div className='text-sm text-gray-600 break-all'>{fileName}</div>
      )}
    </div>
  );
};

export default FileUploadButton;