import { Slot } from "expo-router";
import React from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AppFrame } from "@/components/app-frame";
import { AuthGate } from "@/components/auth-gate";
import { AuthProvider } from "@/context/auth";
import { ScannedPlantProvider } from "@/context/scanned-plant";

export default function TabLayout() {
  return (
    <AuthProvider>
      <AnimatedSplashOverlay />
      <AuthGate>
        <ScannedPlantProvider>
          <AppFrame>
            <Slot />
          </AppFrame>
        </ScannedPlantProvider>
      </AuthGate>
    </AuthProvider>
  );
}
