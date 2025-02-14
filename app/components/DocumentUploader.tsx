// DocumentUploader.tsx
import { useState } from "react";

const DocumentUploader = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Document Upload</h3>
      <input
        type="file"
        multiple
        onChange={handleFileUpload}
        className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
      />
      <ul>
        {files.map((file, index) => (
          <li key={index} className="text-white">
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentUploader;