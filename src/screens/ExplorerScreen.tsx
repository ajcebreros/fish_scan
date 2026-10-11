import { useState, useMemo } from 'react';
import { Search, Filter, X, Fish } from 'lucide-react';
import { FISH_DATABASE } from '@/data/fishDatabase';
import type { FishCategory } from '@/types';

interface ExplorerScreenProps {
  onSpeciesSelect: (speciesId: string) => void;
}

const CATEGORIES: (FishCategory | 'All')[] = [
  'All',
  'Reef Fish',
  'Pelagic',
  'Freshwater',
  'Demersal',
  'Cartilaginous',
];

const CONSERVATION_FILTERS = [
  'Least Concern',
  'Near Threatened',
  'Vulnerable',
  'Endangered',
] as const;

export function ExplorerScreen({ onSpeciesSelect }: ExplorerScreenProps) {
  const availableSpecies = FISH_DATABASE;
  const availableCategories: Array<FishCategory | 'All'> = useMemo(
    () => ['All', ...Array.from(new Set(availableSpecies.map((fish) => fish.category)))],
    [availableSpecies]
  );
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FishCategory | 'All'>('All');
  const [conservationFilter, setConservationFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return availableSpecies.filter((fish) => {
      const matchesSearch =
        search === '' ||
        fish.commonName.toLowerCase().includes(search.toLowerCase()) ||
        fish.filipinoName.toLowerCase().includes(search.toLowerCase()) ||
        fish.scientificName.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === 'All' || fish.category === category;
      const matchesConservation =
        !conservationFilter || fish.conservationStatus === conservationFilter;

      return matchesSearch && matchesCategory && matchesConservation;
    });
  }, [search, category, conservationFilter]);

  const activeFilterCount =
    (category !== 'All' ? 1 : 0) + (conservationFilter ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/20 to-white">
      <div className="max-w-md mx-auto px-4 pt-6 pb-28">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Species Explorer</h2>

        <div className="relative mb-3">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or scientific name..."
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Filter size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 text-xs font-bold bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setCategory('All');
                setConservationFilter(null);
              }}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              <X size={14} />
              Reset
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mb-4 p-4 bg-white rounded-2xl border border-slate-200/80 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      category === cat
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Conservation Status</p>
              <div className="flex flex-wrap gap-2">
                {CONSERVATION_FILTERS.map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setConservationFilter(conservationFilter === status ? null : status)
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      conservationFilter === status
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 mb-3">
          {filtered.length} {filtered.length === 1 ? 'species' : 'species'} found
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Fish size={28} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">No species match your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((fish) => (
              <button
                key={fish.id}
                onClick={() => onSpeciesSelect(fish.id)}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-200 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <img
                    src={fish.image}
                    alt={fish.commonName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm truncate">{fish.commonName}</h3>
                  <p className="text-xs text-teal-600 font-medium">{fish.filipinoName}</p>
                  <p className="text-xs text-slate-400 italic truncate">{fish.scientificName}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {fish.category}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
