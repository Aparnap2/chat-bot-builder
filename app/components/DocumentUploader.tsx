// DocumentUploader.tsx
import { useState } from "react";
import { toast } from "react-hot-toast";

const DocumentUploader = () => {
  const [files, setFiles] = useState<File[]>([]);

 // Added file validation and feedback
const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['application/pdf', 'text/plain'];

  if (event.target.files) {
    const validFiles = Array.from(event.target.files).filter(file => 
      allowedTypes.includes(file.type) && file.size <= MAX_SIZE
    );
    
    if (validFiles.length !== event.target.files.length) {
      toast.error('Only PDF/TXT files under 5MB accepted');
    }
    
    setFiles(validFiles);
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