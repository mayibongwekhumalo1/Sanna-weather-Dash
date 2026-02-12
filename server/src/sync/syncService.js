import weatherService from '../services/weatherService.js';
import Location from '../models/Location.js';

class SyncService {
  constructor() {
    this.syncInterval = null;
    this.isRunning = false;
    this.stats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      lastSyncTime: null,
    };
  }

  start(intervalMinutes = 15) {
    if (this.isRunning) {
      console.log('Sync service is already running');
      return;
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    console.log(`Starting sync service with interval: ${intervalMinutes} minutes`);

    this.isRunning = true;
    this.runSync();

    this.syncInterval = setInterval(() => {
      this.runSync();
    }, intervalMs);
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log('Sync service stopped');
  }

  async runSync() {
    console.log('Starting weather data sync...');
    const startTime = Date.now();
    this.stats.totalSyncs++;

    try {
      const activeLocations = await Location.find({ isActive: true });
      console.log(`Found ${activeLocations.length} active locations to sync`);

      let successCount = 0;
      let failCount = 0;

      for (const location of activeLocations) {
        try {
          await weatherService.fetchAndSaveForLocation(location._id);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync location ${location.name}:`, error.message);
          failCount++;
        }
      }

      this.stats.successfulSyncs = (this.stats.successfulSyncs || 0) + successCount;
      this.stats.failedSyncs = (this.stats.failedSyncs || 0) + failCount;
      this.stats.lastSyncTime = new Date();

      const duration = Date.now() - startTime;
      console.log(`Sync completed in ${duration}ms. Success: ${successCount}, Failed: ${failCount}`);
    } catch (error) {
      console.error('Sync run failed:', error.message);
      this.stats.failedSyncs++;
    }
  }

  async syncSingleLocation(locationId) {
    try {
      const result = await weatherService.fetchAndSaveForLocation(locationId);
      return { success: true, snapshot: result };
    } catch (error) {
      console.error(`Manual sync failed for location ${locationId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      intervalMinutes: this.syncInterval ? process.env.SYNC_INTERVAL_MINUTES : null,
    };
  }
}

const syncService = new SyncService();
export default syncService;
