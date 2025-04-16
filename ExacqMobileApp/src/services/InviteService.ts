import { EventEmitter } from 'events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TimeService from './TimeService';

// Invite interface
export interface Invite {
  id: string;
  visitorName: string;
  validFrom: string;
  validUntil: string;
  status: 'Active' | 'Pending' | 'Expired';
  hostName?: string;
}

// Event constants
export const INVITE_EVENTS = {
  INVITE_CREATED: 'INVITE_CREATED',
  INVITE_UPDATED: 'INVITE_UPDATED',
  INVITE_DELETED: 'INVITE_DELETED'
};

// Direct callback type
type InviteCallback = (invite: Invite) => void;

// Add storage key constant
const STORAGE_KEY = 'exacq_invites';

class InviteService {
  private static instance: InviteService;
  private eventEmitter: EventEmitter;
  private invites: Invite[] = [];
  // New direct callbacks array
  private directCallbacks: InviteCallback[] = [];

  private constructor() {
    this.eventEmitter = new EventEmitter();
    // Set max listeners to a higher value to avoid warnings
    this.eventEmitter.setMaxListeners(20);
    console.log('[InviteService] Initialized with eventEmitter:', this.eventEmitter ? 'Created successfully' : 'Failed to create');
    
    // Check if we should clear invites (demo mode)
    this.checkAndClearInvitesForDemo();
    
    // Load invites from storage
    this.loadInvitesFromStorage();
  }

  public static getInstance(): InviteService {
    if (!InviteService.instance) {
      InviteService.instance = new InviteService();
    }
    return InviteService.instance;
  }

  // Register a direct callback - simpler than event system
  public registerCallback(callback: InviteCallback): void {
    console.log('[InviteService] Registering direct callback');
    this.directCallbacks.push(callback);
    console.log(`[InviteService] Total direct callbacks: ${this.directCallbacks.length}`);
  }

  // Unregister a direct callback
  public unregisterCallback(callback: InviteCallback): void {
    console.log('[InviteService] Unregistering direct callback');
    this.directCallbacks = this.directCallbacks.filter(cb => cb !== callback);
    console.log(`[InviteService] Total direct callbacks after removal: ${this.directCallbacks.length}`);
  }

  // Create a new invite
  public async createInvite(inviteData: Omit<Invite, 'id' | 'status'>): Promise<Invite> {
    console.log('==================== INVITE SERVICE CREATE START ====================');
    console.log('[InviteService] createInvite called with data:', JSON.stringify(inviteData, null, 2));
    
    try {
      // Validate input data (ensure ISO strings are provided)
      if (!inviteData.visitorName) {
        console.error('[InviteService] ERROR: Missing required field visitorName');
        throw new Error('Missing required field visitorName');
      }
      
      if (!inviteData.validFrom || isNaN(new Date(inviteData.validFrom).getTime())) {
        console.error(`[InviteService] ERROR: Invalid or missing validFrom ISO string: "${inviteData.validFrom}"`);
        throw new Error('Invalid or missing required field validFrom (must be ISO string)');
      }
      
      if (!inviteData.validUntil || isNaN(new Date(inviteData.validUntil).getTime())) {
        console.error(`[InviteService] ERROR: Invalid or missing validUntil ISO string: "${inviteData.validUntil}"`);
        throw new Error('Invalid or missing required field validUntil (must be ISO string)');
      }

      // Generate a unique ID
      const id = `invite-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      console.log('[InviteService] Generated ID:', id);
      
      // Create the invite object directly with provided ISO strings
      const invite: Invite = {
        id,
        visitorName: inviteData.visitorName,
        validFrom: inviteData.validFrom, // Directly use the provided ISO string
        validUntil: inviteData.validUntil, // Directly use the provided ISO string
        status: 'Active', // Or 'Pending' depending on desired initial state
        hostName: inviteData.hostName
      };
      
      console.log('[InviteService] Using provided ISO dates:');
      console.log(`- validFrom: ${invite.validFrom}`);
      console.log(`- validUntil: ${invite.validUntil}`);
      
      // Format for display to verify correct time (using a reliable parser for ISO)
      const startDate = new Date(invite.validFrom);
      const endDate = new Date(invite.validUntil);
      const formattedTime = TimeService.formatDateTimeRange(startDate, endDate); // Assuming TimeService still exists and has this
      console.log('[InviteService] Formatted time for verification:', formattedTime);
      
      // Add to invites array
      this.invites.push(invite);
      console.log('[InviteService] Invite added to internal array, total count:', this.invites.length);
      
      // Persist to storage
      try {
        console.log('[InviteService] Attempting to persist invites to storage...');
        const inviteIds = this.invites.map(inv => inv.id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inviteIds));
        await AsyncStorage.setItem(`invite_${id}`, JSON.stringify(invite));
        console.log('[InviteService] Successfully persisted invites to storage');
      } catch (storageError) {
        console.error('[InviteService] Error persisting to AsyncStorage (non-fatal):', storageError);
      }
      
      // Call direct callbacks
      console.log(`[InviteService] Calling ${this.directCallbacks.length} direct callbacks`);
      this.directCallbacks.forEach(callback => {
        try {
          console.log('[InviteService] Calling callback for invite:', id);
          callback(invite);
        } catch (callbackError) {
          console.error('[InviteService] Error in direct callback (non-fatal):', callbackError);
        }
      });
      
      // Emit the event
      try {
        console.log('[InviteService] Emitting INVITE_CREATED event');
        this.eventEmitter.emit(INVITE_EVENTS.INVITE_CREATED, invite);
      } catch (eventError) {
        console.error('[InviteService] Error emitting event (non-fatal):', eventError);
      }
      
      console.log('[InviteService] Returning invite:', id);
      console.log('==================== INVITE SERVICE CREATE END ====================');
      
      return invite;
    } catch (error) {
      console.error('[InviteService] Error in createInvite:', error);
      throw error;
    }
  }

  // Get all invites
  public getInvites(): Invite[] {
    return [...this.invites]; // Return a copy
  }

  // Subscribe to events
  public subscribe(event: string, callback: (...args: any[]) => void): void {
    const beforeCount = this.eventEmitter.listenerCount(event);
    this.eventEmitter.on(event, callback);
    const afterCount = this.eventEmitter.listenerCount(event);
    
    console.log(`[InviteService] Subscribed to event: ${event}`);
    console.log(`[InviteService] Listener count for ${event}: ${beforeCount} -> ${afterCount}`);
  }

  // Unsubscribe from events
  public unsubscribe(event: string, callback: (...args: any[]) => void): void {
    this.eventEmitter.off(event, callback);
    console.log(`[InviteService] Unsubscribed from event: ${event}`);
  }

  // Clear all invites from storage and internal state
  public async clearAllInvites(): Promise<void> {
    console.log('[InviteService] Clearing all invites...');
    
    try {
      // First, get all invite IDs
      const inviteIds = this.invites.map(invite => invite.id);
      
      // Clear the internal array
      this.invites = [];
      
      // Clear the main storage key
      await AsyncStorage.removeItem(STORAGE_KEY);
      
      // Clear each individual invite
      for (const id of inviteIds) {
        await AsyncStorage.removeItem(`invite_${id}`);
      }
      
      console.log(`[InviteService] Successfully cleared ${inviteIds.length} invites`);
    } catch (error) {
      console.error('[InviteService] Error clearing invites:', error);
    }
  }

  // Add a method to load invites from storage
  private async loadInvitesFromStorage() {
    console.log('[InviteService] Loading invites from storage...');
    try {
      const inviteIdsString = await AsyncStorage.getItem(STORAGE_KEY);
      if (inviteIdsString) {
        const inviteIds = JSON.parse(inviteIdsString) as string[];
        console.log(`[InviteService] Successfully loaded ${inviteIds.length} invites from storage`);
        console.log(`[InviteService] Loaded invites: ${JSON.stringify(inviteIds)}`);
        
        // Load each invite data
        this.invites = [];
        for (const id of inviteIds) {
          const inviteString = await AsyncStorage.getItem(`invite_${id}`);
          if (inviteString) {
            const invite = JSON.parse(inviteString) as Invite;
            this.invites.push(invite);
          }
        }
      } else {
        console.log('[InviteService] No invites found in storage');
      }
    } catch (error) {
      console.error('[InviteService] Error loading invites from storage:', error);
    }
  }

  // Method to determine if we're in demo mode and clear invites if needed
  private async checkAndClearInvitesForDemo() {
    console.log('[InviteService] Checking if invites should be cleared for demo');
    
    try {
      // For this app, we're always in demo mode - clear invites every time the service initializes
      const isDemoMode = true;
      
      if (isDemoMode) {
        console.log('[InviteService] Demo mode detected, clearing all real invites');
        await this.clearAllInvites();
        console.log('[InviteService] Successfully cleared all invites for demo');
      }
    } catch (error) {
      console.error('[InviteService] Error checking demo mode:', error);
    }
  }
}

export default InviteService.getInstance(); 