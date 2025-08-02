import React, { useEffect, useState } from 'react';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
  environment: string;
  checks: {
    application: 'ok' | 'error';
    frontend: 'ok' | 'error';
    firebase: 'ok' | 'error';
  };
  uptime: number;
}

interface WindowWithStartTime extends Window {
  __APP_START_TIME__?: number;
}

const HealthCheck: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        
        // Check Firebase connection
        let firebaseStatus: 'ok' | 'error' = 'ok';
        try {
          // Simple check - if we can import firebase config, it's likely working
          await import('../config/firebase');
        } catch {
          firebaseStatus = 'error';
        }

        const uptime = Date.now() - ((window as WindowWithStartTime).__APP_START_TIME__ || Date.now());

        const status: HealthStatus = {
          status: firebaseStatus === 'ok' ? 'healthy' : 'unhealthy',
          service: 'mobilify-admin',
          version: import.meta.env.VITE_APP_VERSION || '1.0.0',
          timestamp: new Date().toISOString(),
          environment: import.meta.env.VITE_ENVIRONMENT || 'production',
          checks: {
            application: 'ok',
            frontend: 'ok',
            firebase: firebaseStatus,
          },
          uptime: Math.floor(uptime / 1000), // Convert to seconds
        };

        setHealthStatus(status);
      } catch (error) {
        console.error("Error during health check:", error);
        setHealthStatus({
          status: 'unhealthy',
          service: 'mobilify-admin',
          version: import.meta.env.VITE_APP_VERSION || '1.0.0',
          timestamp: new Date().toISOString(),
          environment: import.meta.env.VITE_ENVIRONMENT || 'production',
          checks: {
            application: 'error',
            frontend: 'error',
            firebase: 'error',
          },
          uptime: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  // For API-like response, return JSON if requested
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('format') === 'json' && healthStatus) {
      // Set content type and return JSON
      document.body.innerHTML = `<pre>${JSON.stringify(healthStatus, null, 2)}</pre>`;
      document.head.innerHTML = '<meta http-equiv="Content-Type" content="application/json">';
    }
  }, [healthStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking system health...</p>
        </div>
      </div>
    );
  }

  if (!healthStatus) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Health Check Failed</h1>
          <p className="text-red-600">Unable to determine system status</p>
        </div>
      </div>
    );
  }

  const isHealthy = healthStatus.status === 'healthy';

  return (
    <div className={`min-h-screen ${isHealthy ? 'bg-green-50' : 'bg-red-50'} flex items-center justify-center`}>
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className={`text-6xl mb-4 ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
              {isHealthy ? '✅' : '❌'}
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${isHealthy ? 'text-green-800' : 'text-red-800'}`}>
              System {healthStatus.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
            </h1>
            <p className="text-gray-600">Mobilify Pro Admin Panel</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Service Information</h3>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Service:</span> {healthStatus.service}</div>
                <div><span className="font-medium">Version:</span> {healthStatus.version}</div>
                <div><span className="font-medium">Environment:</span> {healthStatus.environment}</div>
                <div><span className="font-medium">Uptime:</span> {healthStatus.uptime}s</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">System Checks</h3>
              <div className="space-y-2">
                {Object.entries(healthStatus.checks).map(([check, status]) => (
                  <div key={check} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{check}</span>
                    <span className={`text-sm font-medium ${status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                      {status === 'ok' ? '✅ OK' : '❌ Error'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Last checked: {new Date(healthStatus.timestamp).toLocaleString()}</p>
            <p className="mt-2">
              <a href="/?format=json" className="text-blue-600 hover:underline">
                View JSON format
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;