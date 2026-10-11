import { Upload, Camera, Fish, Sparkles, Waves } from 'lucide-react';
import type { Screen } from '@/types';
import { FISH_DATABASE } from '@/data/fishDatabase';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  onUpload: () => void;
  onCamera: () => void;
}

export function HomeScreen({ onNavigate, onUpload, onCamera }: HomeScreenProps) {
  const fishCount = FISH_DATABASE.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/30 to-white">
      <div className="max-w-md mx-auto px-4 pt-8 pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-teal-900 p-6 shadow-xl mb-6">
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-teal-500/20 blur-2xl" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-cyan-500/15 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
                <Fish size={20} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                FishLens AI
              </span>
            </div>
            <h1 className="text-white text-2xl font-bold leading-tight mb-2">
              Identify Philippine Fish in Seconds
            </h1>
            <p className="text-cyan-100/80 text-sm leading-relaxed mb-5">
              Snap a photo or upload an image to instantly identify fish found in Philippine waters — from Bangus to Butanding.
            </p>
            <div className="flex items-center gap-1.5 text-cyan-200/70 text-xs">
              <Sparkles size={14} />
              <span>AI-powered identification with detailed species data</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
          <button
            onClick={onUpload}
            className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:border-teal-300 transition-all active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Upload size={26} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800 text-base">Upload Fish Photo</h3>
              <p className="text-sm text-slate-500">Choose from your gallery</p>
            </div>
          </button>

          <button
            onClick={onCamera}
            className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:border-teal-300 transition-all active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Camera size={26} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800 text-base">Use Camera</h3>
              <p className="text-sm text-slate-500">Take a photo to identify</p>
            </div>
          </button>
        </div>

        <button
          onClick={() => onNavigate('explorer')}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border border-teal-200/60 hover:shadow-sm transition-all mb-6"
        >
          <div className="flex items-center gap-3">
            <Waves size={22} className="text-teal-600" />
            <div className="text-left">
              <h3 className="font-bold text-slate-800 text-sm">Species Explorer</h3>
              <p className="text-xs text-slate-500">Browse {fishCount} Philippine fish species</p>
            </div>
          </div>
          <span className="text-teal-600 text-xs font-semibold">Explore →</span>
        </button>

        <div className="rounded-2xl overflow-hidden relative h-40 shadow-md mb-6">
          <img
            src="https://images.pexels.com/photos/13377561/pexels-photo-13377561.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Coral reef"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4">
            <p className="text-white text-sm font-semibold leading-tight">
              The Philippines is one of the world's most biodiverse marine ecosystems
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Species', value: '12+' },
            { label: 'Accuracy', value: 'AI' },
            { label: 'Offline', value: 'Yes' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 bg-white rounded-xl border border-slate-200/60">
              <p className="text-lg font-bold text-teal-600">{stat.value}</p>
              <p className="text-[11px] text-slate-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
