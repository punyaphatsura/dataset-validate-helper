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
    <div className="relative flex items-center gap-x-2">
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        className="rounded-md bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100">
        {buttonText}
      </button>
      {showFileName && fileName && (
        <div className="break-all text-sm text-gray-600">{fileName}</div>
      )}
    </div>
  );
};

export default FileUploadButton;
