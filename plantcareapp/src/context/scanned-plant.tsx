import React, { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import type { DraftPlant } from '@/components/plants/plant-types';

type ScannedPlantContextValue = {
  pendingDraft: DraftPlant | null;
  clearPendingDraft: () => void;
  setPendingDraft: (draft: DraftPlant) => void;
};

const ScannedPlantContext = createContext<ScannedPlantContextValue | null>(null);

export function ScannedPlantProvider({ children }: { children: ReactNode }) {
  const [pendingDraft, setPendingDraftState] = useState<DraftPlant | null>(null);
  const clearPendingDraft = useCallback(() => setPendingDraftState(null), []);
  const setPendingDraft = useCallback((draft: DraftPlant) => setPendingDraftState(draft), []);
  const value = useMemo(
    () => ({
      pendingDraft,
      clearPendingDraft,
      setPendingDraft,
    }),
    [clearPendingDraft, pendingDraft, setPendingDraft],
  );

  return (
    <ScannedPlantContext.Provider value={value}>
      {children}
    </ScannedPlantContext.Provider>
  );
}

export function useScannedPlant() {
  const context = useContext(ScannedPlantContext);

  if (!context) {
    throw new Error('useScannedPlant must be used inside ScannedPlantProvider');
  }

  return context;
}
