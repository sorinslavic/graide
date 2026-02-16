/**
 * Login page - Google OAuth authentication
 */

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { jwtDecode } from 'jwt-decode';

interface GoogleJWTPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received');
      }

      // Decode the JWT to get user info
      const decoded = jwtDecode<GoogleJWTPayload>(credentialResponse.credential);

      const userInfo = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      };

      // Store auth credentials
      await login(credentialResponse.credential, userInfo);

      console.log('✅ Login successful:', userInfo.email);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleError = () => {
    console.error('❌ Google OAuth error');
    alert('Login failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            gr<span className="text-blue-600">AI</span>de
          </h1>
          <p className="text-gray-600">AI-Powered Grading Assistant</p>
          <p className="text-sm text-gray-500 mt-2">
            Save 60-80% of your grading time
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
          />
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>By signing in, you agree to use grAIde for educational purposes.</p>
          <p className="mt-2">
            grAIde uses Google Sheets and Drive to store your data securely in
            your own Google account.
          </p>
        </div>
      </div>
    </div>
  );
}
