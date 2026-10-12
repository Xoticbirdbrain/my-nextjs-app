'use client';

import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';

export default function Home() {
  const [matchCount, setMatchCount] = useState<number>(3);
  const [displayRows, setDisplayRows] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(100);

  
  useEffect(() => {
    setVisibleCount(100);
  }, [matchCount]);

  const handleCalculate = async () => {
    if (loading) return;
    setLoading(true);
    
    const cacheKey = `matches-${matchCount}`;

    try {
      // 1. Device Level Cache Check: Look up in local IndexedDB
      const localCached = await get<string[]>(cacheKey);
      if (localCached) {
        setDisplayRows(localCached);
        setLoading(false);
        return;
      }

      // 2. Global Level Cache Check: Fetch the pre-computed static JSON asset
      const response = await fetch(`/combinations/matches-${matchCount}.json`);
      if (!response.ok) throw new Error('Static matrix asset fetch failed');
      
      const data = await response.json();

      // 3. Save to local device database so future requests use zero network bandwidth
      await set(cacheKey, data);
      setDisplayRows(data);
      
    } catch (error) {
      console.error("Error retrieving combination payload:", error);
    } finally {
      setLoading(false);
    }
  };

  // Safe progressive rendering scroll trigger
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 150) {
      if (visibleCount < displayRows.length) {
        setVisibleCount((prev) => Math.min(prev + 150, displayRows.length));
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans p-6 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <div className="flex flex-col items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md max-w-md w-full">
        <h2 className="text-xl font-bold">Soccer 10 Helper Basic V1.0</h2>
        
        <div className="flex items-center gap-3">
          <label htmlFor="matches" className="text-sm font-medium">Games:</label>
          <input
            id="matches"
            type="number"
            min="1"
            max="10" // Strict ceiling enforced
            value={matchCount}
            onChange={(e) => setMatchCount(Number(e.target.value))}
            className="w-16 px-2 py-1 border rounded bg-transparent border-zinc-300 dark:border-zinc-700 text-center"
          />
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Loading Cached Combinations...' : 'Generate Results'}
        </button>

        {displayRows.length > 0 && (
          <div className="mt-4 w-full border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <p className="text-xs text-zinc-500 mb-2 font-mono text-center">
              Showing {Math.min(visibleCount, displayRows.length)} of {displayRows.length} elements
            </p>

            <div 
              onScroll={handleScroll}
              className="flex flex-col w-full max-h-[60vh] overflow-y-auto px-2 scrollbar-thin"
            >
              {displayRows.slice(0, visibleCount).map((outcome, index) => {
                const isStartOfSet = index % matchCount === 0;

                return (
                  <div key={index} className="flex flex-col">
                    {isStartOfSet && index !== 0 && (
                      <div className="h-px bg-zinc-300 dark:bg-zinc-700 my-2 w-full" />
                    )}

                    <div 
                      className={`
                        w-full py-2 text-center text-sm font-bold uppercase tracking-wider rounded my-0.5
                        ${outcome === 'Win' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${outcome === 'Draw' ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' : ''}
                        ${outcome === 'Loss' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                      `}
                    >
                      {outcome}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
