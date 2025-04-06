import { Audio } from 'expo-av';
import { Platform, Vibration, AppState } from 'react-native';

// Vibration patterns
const HAPTIC_PATTERNS = {
  UNLOCK: Platform.OS === 'android' ? [0, 40, 30, 40] : [0, 50],
  LOCK: Platform.OS === 'android' ? [0, 30, 20, 30] : [0, 40],
};

/**
 * Centralized Audio Service to manage all sound playback in the app
 * This helps avoid multiple AVPlayer instances conflicting with each other
 */
class AudioService {
  private static instance: AudioService;
  private sounds: { [key: string]: Audio.Sound | null } = {
    unlock: null,
    lock: null,
  };
  private initialized = false;
  private audioModeConfigured = false;
  private loadingPromise: Promise<void> | null = null;
  private appStateSubscription: any = null;

  private constructor() {
    // Set up app state listener for proper audio management
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  /**
   * Get the singleton instance of AudioService
   */
  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Handle app state changes to properly manage audio resources
   */
  private handleAppStateChange = async (nextAppState: string) => {
    // When app goes to background, unload sounds to free resources
    if (nextAppState === 'background') {
      await this.unloadSounds();
    } 
    // When app comes to foreground, reload sounds if needed
    else if (nextAppState === 'active' && !this.initialized) {
      this.loadSounds().catch(error => 
        console.error('Error reloading sounds after app state change:', error)
      );
    }
  }

  /**
   * Initialize the audio service by configuring audio mode and loading sounds
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await this.configureAudioMode();
      await this.loadSounds();
      this.initialized = true;
      console.log('AudioService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AudioService:', error);
      // Reset initialization flag to allow retry
      this.initialized = false;
      throw error;
    }
  }

  /**
   * Configure the audio mode for the app
   * This should only be done once to avoid audio session issues
   */
  private async configureAudioMode(): Promise<void> {
    if (this.audioModeConfigured) return;
    
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.audioModeConfigured = true;
      console.log('Audio mode configured successfully');
    } catch (error) {
      console.error('Failed to configure audio mode:', error);
      throw error;
    }
  }

  /**
   * Load all sound assets
   * Uses a promise lock to prevent multiple simultaneous load attempts
   */
  public async loadSounds(): Promise<void> {
    // If sounds are already loading, wait for that to complete
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Create a new loading promise
    this.loadingPromise = this._loadSoundsImplementation();
    
    try {
      await this.loadingPromise;
    } finally {
      // Clear the loading promise when done (success or failure)
      this.loadingPromise = null;
    }
  }

  /**
   * Internal implementation of sound loading
   */
  private async _loadSoundsImplementation(): Promise<void> {
    try {
      console.log('AudioService: Loading sounds');
      
      // Unload any existing sounds first
      await this.unloadSounds();
      
      // Configure audio mode if not already configured
      if (!this.audioModeConfigured) {
        await this.configureAudioMode();
      }
      
      // Load unlock sound
      try {
        console.log('AudioService: Loading unlock sound');
        const { sound: unlockSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/unlock_beep.mp3'),
          { shouldPlay: false }
        );
        this.sounds.unlock = unlockSound;
        console.log('AudioService: Unlock sound loaded successfully');
      } catch (error) {
        console.error('AudioService: Error loading unlock sound:', error);
      }
      
      // Load lock sound
      try {
        console.log('AudioService: Loading lock sound');
        let lockSoundFile;
        try {
          // Try to use specific lock sound if available
          lockSoundFile = require('../../assets/sounds/lock_beep.mp3');
        } catch (e) {
          // Fall back to unlock sound if lock sound is not available
          console.log('AudioService: No lock-specific sound found, using unlock sound for lock action');
          lockSoundFile = require('../../assets/sounds/unlock_beep.mp3');
        }
        
        const { sound: lockSound } = await Audio.Sound.createAsync(
          lockSoundFile,
          { shouldPlay: false }
        );
        this.sounds.lock = lockSound;
        console.log('AudioService: Lock sound loaded successfully');
      } catch (error) {
        console.error('AudioService: Error loading lock sound:', error);
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('AudioService: Error in loadSounds:', error);
      throw error;
    }
  }

  /**
   * Unload all sound resources
   */
  public async unloadSounds(): Promise<void> {
    try {
      console.log('AudioService: Unloading sounds');
      
      // Unload unlock sound
      if (this.sounds.unlock) {
        try {
          await this.sounds.unlock.unloadAsync();
        } catch (error) {
          console.error('AudioService: Error unloading unlock sound:', error);
        }
        this.sounds.unlock = null;
      }
      
      // Unload lock sound
      if (this.sounds.lock) {
        try {
          await this.sounds.lock.unloadAsync();
        } catch (error) {
          console.error('AudioService: Error unloading lock sound:', error);
        }
        this.sounds.lock = null;
      }
      
      this.initialized = false;
      console.log('AudioService: Sounds unloaded successfully');
    } catch (error) {
      console.error('AudioService: Error in unloadSounds:', error);
      throw error;
    }
  }

  /**
   * Play the unlock sound with haptic feedback
   */
  public async playUnlockSound(): Promise<void> {
    try {
      console.log('AudioService: Playing unlock sound');
      
      // Play haptic feedback immediately
      this.playHapticFeedback('UNLOCK');
      
      // Ensure sounds are loaded
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Play sound if available
      if (this.sounds.unlock) {
        try {
          await this.sounds.unlock.setPositionAsync(0);
          await this.sounds.unlock.playAsync();
        } catch (error) {
          console.error('AudioService: Error playing unlock sound:', error);
          
          // Try reloading and playing again
          try {
            await this.loadSounds();
            if (this.sounds.unlock) {
              await this.sounds.unlock.playAsync();
            }
          } catch (retryError) {
            console.error('AudioService: Retry failed for unlock sound:', retryError);
            // Fall back to vibration
            Vibration.vibrate([0, 40, 30, 40, 30, 40]);
          }
        }
      } else {
        console.log('AudioService: Unlock sound not loaded, trying to load it now');
        await this.loadSounds();
        if (this.sounds.unlock) {
          await this.sounds.unlock.playAsync();
        }
      }
    } catch (error) {
      console.error('AudioService: Error in playUnlockSound:', error);
      // Fall back to vibration
      Vibration.vibrate([0, 40, 30, 40, 30, 40]);
    }
  }

  /**
   * Play the lock sound with haptic feedback
   */
  public async playLockSound(): Promise<void> {
    try {
      console.log('AudioService: Playing lock sound');
      
      // Play haptic feedback immediately
      this.playHapticFeedback('LOCK');
      
      // Ensure sounds are loaded
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Play sound if available
      if (this.sounds.lock) {
        try {
          await this.sounds.lock.setPositionAsync(0);
          await this.sounds.lock.playAsync();
        } catch (error) {
          console.error('AudioService: Error playing lock sound:', error);
          
          // Try reloading and playing again
          try {
            await this.loadSounds();
            if (this.sounds.lock) {
              await this.sounds.lock.playAsync();
            }
          } catch (retryError) {
            console.error('AudioService: Retry failed for lock sound:', retryError);
            // Fall back to vibration
            Vibration.vibrate([0, 30, 20, 30, 20, 30]);
          }
        }
      } else {
        console.log('AudioService: Lock sound not loaded, trying to load it now');
        await this.loadSounds();
        if (this.sounds.lock) {
          await this.sounds.lock.playAsync();
        }
      }
    } catch (error) {
      console.error('AudioService: Error in playLockSound:', error);
      // Fall back to vibration
      Vibration.vibrate([0, 30, 20, 30, 20, 30]);
    }
  }

  /**
   * Play haptic feedback
   */
  public playHapticFeedback(type: keyof typeof HAPTIC_PATTERNS): void {
    try {
      Vibration.vibrate(HAPTIC_PATTERNS[type]);
    } catch (error) {
      console.error(`AudioService: Error playing haptic feedback (${type}):`, error);
    }
  }

  /**
   * Clean up resources (call when app is shutting down)
   */
  public cleanup(): void {
    this.unloadSounds().catch(error => 
      console.error('AudioService: Error during cleanup:', error)
    );
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

// Export a singleton instance
export default AudioService.getInstance(); 