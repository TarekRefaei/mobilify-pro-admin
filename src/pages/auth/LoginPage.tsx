import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components';
import { useAuth } from '../../hooks';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentialsLoaded, setCredentialsLoaded] = useState(false);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('mobilify_saved_credentials');
    if (savedCredentials) {
      try {
        const {
          email: savedEmail,
          password: savedPassword,
          rememberMe: savedRememberMe,
        } = JSON.parse(savedCredentials);
        setEmail(savedEmail || '');
        setPassword(savedPassword || '');
        setRememberMe(savedRememberMe || false);
        setCredentialsLoaded(true);

        // Hide the notification after 3 seconds
        setTimeout(() => setCredentialsLoaded(false), 3000);
      } catch (error) {
        console.error('Error loading saved credentials:', error);
        // Clear invalid data
        localStorage.removeItem('mobilify_saved_credentials');
      }
    }
  }, []);

  // Handle remember me checkbox change
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);

    // If unchecked, clear saved credentials immediately
    if (!checked) {
      localStorage.removeItem('mobilify_saved_credentials');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use the useAuth signIn function which handles both demo and Firebase auth
      await signIn({ email, password });

      // Save credentials if remember me is checked
      if (rememberMe) {
        const credentialsToSave = {
          email,
          password,
          rememberMe: true,
        };
        localStorage.setItem(
          'mobilify_saved_credentials',
          JSON.stringify(credentialsToSave)
        );
      } else {
        // Clear saved credentials if remember me is unchecked
        localStorage.removeItem('mobilify_saved_credentials');
      }

      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-white font-bold">M</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Mobilify Pro Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your restaurant dashboard
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {credentialsLoaded && (
              <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Credentials loaded from saved login
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => handleRememberMeChange(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Demo Credentials
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Email: admin@restaurant.com
                <br />
                Password: demo123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
