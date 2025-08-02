// Notification service for audio alerts and browser notifications

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

class NotificationService {
  private audioContext: AudioContext | null = null;
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    this.initializeAudioContext();
    // Don't request notification permission automatically
    // It will be requested when user explicitly enables notifications
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
    }
  }

  // Initialize Web Audio API context
  private initializeAudioContext() {
    try {
      // Create AudioContext with user gesture requirement handling
      const win = window as any;
      this.audioContext = new (win.AudioContext || win.webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }



  // Resume audio context if suspended (required for user gesture)
  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    }
  }

  // Play notification sound using Web Audio API
  async playNotificationSound(frequency: number = 800, duration: number = 200) {
    if (!this.audioContext) {
      console.warn('Audio context not available');
      return;
    }

    try {
      await this.resumeAudioContext();

      // Create oscillator for the beep sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure sound
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';

      // Configure volume envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

      // Play sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);

    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  // Play new order notification sound (double beep)
  async playNewOrderSound() {
    await this.playNotificationSound(800, 150);
    setTimeout(() => {
      this.playNotificationSound(1000, 150);
    }, 200);
  }

  // Play order ready notification sound (triple beep)
  async playOrderReadySound() {
    await this.playNotificationSound(600, 100);
    setTimeout(() => {
      this.playNotificationSound(800, 100);
    }, 150);
    setTimeout(() => {
      this.playNotificationSound(1000, 100);
    }, 300);
  }

  // Show browser notification
  showNotification(options: NotificationOptions) {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return;
    }

    if (this.notificationPermission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
      });

      // Auto-close notification after 5 seconds if not requiring interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.warn('Failed to show notification:', error);
    }
  }

  // Combined notification for new orders
  async notifyNewOrder(customerName: string, orderTotal: number) {
    // Play sound
    await this.playNewOrderSound();

    // Show browser notification
    this.showNotification({
      title: 'New Order Received!',
      body: `Order from ${customerName} - Total: ${this.formatPrice(orderTotal)}`,
      tag: 'new-order',
      requireInteraction: true,
    });
  }

  // Combined notification for order ready
  async notifyOrderReady(customerName: string, orderId: string) {
    // Play sound
    await this.playOrderReadySound();

    // Show browser notification
    this.showNotification({
      title: 'Order Ready!',
      body: `Order for ${customerName} is ready for pickup (${orderId.slice(-6)})`,
      tag: 'order-ready',
    });
  }

  // Format price for notifications
  private formatPrice(price: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(price);
  }

  // Enable notifications (call this on user interaction)
  async enableNotifications() {
    // Resume audio context
    await this.resumeAudioContext();

    // Request notification permission if not already granted
    if (this.notificationPermission !== 'granted') {
      this.notificationPermission = await Notification.requestPermission();
    }

    return {
      audio: this.audioContext?.state === 'running',
      notifications: this.notificationPermission === 'granted',
    };
  }

  // Check if notifications are enabled
  isEnabled() {
    return {
      audio: this.audioContext?.state === 'running',
      notifications: this.notificationPermission === 'granted',
    };
  }

  // Test notification (for settings/demo purposes)
  async testNotification() {
    await this.playNotificationSound(800, 300);
    this.showNotification({
      title: 'Test Notification',
      body: 'This is a test notification from Mobilify Pro',
      tag: 'test',
    });
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();
export default notificationService;