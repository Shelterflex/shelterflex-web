/** Short vibration on tap where supported (Android). No-op elsewhere. */
export function tapHaptic() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(8)
    }
  } catch {
    // vibration is a nicety, never an error
  }
}
