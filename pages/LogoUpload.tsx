
import React, { useState, useRef } from 'react';

interface LogoUploadPageProps {
  onUpdateLogo: (svgString: string | null) => void;
  currentLogo: string | null;
}

export const LogoUploadPage: React.FC<LogoUploadPageProps> = ({ onUpdateLogo, currentLogo }) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);

    if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
      setError('Invalid file format. Please upload a valid SVG file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content.includes('<svg')) {
        const cleaned = content
          .replace(/width="[^"]*"/, 'width="100%"')
          .replace(/height="[^"]*"/, 'height="100%"');
        onUpdateLogo(cleaned);
      } else {
        setError('The file content does not appear to be a valid SVG.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const resetLogo = () => {
    onUpdateLogo(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-16 py-20 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-7xl font-black text-brand-slate tracking-tight leading-tight">
          Brand <span className="inline-block px-4 py-1 bg-brand-slate text-brand-primary rounded-2xl rotate-[-1deg] italic">Identity</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
          Customize the Bidflow interface with your organization's logo. Your logo will be rendered within our 3D convex vessel.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-8">
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group h-96 rounded-[4rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
              isDragging 
                ? 'border-brand-primary bg-brand-primary/5 scale-[0.98]' 
                : 'border-slate-200 bg-white hover:border-brand-primary/40 hover:shadow-saas'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".svg,image/svg+xml" 
              className="hidden" 
            />
            
            <div className={`p-8 rounded-3xl bg-slate-50 transition-all duration-500 group-hover:scale-110 mb-8 ${isDragging ? 'bg-brand-primary/20' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${isDragging ? 'text-brand-blue' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            
            <p className="text-brand-slate font-black uppercase tracking-widest text-sm">Drop SVG Here</p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-3">or click to browse files</p>

            {isDragging && (
              <div className="absolute inset-0 bg-brand-primary/5 backdrop-blur-[2px] pointer-events-none"></div>
            )}
          </div>

          {error && (
            <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 animate-shake">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-bold text-red-600 uppercase tracking-wider">{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="p-12 bg-white rounded-[4rem] border border-slate-100 shadow-saas space-y-12">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Preview</h3>
            
            <div className="flex justify-center">
              <div className="logo-preview-vessel w-48 h-48 md:w-64 md:h-64 relative flex items-center justify-center rounded-[3.5rem] bg-brand-slate shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] after:absolute after:inset-0 after:rounded-[3.5rem] after:shadow-[inset_0_4px_8px_rgba(255,255,255,0.2),inset_0_-8px_16px_rgba(0,0,0,0.5)] before:content-[''] before:absolute before:inset-0 before:rounded-[3.5rem] before:bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.15),transparent_65%)]">
                <div className="absolute top-[10%] left-[10%] w-[40%] h-[25%] bg-gradient-to-br from-white/25 to-transparent rounded-full blur-[4px] pointer-events-none z-20"></div>
                
                {currentLogo ? (
                  <div 
                    className="logo-svg-container w-24 h-24 md:w-32 md:h-32 relative z-10 flex items-center justify-center overflow-hidden"
                    style={{ color: '#FACC15' }}
                    dangerouslySetInnerHTML={{ __html: currentLogo }}
                  />
                ) : (
                   <div className="text-slate-700 font-black text-xs uppercase tracking-widest relative z-10">No Logo</div>
                )}
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  <strong className="text-brand-slate block mb-2 text-xs uppercase tracking-widest">Pro Tip</strong>
                  Use simple, single-color SVG paths for the best results. Our engine will adapt your branding to the Dubai dark-mode aesthetic.
                </p>
              </div>
              
              {currentLogo && (
                <button 
                  onClick={resetLogo}
                  className="w-full py-5 rounded-3xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 font-black text-xs uppercase tracking-widest transition-all"
                >
                  Remove Custom Logo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .logo-svg-container svg {
          width: 100%;
          height: 100%;
          display: block;
        }
      `}</style>
    </div>
  );
};