import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  type GestureResponderEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Fonts } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import {
  createPlant,
  deletePlant,
  getPlants,
  updatePlant,
  waterPlant,
  type Plant,
} from "@/lib/api";

type ScreenName = "plants" | "scan" | "settings";
type DraftPlant = {
  id?: number;
  name: string;
  note: string;
  interval: number;
};

const accentColor = "#00d47a";
const waterBlue = "#00bfff";
const modalWidth = 350;
const sliderWidth = 255;
const undoWateringMs = 5000;

const demoPlants: Plant[] = [
  {
    id: -1,
    name: "Prince's Rose",
    interval: 3,
    lastWatered: new Date().toISOString(),
    nextWateringAt: new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: "ok",
    userId: 0,
  },
  {
    id: -2,
    name: "Living room Bonsai",
    interval: 5,
    lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextWateringAt: new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: "ok",
    userId: 0,
  },
  {
    id: -3,
    name: "Living room Bonsai",
    interval: 1,
    lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextWateringAt: new Date(
      Date.now() - 1 * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: "needs_watering",
    userId: 0,
  },
];

function daysAgoLabel(dateValue: string) {
  const date = new Date(dateValue).getTime();
  const diff = Math.max(
    0,
    Math.floor((Date.now() - date) / (24 * 60 * 60 * 1000))
  );

  if (diff === 0) {
    return "Watered: Today";
  }

  return `Watered: ${diff} days ago`;
}

function getNote(plant: Plant) {
  if (plant.name === "Living room Bonsai") {
    return "Bonsai requires a lot of water and lots of sunlight. Buy special soil.";
  }

  return "";
}

function getWaterLevel(plant: Plant) {
  const wateredAt = new Date(plant.lastWatered).getTime();
  const elapsedDays = Math.max(
    0,
    (Date.now() - wateredAt) / (24 * 60 * 60 * 1000)
  );
  const remainingRatio = 1 - elapsedDays / plant.interval;

  return Math.max(0.06, Math.min(1, remainingRatio));
}

export function MainAppShell() {
  const [activeScreen, setActiveScreen] = useState<ScreenName>("plants");
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.appRoot}>
      {activeScreen === "plants" ? (
        <PlantsScreen />
      ) : (
        <PlaceholderScreen title={activeScreen} />
      )}
      <BottomNav
        activeScreen={activeScreen}
        bottomInset={insets.bottom}
        onChange={setActiveScreen}
      />
    </View>
  );
}

function PlantsScreen() {
  const { token } = useAuth();
  const [plants, setPlants] = useState<Plant[]>(demoPlants);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPlant, setEditingPlant] = useState<DraftPlant | null>(null);
  const [plantNotes, setPlantNotes] = useState<Record<number, string>>({});
  const undoTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>(
    {}
  );
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

        if (isMounted && apiPlants.length > 0) {
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
    []
  );

  async function markWatered(plant: Plant) {
    const pendingTimer = undoTimersRef.current[plant.id];

    if (pendingTimer) {
      clearTimeout(pendingTimer);
      delete undoTimersRef.current[plant.id];

      const previousPlant = undoPlantsRef.current[plant.id];
      delete undoPlantsRef.current[plant.id];

      if (previousPlant) {
        setPlants((currentPlants) =>
          currentPlants.map((currentPlant) =>
            currentPlant.id === plant.id ? previousPlant : currentPlant
          )
        );
      }

      return;
    }

    const previousPlant = plant;
    const wateredPlant: Plant = {
      ...plant,
      lastWatered: new Date().toISOString(),
      nextWateringAt: new Date(
        Date.now() + plant.interval * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: "ok",
    };

    undoPlantsRef.current[plant.id] = previousPlant;
    setPlants((currentPlants) =>
      currentPlants.map((currentPlant) =>
        currentPlant.id === plant.id ? wateredPlant : currentPlant
      )
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
          currentPlants.map((currentPlant) =>
            currentPlant.id === plant.id ? savedPlant : currentPlant
          )
        );
      } catch {
        setPlants((currentPlants) =>
          currentPlants.map((currentPlant) =>
            currentPlant.id === plant.id ? previousPlant : currentPlant
          )
        );
      }
    }, undoWateringMs);
  }

  function openPlant(plant: Plant) {
    setEditingPlant({
      id: plant.id,
      name: plant.name,
      note: plantNotes[plant.id] ?? getNote(plant),
      interval: plant.interval,
    });
  }

  function openNewPlant() {
    setEditingPlant({
      name: "My Plant #1",
      note: "",
      interval: 20,
    });
  }

  async function savePlant(draft: DraftPlant) {
    if (!draft.name.trim()) {
      return;
    }

    if (draft.id) {
      setPlantNotes((currentNotes) => ({
        ...currentNotes,
        [draft.id as number]: draft.note,
      }));
    }

    if (token && draft.id && draft.id > 0) {
      const savedPlant = await updatePlant(
        token,
        draft.id,
        draft.name,
        draft.interval
      );
      setPlants((currentPlants) =>
        currentPlants.map((currentPlant) =>
          currentPlant.id === savedPlant.id ? savedPlant : currentPlant
        )
      );
    } else if (token && !draft.id) {
      const newPlant = await createPlant(token, draft.name, draft.interval);
      setPlantNotes((currentNotes) => ({
        ...currentNotes,
        [newPlant.id]: draft.note,
      }));
      setPlants((currentPlants) => [
        newPlant,
        ...currentPlants.filter((plant) => plant.id > 0),
      ]);
    } else if (draft.id) {
      setPlants((currentPlants) =>
        currentPlants.map((plant) =>
          plant.id === draft.id
            ? {
                ...plant,
                name: draft.name,
                interval: draft.interval,
              }
            : plant
        )
      );
    } else {
      const localId = -Date.now();
      setPlantNotes((currentNotes) => ({
        ...currentNotes,
        [localId]: draft.note,
      }));
      setPlants((currentPlants) => [
        {
          id: localId,
          name: draft.name,
          interval: draft.interval,
          lastWatered: new Date().toISOString(),
          nextWateringAt: new Date(
            Date.now() + draft.interval * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "ok",
          userId: 0,
        },
        ...currentPlants,
      ]);
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
    setPlants((currentPlants) =>
      currentPlants.filter((plant) => plant.id !== draft.id)
    );
    setEditingPlant(null);
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.plantsContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>My Plants :</Text>
          {isLoading ? (
            <ActivityIndicator color="#111111" size="small" />
          ) : null}
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
          style={({ pressed }) => [
            styles.addPlantCard,
            pressed && styles.pressed,
          ]}
        >
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

function PlantCard({
  onLongPress,
  onPress,
  plant,
}: {
  onLongPress: () => void;
  onPress: () => void;
  plant: Plant;
}) {
  const isThirsty = plant.status === "needs_watering";
  const statusLabel = isThirsty ? "Thirsty" : daysAgoLabel(plant.lastWatered);
  const progress = getWaterLevel(plant);

  return (
    <View style={styles.cardWrap}>
      <Text numberOfLines={1} style={styles.cardTitle}>
        {plant.name}
      </Text>
      <Pressable
        accessibilityRole="button"
        delayLongPress={360}
        onLongPress={onLongPress}
        onPress={onPress}
        style={({ pressed }) => [
          styles.plantCard,
          pressed && styles.cardPressed,
        ]}
      >
        <Text style={styles.cornerDot}>•</Text>
        <View style={styles.imagePlaceholder}>
          <Feather color="#b8b8b8" name="image" size={18} />
        </View>
        <View style={styles.waterColumn}>
          <Feather color={waterBlue} name="droplet" size={16} />
          <View style={styles.waterTrack}>
            <View
              style={[
                styles.waterLevel,
                { height: `${Math.round(progress * 100)}%` },
              ]}
            />
          </View>
        </View>
        <Text
          style={[
            styles.cardStatus,
            isThirsty ? styles.thirstyText : styles.wateredText,
          ]}
        >
          {statusLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function PlantEditorModal({
  draft,
  onClose,
  onDelete,
  onSave,
}: {
  draft: DraftPlant | null;
  onClose: () => void;
  onDelete: (draft: DraftPlant) => void;
  onSave: (draft: DraftPlant) => void;
}) {
  const [localDraft, setLocalDraft] = useState<DraftPlant | null>(draft);

  useEffect(() => {
    setLocalDraft(draft);
  }, [draft]);

  if (!localDraft) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={Boolean(draft)}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard}>
          <Text style={styles.modalDot}>•</Text>
          <TextInput
            onChangeText={(name) =>
              setLocalDraft((current) =>
                current ? { ...current, name } : current
              )
            }
            style={[
              styles.modalTitle,
              Platform.OS === "web" && styles.webInputNoOutline,
            ]}
            value={localDraft.name}
          />
          <View style={styles.modalMainRow}>
            <Pressable style={styles.modalImageBox}>
              <Feather color="#b8b8b8" name="image" size={21} />
            </Pressable>
            <View style={styles.noteColumn}>
              <Text style={styles.noteLabel}>Note:</Text>
              <TextInput
                multiline
                onChangeText={(note) =>
                  setLocalDraft((current) =>
                    current ? { ...current, note } : current
                  )
                }
                placeholder="Add note"
                placeholderTextColor="#b8b8b8"
                style={[
                  styles.noteInput,
                  Platform.OS === "web" && styles.webInputNoOutline,
                ]}
                textAlignVertical="top"
                value={localDraft.note}
              />
            </View>
          </View>

          <View style={styles.sliderRow}>
            <Feather color={waterBlue} name="droplet" size={28} />
            <IntervalSlider
              interval={localDraft.interval}
              onChange={(interval) =>
                setLocalDraft((current) =>
                  current ? { ...current, interval } : current
                )
              }
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSave(localDraft)}
              style={({ pressed }) => [
                styles.checkButton,
                pressed && styles.pressed,
              ]}
            >
              <Feather color={accentColor} name="check" size={42} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onDelete(localDraft)}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.pressed,
              ]}
            >
              <Feather color="#666666" name="trash-2" size={18} />
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function IntervalSlider({
  interval,
  onChange,
}: {
  interval: number;
  onChange: (value: number) => void;
}) {
  const percent = (interval - 1) / 29;

  function updateFromTouch(event: GestureResponderEvent) {
    const x = Math.max(0, Math.min(sliderWidth, event.nativeEvent.locationX));
    const nextValue = Math.round(1 + (x / sliderWidth) * 29);

    onChange(Math.min(30, Math.max(1, nextValue)));
  }

  return (
    <View
      onResponderGrant={updateFromTouch}
      onResponderMove={updateFromTouch}
      onStartShouldSetResponder={() => true}
      style={styles.slider}
    >
      <View style={styles.sliderTrack}>
        <View
          style={[
            styles.sliderFill,
            { width: `${Math.round(percent * 100)}%` },
          ]}
        />
      </View>
      <View
        style={[
          styles.sliderBadge,
          {
            left: Math.max(
              0,
              Math.min(sliderWidth - 56, percent * sliderWidth - 28)
            ),
          },
        ]}
      >
        <Text style={styles.sliderBadgeText}>{interval} days</Text>
      </View>
    </View>
  );
}

function BottomNav({
  activeScreen,
  bottomInset,
  onChange,
}: {
  activeScreen: ScreenName;
  bottomInset: number;
  onChange: (screen: ScreenName) => void;
}) {
  const items: { icon: keyof typeof Feather.glyphMap; screen: ScreenName }[] = [
    { icon: "home", screen: "plants" },
    { icon: "maximize", screen: "scan" },
    { icon: "settings", screen: "settings" },
  ];

  return (
    <View
      style={[styles.navContainer, { bottom: Math.max(22, bottomInset + 16) }]}
    >
      {items.map((item) => {
        const isActive = item.screen === activeScreen;

        return (
          <Pressable
            accessibilityRole="button"
            key={item.screen}
            onPress={() => onChange(item.screen)}
            style={({ pressed }) => [
              styles.navButton,
              isActive && styles.navButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Feather
              color={isActive ? accentColor : "#646464"}
              name={item.icon}
              size={24}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

function PlaceholderScreen({ title }: { title: string }) {
  const { logout } = useAuth();

  return (
    <View style={styles.placeholderScreen}>
      <Text style={styles.screenTitle}>
        {title === "scan" ? "Scan :" : "Settings :"}
      </Text>
      {title === "settings" ? (
        <Pressable
          onPress={logout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const webInputNoOutline = { outlineStyle: "none" } as never;

const styles = StyleSheet.create({
  appRoot: {
    backgroundColor: "#ffffff",
    flex: 1,
  },
  screen: {
    backgroundColor: "#ffffff",
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
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 27,
  },
  screenTitle: {
    color: "#000000",
    fontFamily: Fonts.mono,
    fontSize: 22,
    letterSpacing: 0,
  },
  plantGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "space-between",
  },
  cardWrap: {
    maxWidth: 191,
    minWidth: 150,
    width: "47.8%",
  },
  cardTitle: {
    color: "#000000",
    fontFamily: Fonts.mono,
    fontSize: 13,
    marginBottom: 3,
    paddingLeft: 14,
  },
  plantCard: {
    borderColor: "#969696",
    borderRadius: 15,
    borderWidth: 1,
    height: 190,
    padding: 12,
    position: "relative",
  },
  cardPressed: {
    backgroundColor: "#f7f7f7",
  },
  cornerDot: {
    color: "#777777",
    fontFamily: Fonts.mono,
    fontSize: 18,
    left: 10,
    lineHeight: 18,
    position: "absolute",
    top: 2,
  },
  imagePlaceholder: {
    alignItems: "center",
    borderColor: "#d0d0d0",
    borderRadius: 4,
    borderWidth: 1,
    height: 128,
    justifyContent: "center",
    marginLeft: 2,
    marginTop: 9,
    width: "82%",
  },
  waterColumn: {
    alignItems: "center",
    position: "absolute",
    right: 10,
    top: 20,
  },
  waterTrack: {
    backgroundColor: "#d5f8ff",
    borderRadius: 12,
    height: 100,
    justifyContent: "flex-end",
    marginTop: 10,
    overflow: "hidden",
    width: 10,
  },
  waterLevel: {
    backgroundColor: "#29d9ff",
    borderRadius: 12,
    width: "100%",
  },
  cardStatus: {
    bottom: 12,
    fontFamily: Fonts.mono,
    fontSize: 13,
    left: 0,
    position: "absolute",
    right: 0,
    textAlign: "center",
  },
  wateredText: {
    color: accentColor,
  },
  thirstyText: {
    color: "#ff0000",
    fontSize: 16,
  },
  addPlantCard: {
    alignItems: "center",
    borderColor: "#a9a9a9",
    borderRadius: 14,
    borderStyle: "dashed",
    borderWidth: 1,
    height: 67,
    justifyContent: "center",
    marginTop: 13,
    width: "100%",
  },
  addPlantText: {
    color: "#a0a0a0",
    fontFamily: Fonts.mono,
    fontSize: 25,
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.16)",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    minHeight: 326,
    paddingHorizontal: 18,
    paddingTop: 11,
    shadowColor: "#6f777b",
    shadowOffset: { width: 3, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    width: modalWidth,
    elevation: 10,
  },
  modalDot: {
    color: "#777777",
    fontFamily: Fonts.mono,
    fontSize: 30,
    left: 14,
    lineHeight: 28,
    position: "absolute",
    top: 4,
  },
  modalTitle: {
    color: "#000000",
    fontFamily: Fonts.mono,
    fontSize: 17,
    height: 30,
    marginBottom: 4,
    padding: 0,
    textAlign: "center",
  },
  modalMainRow: {
    flexDirection: "row",
    gap: 17,
  },
  modalImageBox: {
    alignItems: "center",
    borderColor: "#b9b9b9",
    borderRadius: 4,
    borderStyle: "dashed",
    borderWidth: 1,
    height: 127,
    justifyContent: "center",
    width: 184,
  },
  noteColumn: {
    flex: 1,
  },
  noteLabel: {
    color: "#000000",
    fontFamily: Fonts.mono,
    fontSize: 14,
    marginBottom: 7,
  },
  noteInput: {
    borderColor: "#b9b9b9",
    borderRadius: 4,
    borderStyle: "dashed",
    borderWidth: 1,
    color: "#555555",
    flex: 1,
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 17,
    minHeight: 111,
    padding: 10,
  },
  webInputNoOutline,
  sliderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    marginTop: 35,
  },
  slider: {
    height: 32,
    justifyContent: "center",
    width: sliderWidth,
  },
  sliderTrack: {
    backgroundColor: "#ededed",
    borderRadius: 12,
    height: 16,
    overflow: "hidden",
  },
  sliderFill: {
    backgroundColor: "#bcefff",
    height: "100%",
  },
  sliderBadge: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 9,
    height: 19,
    justifyContent: "center",
    minWidth: 56,
    position: "absolute",
    shadowColor: "#8b8b8b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    top: 7,
    elevation: 3,
  },
  sliderBadgeText: {
    color: "#777777",
    fontFamily: Fonts.mono,
    fontSize: 11,
  },
  modalActions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 31,
  },
  checkButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  deleteButton: {
    bottom: 1,
    padding: 8,
    position: "absolute",
    right: -4,
  },
  navContainer: {
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e6e6e6",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    height: 43,
    justifyContent: "center",
    paddingHorizontal: 14,
    position: "absolute",
    shadowColor: "#626a70",
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 9,
  },
  navButton: {
    alignItems: "center",
    borderRadius: 15,
    height: 31,
    justifyContent: "center",
    width: 36,
  },
  navButtonActive: {
    backgroundColor: "#f6fffa",
  },
  placeholderScreen: {
    backgroundColor: "#ffffff",
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 112,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#eeeeee",
    borderRadius: 22,
    borderWidth: 1,
    height: 45,
    justifyContent: "center",
    marginTop: 35,
    shadowColor: "#6f777b",
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 7,
    width: 150,
    elevation: 7,
  },
  logoutText: {
    color: accentColor,
    fontFamily: Fonts.mono,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.72,
  },
});
