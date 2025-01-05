import React, { useState, useEffect } from 'react';
import { FaFolder, FaDownload } from 'react-icons/fa';

interface User {
  department: string;
  semester: string;
}

interface NoteFile {
  filename: string;
  url: string;
  size: number;
  type?: string;
  department?: string;
  semester?: string;
  subject?: string;
  content?: string;
  mimeType?: string;
}

interface Subject {
  subject: string;
  totalFiles: number;
  notes: NoteFile[];
}

interface FileViewerProps {
  file: NoteFile | null;
}

interface NotesViewerProps {
  user: User | null;
}

const NotesViewer = ({ user }:NotesViewerProps) => {
  const [notes, setNotes] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedFile, setSelectedFile] = useState<NoteFile | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotes(user.department, user.semester);
    }
  }, [user]);

  const fetchNotes = async (department: string, semester:string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notes?department=${department}&semester=${semester}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data.subjects);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const handleDownload = async (file:NoteFile) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  if (!notes || notes.length === 0) {
    return (
      <div className="text-center p-8 dark:bg-gray-800 rounded-lg">
        <FaFolder className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200">No Notes Available</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Notes for your department and semester will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">Subjects</h3>
        <div className="space-y-2">
          {notes.map((subject, index) => (
            <div
              key={index}
              onClick={() => setSelectedSubject(subject)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedSubject === subject
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {subject.subject}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {subject.totalFiles} files
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-9 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        {selectedSubject ? (
          <div className="h-full">
            <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
              {selectedSubject.subject} Notes
            </h3>
            
            <div className="grid grid-cols-12 gap-4 h-[calc(100%-2rem)]">
              <div className="col-span-4 border-r dark:border-gray-700 pr-4">
                {selectedSubject.notes.map((file, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                      selectedFile === file
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div 
                      className="font-medium mb-2 text-gray-900 dark:text-gray-100 
                        hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setSelectedFile(file)}
                    >
                      {file.filename}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                      <span>{file.size} bytes</span>
                      <button
                        onClick={() => handleDownload(file)}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 
                          hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <FaDownload className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-span-8 pl-4 h-full">
                <div className="h-[calc(100vh-8rem)] w-full">
                  <FileViewer file={selectedFile} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a subject to view notes
          </div>
        )}
      </div>
    </div>
  );
};

const FileViewer = ({ file}:FileViewerProps) => {
  const [loading, setLoading] = useState(true);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 
        rounded-lg p-6">
        <p className="text-gray-500 dark:text-gray-400">Select a file to preview</p>
      </div>
    );
  }

  const getFileType = (file:NoteFile) => {
    if (file.type) return file.type.toLowerCase();
    const extension = file.filename.split('.').pop();
    return extension ? extension.toLowerCase() : '';
  };

  const fileType = getFileType(file);

  if (fileType === 'pdf') {
    return (
      <div className="h-full w-full relative bg-gray-50 dark:bg-gray-900">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center 
            bg-gray-50 dark:bg-gray-900 bg-opacity-75">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 
              border-blue-600 dark:border-blue-400"></div>
          </div>
        )}
        <embed
          src={file.url}
          type="application/pdf"
          className="w-full h-full"
          onLoad={() => setLoading(false)}
        />
      </div>
    );
  }


  if (fileType === 'ppt' || fileType === 'pptx') {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const fileUrl = `${baseUrl}/api/files/${file.department}/${file.semester}/${file.subject}/${encodeURIComponent(file.filename)}`;
    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    
    return (
      <div className="h-full w-full relative bg-gray-50">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <iframe
          src={viewerUrl}
          className="w-full h-full"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            console.error('Failed to load presentation');
          }}
        />
      </div>
    );
  }

  const textFileTypes = ['txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'css', 'html'];
  if (textFileTypes.includes(fileType)) {
    return (
      <div className="h-full w-full relative bg-gray-50">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <pre className="w-full h-full overflow-auto p-4 bg-white">
          {file.content}
        </pre>
      </div>
    );
  }

  const imageFileTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
  if (imageFileTypes.includes(fileType)) {
    return (
      <div className="flex items-center justify-center h-full">
        <img 
          src={file.url} 
          alt={file.filename}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full 
      bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        Preview not available for {fileType.toUpperCase()} files
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500">
        You can download the file to view its contents
      </p>
    </div>
  );
};


export { NotesViewer };