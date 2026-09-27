import { SpotlightEventMap } from '../types/spotlight.types.js';

type Listener = (data: any) => void;

export class EventEmitter {
  private listeners: Map<string, Set<Listener>> = new Map();

  on<K extends keyof SpotlightEventMap>(event: K, handler: (data: SpotlightEventMap[K]) => void): () => void {
    const key = event as string;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    const set = this.listeners.get(key)!;
    set.add(handler as Listener);
    return () => this.off(event, handler);
  }

  off<K extends keyof SpotlightEventMap>(event: K, handler: (data: SpotlightEventMap[K]) => void): void {
    const key = event as string;
    const set = this.listeners.get(key);
    if (!set) return;
    set.delete(handler as Listener);
    if (set.size === 0) {
      this.listeners.delete(key);
    }
  }

  emit<K extends keyof SpotlightEventMap>(event: K, data: SpotlightEventMap[K]): void {
    const key = event as string;
    const set = this.listeners.get(key);
    if (!set || set.size === 0) return;
    set.forEach((handler) => {
      try {
        handler(data);
      } catch (err) {
        console.error(`[Spotlight.js] Error in event listener for "${key}":`, err);
      }
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}
