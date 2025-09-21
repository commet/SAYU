'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SafetyDisclaimer } from '@/components/art-counselor/SafetyDisclaimer';
import { ArtCounselorDashboard } from '@/components/art-counselor/ArtCounselorDashboard';
import { CrisisResources } from '@/components/art-counselor/CrisisResources';
import { SessionTimer } from '@/components/art-counselor/SessionTimer';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Clock, Shield } from 'lucide-react';

export default function ArtCounselorPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const [consentStatus, setConsentStatus] = useState<{
    hasConsent: boolean;
    missingConsents: string[];
    requiresRenewal: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      checkConsentStatus();
    }
  }, [user, isLoading]);

  const checkConsentStatus = async () => {
    try {
      const response = await fetch('/api/art-counselor/consent-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      setConsentStatus(data);

      // If user has all required consents, show dashboard
      if (data.hasConsent && !data.requiresRenewal) {
        setHasAcceptedDisclaimer(true);
      }
    } catch (error) {
      console.error('Failed to check consent status:', error);
    }
  };

  const handleDisclaimerAccepted = () => {
    setHasAcceptedDisclaimer(true);
    checkConsentStatus(); // Refresh consent status
  };

  if (isLoading) {
    return (
      <div className=\"min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center\">
        <div className=\"text-center\">
          <div className=\"animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4\"></div>
          <p className=\"text-gray-600\">Loading your safe space...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100\">
      {/* Safety Header - Always Visible */}
      <div className=\"bg-white border-b border-gray-200 shadow-sm\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"flex items-center justify-between h-16\">
            <div className=\"flex items-center\">
              <div className=\"w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3\">
                <Shield className=\"w-5 h-5 text-white\" />
              </div>
              <div>
                <h1 className=\"text-xl font-bold text-gray-900\">SAYU Art Companion</h1>
                <p className=\"text-sm text-gray-600 flex items-center\">
                  <AlertTriangle className=\"w-3 h-3 mr-1 text-amber-500\" />
                  AI Companion - Not a replacement for professional therapy
                </p>
              </div>
            </div>

            <div className=\"flex items-center space-x-4\">
              {/* Crisis Resources Button - Always Accessible */}
              <button
                onClick={() => setShowCrisisResources(true)}
                className=\"px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium\"
              >
                <AlertTriangle className=\"w-4 h-4 inline mr-2\" />
                Get Help Now
              </button>

              {/* Session Timer */}
              {hasAcceptedDisclaimer && (
                <SessionTimer maxMinutes={30} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Age & Safety Banner */}
      <div className=\"bg-amber-50 border-b border-amber-200\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2\">
          <div className=\"flex items-center justify-center text-sm text-amber-800\">
            <Clock className=\"w-4 h-4 mr-2\" />
            This service is for ages 13+ with parental consent for minors. Sessions are limited to 30 minutes for your wellbeing.
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
        {!hasAcceptedDisclaimer ? (
          <SafetyDisclaimer
            onAccepted={handleDisclaimerAccepted}
            consentStatus={consentStatus}
          />
        ) : (
          <ArtCounselorDashboard userId={user.id} />
        )}
      </div>

      {/* Crisis Resources Modal */}
      <CrisisResources
        isOpen={showCrisisResources}
        onClose={() => setShowCrisisResources(false)}
      />

      {/* Footer Disclaimer */}
      <footer className=\"bg-gray-50 border-t border-gray-200\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6\">
          <div className=\"text-center space-y-2\">
            <p className=\"text-sm text-gray-600\">
              <strong>Important:</strong> This AI companion provides supportive conversation about art and emotions.
              It is not a substitute for professional mental health care.
            </p>
            <p className=\"text-xs text-gray-500\">
              If you are experiencing a mental health crisis, please contact emergency services or a crisis hotline immediately.
            </p>
            <div className=\"flex justify-center space-x-6 text-xs text-gray-400\">
              <span>© 2024 SAYU</span>
              <a href=\"/privacy\" className=\"hover:text-gray-600\">Privacy Policy</a>
              <a href=\"/terms\" className=\"hover:text-gray-600\">Terms of Service</a>
              <a href=\"/crisis-resources\" className=\"hover:text-gray-600\">Crisis Resources</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}