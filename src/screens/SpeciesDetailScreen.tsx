import { useState } from 'react';
import {
  ArrowLeft,
  Fish,
  MapPin,
  Utensils,
  Waves,
  Shield,
  Info,
  Dna,
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
  Check,
} from 'lucide-react';
import type { FishSpecies } from '@/types';
import { getFishById } from '@/data/fishDatabase';
import { getConservationColor } from '@/services/aiAnalyzer';

interface SpeciesDetailScreenProps {
  speciesId: string;
  onBack: () => void;
  onSpeciesSelect: (speciesId: string) => void;
}

function DetailSection({
  icon: Icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: typeof Info;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 hover:bg-slate-50/50 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-teal-600" />
        </div>
        <span className="flex-1 text-left font-semibold text-slate-800 text-sm">{title}</span>
        {open ? (
          <ChevronUp size={18} className="text-slate-400" />
        ) : (
          <ChevronDown size={18} className="text-slate-400" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 text-sm text-slate-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

export function SpeciesDetailScreen({ speciesId, onBack, onSpeciesSelect }: SpeciesDetailScreenProps) {
  const fish = getFishById(speciesId);
  if (!fish) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Species not found</p>
      </div>
    );
  }

  const consColor = getConservationColor(fish.conservationStatus);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/20 to-white">
      <div className="max-w-md mx-auto pb-28">
        <div className="relative">
          <div className="relative h-72 overflow-hidden">
            <img src={fish.image} alt={fish.commonName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/20 to-slate-900/40" />
            <div className="absolute top-4 left-4">
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-700" />
              </button>
            </div>
          </div>

          <div className="relative -mt-16 px-4">
            <div className="bg-white rounded-3xl shadow-lg p-5 border border-slate-200/60">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-slate-800 leading-tight">{fish.filipinoName}</h1>
                  <p className="text-teal-600 font-semibold text-sm mt-0.5">{fish.commonName}</p>
                  <p className="text-slate-400 text-xs italic mt-0.5">{fish.scientificName}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shrink-0 shadow-md">
                  <Fish size={22} className="text-white" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                  {fish.category}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${consColor}`}>
                  <Shield size={10} className="inline mr-1" />
                  {fish.conservationStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mt-4 space-y-3">
          <DetailSection icon={Info} title="Description" defaultOpen={true}>
            <p>{fish.description}</p>
          </DetailSection>

          <DetailSection icon={Eye} title="Physical Characteristics" defaultOpen={true}>
            <div className="space-y-2.5">
              <div>
                <span className="font-medium text-slate-700">Body Shape: </span>
                <span>{fish.physicalCharacteristics.bodyShape}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Coloration: </span>
                <span>{fish.physicalCharacteristics.coloration}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Max Size: </span>
                <span>{fish.physicalCharacteristics.maxSize}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700 block mb-1.5">Distinctive Features:</span>
                <ul className="space-y-1">
                  {fish.physicalCharacteristics.distinctiveFeatures.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={15} className="text-teal-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DetailSection>

          <DetailSection icon={Waves} title="Habitat">
            <p>{fish.habitat}</p>
          </DetailSection>

          <DetailSection icon={Utensils} title="Diet">
            <p>{fish.diet}</p>
          </DetailSection>

          <DetailSection icon={MapPin} title="Distribution">
            <p>{fish.distribution}</p>
          </DetailSection>

          <DetailSection icon={Shield} title="Conservation Status">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1.5 rounded-xl text-sm font-bold border ${consColor}`}>
                {fish.conservationStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Based on IUCN Red List categorization. Always practice sustainable fishing and follow local regulations.
            </p>
          </DetailSection>

          <DetailSection icon={Layers} title="Similar Species">
            <div className="space-y-3">
              {fish.similarSpecies.map((similar, i) => (
                <div key={i} className="flex items-start gap-3">
                  <img
                    src={similar.image}
                    alt={similar.commonName}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-700 text-sm">{similar.filipinoName}</p>
                    <p className="text-xs text-slate-500">
                      {similar.commonName} · <span className="italic">{similar.scientificName}</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{similar.difference}</p>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>

          <DetailSection icon={Dna} title="Scientific Taxonomy">
            <div className="space-y-1.5">
              {[
                { rank: 'Kingdom', value: fish.taxonomy.kingdom },
                { rank: 'Phylum', value: fish.taxonomy.phylum },
                { rank: 'Class', value: fish.taxonomy.class },
                { rank: 'Order', value: fish.taxonomy.order },
                { rank: 'Family', value: fish.taxonomy.family },
                { rank: 'Genus', value: fish.taxonomy.genus },
                { rank: 'Species', value: fish.taxonomy.species },
              ].map((item) => (
                <div key={item.rank} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                  <span className="text-xs font-medium text-slate-500">{item.rank}</span>
                  <span className="text-sm text-slate-700 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
