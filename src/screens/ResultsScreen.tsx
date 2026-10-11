import { useState } from 'react';
import {
  ArrowLeft,
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
  AlertTriangle,
  Clock,
  Check,
  Ruler,
  ExternalLink,
} from 'lucide-react';
import type { ScanResult } from '@/types';
import { getConservationColor } from '@/services/aiAnalyzer';

interface ResultsScreenProps {
  result: ScanResult;
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

export function ResultsScreen({ result, onBack, onSpeciesSelect }: ResultsScreenProps) {
  const fish = result.primaryMatch;
  const consColor = getConservationColor(fish.conservationStatus);
  const estimatedLength = result.estimatedLengthCm ?? 0;
  const estimatedStandardLength = estimatedLength > 0 ? estimatedLength * 0.817 : null;
  const localNames = fish.localNames?.join(', ') || fish.filipinoName;
  const fishBaseUrl = `https://www.fishbase.se/summary/${fish.scientificName.replace(/\s+/g, '-')}.html`;
  const bfarSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `site:bfar.da.gov.ph ${fish.scientificName}`
  )}`;
  const faoSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `site:fao.org ${fish.scientificName}`
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/20 to-white">
      <div className="max-w-md mx-auto pb-28">
        <div className="relative">
          <div className="relative h-72 overflow-hidden">
            <img src={result.imageData} alt="Scanned fish" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/20 to-slate-900/40" />
            <div className="absolute top-4 left-4">
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-700" />
              </button>
            </div>
            {result.isUncertain && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-amber-500/95 backdrop-blur px-3 py-1.5 rounded-full shadow-md">
                <AlertTriangle size={14} className="text-white" />
                <span className="text-white text-xs font-bold">Uncertain</span>
              </div>
            )}
          </div>

          <div className="relative -mt-16 px-4">
            <div className="space-y-3">
              <section className="bg-white rounded-3xl shadow-lg p-5 border border-slate-200/60">
                <h2 className="text-xs font-bold tracking-[0.14em] text-teal-700 mb-4">
                  SPECIES IDENTIFICATION
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-slate-500">English Name</span>
                    <span className="text-sm font-semibold text-slate-800 text-right">{fish.commonName}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-slate-500">Scientific Name</span>
                    <span className="text-sm font-medium italic text-slate-700 text-right">{fish.scientificName}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-slate-500">Local Name</span>
                    <span className="text-sm font-medium text-slate-700 text-right">{localNames}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-slate-500">Confidence</span>
                    <span className="text-sm font-bold text-teal-700">{result.confidence}%</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                    {fish.category}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${consColor}`}>
                    <Shield size={10} className="inline mr-1" />
                    {fish.conservationStatus}
                  </span>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200/80 p-4">
                <h2 className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-teal-700 mb-4">
                  <Ruler size={16} />
                  LENGTH ESTIMATION
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-slate-500">Total Length</span>
                    <span className="text-sm font-bold text-slate-800">
                      {estimatedLength > 0 ? `${estimatedLength.toFixed(1)} cm` : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-slate-500">Standard Length (est.)</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {estimatedStandardLength !== null
                        ? `${estimatedStandardLength.toFixed(1)} cm`
                        : 'Unavailable'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-3">
                  Standard length is an approximate estimate from total length.
                </p>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200/80 p-4">
                <h2 className="text-xs font-bold tracking-[0.14em] text-teal-700 mb-3">
                  SPECIES REFERENCE
                </h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'FishBase', href: fishBaseUrl },
                    { label: 'BFAR', href: bfarSearchUrl },
                    { label: 'FAO', href: faoSearchUrl },
                  ].map((reference) => (
                    <a
                      key={reference.label}
                      href={reference.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100"
                    >
                      {reference.label}
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  BFAR and FAO links search their published resources for this species.
                </p>
              </section>
            </div>
          </div>
        </div>

        <div className="px-4 mt-4 space-y-3">
          {result.isUncertain && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <h3 className="font-bold text-amber-800 text-sm">Multiple Possible Species</h3>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed mb-3">
                The image is unclear, so we can't be certain. Here are the most likely matches:
              </p>
              <div className="space-y-2">
                {result.possibleMatches.map((match, i) => (
                  <button
                    key={i}
                    onClick={() => onSpeciesSelect(match.species.id)}
                    className="w-full flex items-center gap-3 p-2.5 bg-white rounded-xl border border-amber-100 hover:border-amber-300 transition-colors"
                  >
                    <img
                      src={match.species.image}
                      alt={match.species.commonName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-slate-800 text-sm">{match.species.commonName}</p>
                      <p className="text-xs text-slate-500">{match.species.filipinoName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-600">{match.confidence}%</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                      <p className="font-semibold text-slate-700 text-sm">{similar.commonName}</p>
                      <p className="text-xs text-slate-500">
                        {similar.filipinoName} · <span className="italic">{similar.scientificName}</span>
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

          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-100 p-4">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Eye size={16} className="text-teal-600" />
              Why We Identified This Fish
            </h3>
            <div className="space-y-3">
              {result.identificationClues.map((clue, i) => (
                <div key={i} className="bg-white rounded-xl p-3 border border-teal-100/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-800">{clue.feature}</span>
                    <span className="text-xs font-bold text-teal-600">{clue.confidence}%</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{clue.description}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-500"
                      style={{ width: `${clue.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2 pb-4">
            <Clock size={12} />
            <span>
              Scanned on {new Date(result.timestamp).toLocaleDateString('en-PH', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
