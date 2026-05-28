import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PlantCard } from '@/components/plants/plant-card';
import { PlantEditorModal } from '@/components/plants/plant-editor-modal';
import type { DraftPlant } from '@/components/plants/plant-types';
import { demoPlants, getNote } from '@/components/plants/plant-utils';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { createPlant, deletePlant, getPlants, updatePlant, waterPlant, type Plant } from '@/lib/api';

const undoWateringMs = 5000;

export function HomeScreen() {
  const { token } = useAuth();
  const [plants, setPlants] = useState<Plant[]>(demoPlants);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPlant, setEditingPlant] = useState<DraftPlant | null>(null);
  const [plantNotes, setPlantNotes] = useState<Record<number, string>>({});
  const undoTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const undoPlantsRef = useRef<Record<number, Plant>>({});

  useEffect(() => {
    if (!token) {
      return;
    }

    const authToken = token;
    let isMounted = true;

    async function loadPlants() {
      setIsLoading(true);

      try {
        const apiPlants = await getPlants(authToken);

        if (isMounted) {
          setPlants(apiPlants);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPlants();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(
    () => () => {
      Object.values(undoTimersRef.current).forEach(clearTimeout);
    },
    [],
  );

  function openPlant(plant: Plant) {
    setEditingPlant({
      id: plant.id,
      name: plant.name,
      note: plantNotes[plant.id] ?? getNote(plant),
      interval: plant.interval,
      imageUrl: plant.imageUrl ?? '',
    });
  }

  function openNewPlant() {
    setEditingPlant({
      name: 'My Plant #1',
      note: '',
      interval: 20,
      imageUrl: '',
    });
  }

  async function savePlant(draft: DraftPlant) {
    if (!draft.name.trim()) {
      return;
    }

    const imageUrl = draft.imageUrl?.trim() || null;

    if (draft.id) {
      setPlantNotes((currentNotes) => ({ ...currentNotes, [draft.id as number]: draft.note }));
    }

    if (token && draft.id && draft.id > 0) {
      const savedPlant = await updatePlant(token, draft.id, draft.name, draft.interval, imageUrl);
      setPlants((currentPlants) =>
        currentPlants.map((currentPlant) => (currentPlant.id === savedPlant.id ? savedPlant : currentPlant)),
      );
    } else if (token && !draft.id) {
      const newPlant = await createPlant(token, draft.name, draft.interval, imageUrl);
      setPlantNotes((currentNotes) => ({ ...currentNotes, [newPlant.id]: draft.note }));
      setPlants((currentPlants) => [newPlant, ...currentPlants.filter((plant) => plant.id > 0)]);
    } else {
      saveLocalPlant(draft, imageUrl);
    }

    setEditingPlant(null);
  }

  async function removePlant(draft: DraftPlant) {
    if (!draft.id) {
      setEditingPlant(null);
      return;
    }

    if (token && draft.id > 0) {
      await deletePlant(token, draft.id);
    }

    setPlantNotes((currentNotes) => {
      const nextNotes = { ...currentNotes };
      delete nextNotes[draft.id as number];
      return nextNotes;
    });
    setPlants((currentPlants) => currentPlants.filter((plant) => plant.id !== draft.id));
    setEditingPlant(null);
  }

  async function markWatered(plant: Plant) {
    const pendingTimer = undoTimersRef.current[plant.id];

    if (pendingTimer) {
      undoWatering(plant.id);
      return;
    }

    const previousPlant = plant;
    const wateredPlant = getOptimisticWateredPlant(plant);

    undoPlantsRef.current[plant.id] = previousPlant;
    setPlants((currentPlants) =>
      currentPlants.map((currentPlant) => (currentPlant.id === plant.id ? wateredPlant : currentPlant)),
    );

    undoTimersRef.current[plant.id] = setTimeout(async () => {
      delete undoTimersRef.current[plant.id];
      delete undoPlantsRef.current[plant.id];

      if (!token || plant.id <= 0) {
        return;
      }

      try {
        const savedPlant = await waterPlant(token, plant.id);
        setPlants((currentPlants) =>
          currentPlants.map((currentPlant) => (currentPlant.id === plant.id ? savedPlant : currentPlant)),
        );
      } catch {
        setPlants((currentPlants) =>
          currentPlants.map((currentPlant) => (currentPlant.id === plant.id ? previousPlant : currentPlant)),
        );
      }
    }, undoWateringMs);
  }

  function saveLocalPlant(draft: DraftPlant, imageUrl: string | null) {
    if (draft.id) {
      setPlants((currentPlants) =>
        currentPlants.map((plant) =>
          plant.id === draft.id ? { ...plant, name: draft.name, interval: draft.interval, imageUrl } : plant,
        ),
      );
      return;
    }

    const localId = -Date.now();
    setPlantNotes((currentNotes) => ({ ...currentNotes, [localId]: draft.note }));
    setPlants((currentPlants) => [
      {
        id: localId,
        name: draft.name,
        interval: draft.interval,
        imageUrl,
        lastWatered: new Date().toISOString(),
        nextWateringAt: new Date(Date.now() + draft.interval * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ok',
        userId: 0,
      },
      ...currentPlants,
    ]);
  }

  function undoWatering(plantId: number) {
    clearTimeout(undoTimersRef.current[plantId]);
    delete undoTimersRef.current[plantId];

    const previousPlant = undoPlantsRef.current[plantId];
    delete undoPlantsRef.current[plantId];

    if (previousPlant) {
      setPlants((currentPlants) =>
        currentPlants.map((currentPlant) => (currentPlant.id === plantId ? previousPlant : currentPlant)),
      );
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.plantsContent} showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>My Plants :</Text>
          {isLoading ? <ActivityIndicator color="#111111" size="small" /> : null}
        </View>

        <View style={styles.plantGrid}>
          {plants.map((plant) => (
            <PlantCard
              key={plant.id}
              onLongPress={() => openPlant(plant)}
              onPress={() => markWatered(plant)}
              plant={plant}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={openNewPlant}
          style={({ pressed }) => [styles.addPlantCard, pressed && styles.pressed]}>
          <Text style={styles.addPlantText}>+</Text>
        </Pressable>
      </ScrollView>

      <PlantEditorModal
        draft={editingPlant}
        onClose={() => setEditingPlant(null)}
        onDelete={removePlant}
        onSave={savePlant}
      />
    </View>
  );
}

function getOptimisticWateredPlant(plant: Plant): Plant {
  return {
    ...plant,
    lastWatered: new Date().toISOString(),
    nextWateringAt: new Date(Date.now() + plant.interval * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ok',
  };
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  plantsContent: {
    paddingBottom: 150,
    paddingHorizontal: 32,
    paddingTop: 112,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 27,
  },
  screenTitle: {
    color: '#000000',
    fontFamily: Fonts.mono,
    fontSize: 22,
    letterSpacing: 0,
  },
  plantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  addPlantCard: {
    alignItems: 'center',
    borderColor: '#a9a9a9',
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 67,
    justifyContent: 'center',
    marginTop: 13,
    width: '100%',
  },
  addPlantText: {
    color: '#a0a0a0',
    fontFamily: Fonts.mono,
    fontSize: 25,
  },
  pressed: {
    opacity: 0.72,
  },
});
