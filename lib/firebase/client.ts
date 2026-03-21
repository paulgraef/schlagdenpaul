"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getPublicFirebaseConfig } from "@/lib/firebase/env";

let firestore: ReturnType<typeof getFirestore> | null = null;

export function getFirebaseFirestore() {
  const config = getPublicFirebaseConfig();
  if (!config) {
    return null;
  }

  if (firestore) {
    return firestore;
  }

  const app = getApps().length ? getApp() : initializeApp(config);
  firestore = getFirestore(app);
  return firestore;
}
