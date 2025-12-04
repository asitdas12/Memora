class MetricsCollector {
  constructor() {
    this.metrics = {
      pageLoads: [],
      errors: [],
      latency: [],
      userSatisfaction: [],
    };
    this.sessionStart = Date.now();
    this.apiBaseUrl = 'http://localhost:8000';  // Your FastAPI URL
  }

  // Page Load Time
  trackPageLoad(pageName, duration) {
    const metric = {
      page: pageName,
      duration: duration,
      timestamp: new Date().toISOString(),
    };
    this.metrics.pageLoads.push(metric);
    this.sendToBackend('page_load', metric);
    console.log(`📊 Page Load: ${pageName} - ${duration}ms`);
  }

  // Error Rate
  trackError(error, context = {}) {
    const metric = {
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
    };
    this.metrics.errors.push(metric);
    this.sendToBackend('error', metric);
    console.error('❌ Error tracked:', metric);
  }

  // Latency for user actions
  trackLatency(action, duration) {
    const metric = {
      action: action,
      duration: duration,
      timestamp: new Date().toISOString(),
    };
    this.metrics.latency.push(metric);
    this.sendToBackend('latency', metric);
    console.log(`⚡ Latency: ${action} - ${duration}ms`);
  }

  // User Satisfaction
  trackSatisfaction(rating, feedback = '') {
    const metric = {
      rating: rating, // 1-5 scale
      feedback: feedback,
      timestamp: new Date().toISOString(),
    };
    this.metrics.userSatisfaction.push(metric);
    this.sendToBackend('satisfaction', metric);
  }

  // Weekly Active Users (tracked on backend)
  trackUserActivity(userId) {
    this.sendToBackend('user_activity', {
      userId: userId,
      timestamp: new Date().toISOString(),
    });
  }

    // Send metrics to backend
  async sendToBackend(metricType, data) {
    try {
      // Get auth token if available
      const token = localStorage.getItem('token');
      
      // Use public endpoint if no token (for metrics before login)
      const endpoint = token 
        ? `${this.apiBaseUrl}/api/metrics`
        : `${this.apiBaseUrl}/api/metrics/public`;
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          type: metricType,
          data: data,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to send metrics:', response.statusText);
      }
    } catch (error) {
      // Silently fail - don't let metrics break the app
      console.error('Failed to send metrics:', error);
    }
  }

  // Get average page load time
  getAveragePageLoad() {
    if (this.metrics.pageLoads.length === 0) return 0;
    const total = this.metrics.pageLoads.reduce((sum, m) => sum + m.duration, 0);
    return total / this.metrics.pageLoads.length;
  }

  // Get error rate (errors per minute)
  getErrorRate() {
    const sessionDuration = (Date.now() - this.sessionStart) / 60000; // minutes
    return this.metrics.errors.length / sessionDuration;
  }
}

export const metrics = new MetricsCollector();
export const measureLatency = async (action, fn) => {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    metrics.trackLatency(action, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    metrics.trackLatency(action, duration);
    metrics.trackError(error, { action });
    throw error;
  }
};