import { Fish } from 'lucide-react';

interface ScanningScreenProps {
  imageData: string;
}



export function ScanningScreen({ imageData }: ScanningScreenProps) {

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-6 mx-auto" style={{ maxWidth: '340px' }}>
          <img src={imageData} alt="Analyzing fish" className="w-full h-[340px] object-cover" />
          <div className="absolute inset-0 bg-slate-900/30" />

          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_2px_rgba(45,212,191,0.6)]"
            style={{ top: '50%' }}
          />

          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute border-2 border-teal-400/70 rounded-lg shadow-[0_0_8px_rgba(45,212,191,0.4)]"
              style={{
                top: '25%',
                left: '20%',
                width: '60%',
                height: '35%',
              }}
            >
              <div className="absolute -top-5 left-0 text-teal-400 text-[10px] font-mono font-bold tracking-wider bg-slate-900/80 px-1.5 py-0.5 rounded">
                BODY SHAPE
              </div>
            </div>
            <div
              className="absolute border-2 border-cyan-400/70 rounded-lg shadow-[0_0_8px_rgba(34,211,238,0.4)]"
              style={{
                top: '15%',
                left: '55%',
                width: '30%',
                height: '20%',
              }}
            >
              <div className="absolute -top-5 left-0 text-cyan-400 text-[10px] font-mono font-bold tracking-wider bg-slate-900/80 px-1.5 py-0.5 rounded">
                COLORATION
              </div>
            </div>
            <div
              className="absolute border-2 border-teal-300/70 rounded-lg shadow-[0_0_8px_rgba(94,234,212,0.4)]"
              style={{
                top: '60%',
                left: '10%',
                width: '40%',
                height: '25%',
              }}
            >
              <div className="absolute -top-5 left-0 text-teal-300 text-[10px] font-mono font-bold tracking-wider bg-slate-900/80 px-1.5 py-0.5 rounded">
                FIN TYPE
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Fish size={22} className="text-teal-400 animate-pulse" />
            <h2 className="text-white font-bold text-lg">Analyzing your fish...</h2>
          </div>
          <p className="text-slate-400 text-sm">AI is examining visual characteristics</p>
        </div>

        <p className="text-center text-slate-400 text-sm">Checking the photo and matching visible features…</p>
      </div>
    </div>
  );
}
