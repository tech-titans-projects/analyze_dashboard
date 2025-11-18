import React, { useRef, useState, useMemo } from 'react';
import { transcribeAudio } from '../services/geminiService';
import { AnalyzeIcon, UploadIcon, MicrophoneIcon, StopIcon } from './Icons';
import { SpellCheckTextarea } from './SpellCheckTextarea';

interface TextInputSectionProps {
  inputText: string;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const TextInputSection: React.FC<TextInputSectionProps> = ({ inputText, setInputText, onAnalyze, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const lineCount = useMemo(() => inputText.split('\n').filter(t => t.trim() !== '').length, [inputText]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(content);
      };
      reader.readAsText(file);
    }
    // Reset file input value to allow re-uploading the same file
    if(event.target) {
        event.target.value = '';
    }
  };
  
  const handleStartRecording = async () => {
    setRecordingError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); 
        
        try {
          const transcribedText = await transcribeAudio(audioBlob);
          setInputText(prev => prev ? `${transcribedText}\n${prev}` : transcribedText);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          setRecordingError(`Transcription failed: ${errorMessage}`);
        } finally {
          setIsTranscribing(false);
          mediaStreamRef.current?.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setRecordingError("Could not access microphone. Please check permissions and try again.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const recordingInProgress = isRecording || isTranscribing;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Enter Your Text</h2>
       {recordingError && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Recording Error: </strong>
              <span className="block sm:inline">{recordingError}</span>
          </div>
      )}
      <div className="space-y-2">
        <SpellCheckTextarea
          value={inputText}
          onChange={setInputText}
          disabled={isLoading || recordingInProgress}
        />
        <p className={`text-right text-sm font-medium pr-1 ${lineCount > 50 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
            {lineCount} / 50 statements
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
            disabled={isLoading || recordingInProgress}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || recordingInProgress}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <UploadIcon />
            Upload .txt
          </button>
           <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isLoading || isTranscribing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 ${
                isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {isRecording ? <StopIcon /> : <MicrophoneIcon />}
            {isTranscribing ? 'Transcribing...' : isRecording ? 'Stop Recording' : 'Record Audio'}
          </button>
        </div>

        <button
          onClick={onAnalyze}
          disabled={isLoading || recordingInProgress || inputText.trim() === '' || lineCount > 50}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AnalyzeIcon />
          {isLoading ? 'Analyzing...' : 'Analyze Sentiment'}
        </button>
      </div>
    </div>
  );
};