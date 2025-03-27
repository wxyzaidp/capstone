import EventEmitter from 'events';

// Door timer events enum
export enum DoorTimerEvents {
  DOOR_UNLOCKED = 'DOOR_UNLOCKED',
  DOOR_LOCKED = 'DOOR_LOCKED',
}

// Event handler type
type EventHandler = (data: any) => void;

// Event subscription map type
interface EventSubscriptions {
  [eventName: string]: EventHandler[];
}

/**
 * Service for managing door unlock/lock timers and emitting events
 */
class DoorTimerService extends EventEmitter {
  private static instance: DoorTimerService;
  private eventSubscriptions: {
    [key in DoorTimerEvents]: Array<(data: any) => void>;
  } = {
    [DoorTimerEvents.DOOR_UNLOCKED]: [],
    [DoorTimerEvents.DOOR_LOCKED]: [],
  };
  // Use number for timeout IDs instead of NodeJS.Timeout for better compatibility
  private doorTimers: { [doorId: string]: number } = {};
  // Track unlocked doors
  private unlockedDoors: Map<string, {
    unlockTime: number;
    timerId: NodeJS.Timeout;
  }> = new Map();
  
  // Default auto-lock time in milliseconds (30 seconds)
  private autoLockTime = 30000;
  private readonly unlockDuration: number = 60000; // 60 seconds in milliseconds

  // Private constructor for singleton pattern
  private constructor() {
    super(); // Initialize EventEmitter
    
    this.eventSubscriptions = {
      [DoorTimerEvents.DOOR_UNLOCKED]: [],
      [DoorTimerEvents.DOOR_LOCKED]: [],
    };
  }

  // Get the singleton instance
  public static getInstance(): DoorTimerService {
    if (!DoorTimerService.instance) {
      DoorTimerService.instance = new DoorTimerService();
    }
    return DoorTimerService.instance;
  }

  /**
   * Unlock a door and set a timer to automatically lock it after the configured time
   * @param doorId The ID of the door to unlock
   */
  public unlockDoor(doorId: string): void {
    // If door is already unlocked, clear existing timer
    if (this.unlockedDoors.has(doorId)) {
      const existingTimer = this.unlockedDoors.get(doorId).timerId;
      clearTimeout(existingTimer);
      console.log(`[DoorTimerService] Door ${doorId} was already unlocked, clearing existing timer`);
    }

    // Set up auto-lock timer
    const timerId = setTimeout(() => {
      this.lockDoor(doorId);
      console.log(`[DoorTimerService] Auto-locking door ${doorId} after timeout`);
    }, this.unlockDuration);

    // Add door to unlocked doors with timestamp
    this.unlockedDoors.set(doorId, { 
      unlockTime: Date.now(),
      timerId 
    });
    
    console.log(`[DoorTimerService] Unlocked door ${doorId}, timer set for ${this.unlockDuration/1000}s`);

    // Emit event
    this.emitEvent(DoorTimerEvents.DOOR_UNLOCKED, doorId);
  }

  /**
   * Lock a door
   * @param doorId The ID of the door to lock
   */
  public lockDoor(doorId: string): void {
    // Only proceed if door is currently unlocked
    if (this.unlockedDoors.has(doorId)) {
      // Clear the auto-lock timer
      const { timerId } = this.unlockedDoors.get(doorId);
      clearTimeout(timerId);
      
      // Remove door from unlocked doors
      this.unlockedDoors.delete(doorId);
      
      console.log(`[DoorTimerService] Locked door ${doorId}`);
      
      // Emit event
      this.emitEvent(DoorTimerEvents.DOOR_LOCKED, doorId);
    } else {
      console.log(`[DoorTimerService] Attempt to lock door ${doorId}, but it was not unlocked`);
    }
  }

  /**
   * Check if a door is currently unlocked
   * @param doorId The ID of the door to check
   * @returns True if the door is unlocked, false otherwise
   */
  public isDoorUnlocked(doorId: string): boolean {
    const result = this.unlockedDoors.has(doorId);
    // console.log(`[DoorTimerService] Checking if door ${doorId} is unlocked: ${result}`);
    return result;
  }

  /**
   * Clear the auto-lock timer for a door
   * @param doorId The ID of the door
   */
  private clearDoorTimer(doorId: string): void {
    if (this.doorTimers[doorId]) {
      clearTimeout(this.doorTimers[doorId]);
      delete this.doorTimers[doorId];
    }
  }

  /**
   * Subscribe to a door event
   * @param eventName The event to subscribe to
   * @param handler The event handler function
   */
  public subscribe(eventName: DoorTimerEvents, handler: EventHandler): void {
    if (!this.eventSubscriptions[eventName]) {
      this.eventSubscriptions[eventName] = [];
    }
    
    // Add the handler if it's not already subscribed
    if (!this.eventSubscriptions[eventName].includes(handler)) {
      this.eventSubscriptions[eventName].push(handler);
    }
  }

  /**
   * Unsubscribe from a door event
   * @param eventName The event to unsubscribe from
   * @param handler The event handler function to remove
   */
  public unsubscribe(eventName: DoorTimerEvents, handler: EventHandler): void {
    if (this.eventSubscriptions[eventName]) {
      this.eventSubscriptions[eventName] = this.eventSubscriptions[eventName].filter(
        (h) => h !== handler
      );
    }
  }

  /**
   * Emit an event to all subscribers
   */
  private emitEvent(event: DoorTimerEvents, data: any): void {
    console.log(`[DoorTimerService] Emitting event ${event} with data:`, JSON.stringify(data));
    
    // Emit for EventEmitter listeners
    this.emit(event, data);
    
    // For backward compatibility with subscription-based listeners
    const compatData = typeof data === 'string' ? { doorId: data } : data;
    (this.eventSubscriptions[event] || []).forEach(listener => {
      try {
        listener(compatData);
      } catch (err) {
        console.error(`[DoorTimerService] Error in event listener for ${event}:`, err);
      }
    });
  }

  /**
   * Set the auto-lock time
   * @param timeInMilliseconds The auto-lock time in milliseconds
   */
  public setAutoLockTime(timeInMilliseconds: number): void {
    this.autoLockTime = timeInMilliseconds;
  }

  /**
   * Get the current auto-lock time
   * @returns The auto-lock time in milliseconds
   */
  public getAutoLockTime(): number {
    return this.autoLockTime;
  }

  // Add debug method to expose internal state
  public getDebugState(doorId?: string): any {
    if (doorId && this.unlockedDoors.has(doorId)) {
      const doorData = this.unlockedDoors.get(doorId);
      const now = Date.now();
      const elapsedMs = now - doorData.unlockTime;
      const remainingMs = Math.max(0, this.unlockDuration - elapsedMs);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      
      return {
        doorId,
        unlockTime: doorData.unlockTime,
        currentTime: now,
        elapsedMs,
        remainingMs,
        remainingSeconds,
        hasTimer: !!doorData.timerId
      };
    } else if (doorId) {
      return { doorId, isUnlocked: false, message: "Door not found in unlocked doors" };
    } else {
      // Return all door states
      const allDoors = {};
      this.unlockedDoors.forEach((data, id) => {
        const now = Date.now();
        const elapsedMs = now - data.unlockTime;
        const remainingMs = Math.max(0, this.unlockDuration - elapsedMs);
        allDoors[id] = {
          unlockTime: data.unlockTime,
          elapsedMs,
          remainingMs,
          remainingSeconds: Math.ceil(remainingMs / 1000),
          hasTimer: !!data.timerId
        };
      });
      return { doors: allDoors, count: this.unlockedDoors.size };
    }
  }
  
  // Also add a method to get remaining time
  public getRemainingUnlockTime(doorId: string): number {
    if (this.unlockedDoors.has(doorId)) {
      const doorData = this.unlockedDoors.get(doorId);
      const now = Date.now();
      const elapsedMs = now - doorData.unlockTime;
      const remainingMs = Math.max(0, this.unlockDuration - elapsedMs);
      return remainingMs / 1000; // Return exact seconds without rounding
    }
    return 0; // Door is not unlocked
  }
}

// Export the singleton instance
export default DoorTimerService.getInstance(); 