'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Shield,
  Clock,
  Users,
  Heart,
  CheckCircle,
  ExternalLink,
  Phone,
  MessageSquare
} from 'lucide-react';

interface ConsentStatus {
  hasConsent: boolean;
  missingConsents: string[];
  requiresRenewal: boolean;
}

interface SafetyDisclaimerProps {
  onAccepted: () => void;
  consentStatus: ConsentStatus | null;
}

export function SafetyDisclaimer({ onAccepted, consentStatus }: SafetyDisclaimerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedSafety, setAcceptedSafety] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);
  const [birthYear, setBirthYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  const age = birthYear ? currentYear - parseInt(birthYear) : 0;
  const isMinor = age > 0 && age < 18;
  const isEligible = age >= 13;

  const steps = [
    {
      title: \"Welcome to SAYU Art Companion\",
      subtitle: \"Your wellbeing is our priority\",
      content: \"introduction\"
    },
    {
      title: \"Important Safety Information\",
      subtitle: \"Please read carefully\",
      content: \"safety\"
    },
    {
      title: \"Age Verification\",
      subtitle: \"Required by law\",
      content: \"age\"
    },
    {
      title: \"Terms and Consent\",
      subtitle: \"Final step\",
      content: \"consent\"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitConsent = async () => {
    if (!acceptedTerms || !acceptedSafety || !ageVerified) {
      return;
    }

    if (isMinor && !parentalConsent) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/art-counselor/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          termsAccepted: acceptedTerms,
          safetyDisclaimerAccepted: acceptedSafety,
          ageVerified: ageVerified,
          birthYear: parseInt(birthYear),
          parentalConsentGiven: isMinor ? parentalConsent : null,
          consentTimestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        onAccepted();
      } else {
        console.error('Failed to submit consent');
      }
    } catch (error) {
      console.error('Error submitting consent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderIntroduction = () => (
    <div className=\"space-y-6\">
      <div className=\"text-center\">
        <Heart className=\"w-16 h-16 text-red-500 mx-auto mb-4\" />
        <h2 className=\"text-2xl font-bold text-gray-900 mb-2\">
          Welcome to Your Safe Space
        </h2>
        <p className=\"text-gray-600 max-w-2xl mx-auto\">
          SAYU Art Companion is designed to support your emotional wellbeing through art exploration and gentle conversation.
          We prioritize your safety and want you to understand what this service is and isn't.
        </p>
      </div>

      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
        <div className=\"bg-green-50 p-6 rounded-lg\">
          <CheckCircle className=\"w-8 h-8 text-green-600 mb-3\" />
          <h3 className=\"font-semibold text-green-900 mb-2\">What We Provide</h3>
          <ul className=\"text-sm text-green-800 space-y-1\">
            <li>• Supportive conversation about art and emotions</li>
            <li>• Personalized art recommendations</li>
            <li>• Gentle emotional exploration</li>
            <li>• 24/7 AI companion for creative inspiration</li>
            <li>• Safe space to express feelings</li>
          </ul>
        </div>

        <div className=\"bg-amber-50 p-6 rounded-lg\">
          <AlertTriangle className=\"w-8 h-8 text-amber-600 mb-3\" />
          <h3 className=\"font-semibold text-amber-900 mb-2\">What We're Not</h3>
          <ul className=\"text-sm text-amber-800 space-y-1\">
            <li>• Not a licensed therapist or counselor</li>
            <li>• Not a replacement for professional mental health care</li>
            <li>• Not qualified to diagnose or treat conditions</li>
            <li>• Not able to prescribe medication</li>
            <li>• Not for crisis or emergency situations</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSafety = () => (
    <div className=\"space-y-6\">
      <div className=\"text-center\">
        <Shield className=\"w-16 h-16 text-blue-500 mx-auto mb-4\" />
        <h2 className=\"text-2xl font-bold text-gray-900 mb-2\">
          Your Safety Comes First
        </h2>
      </div>

      <div className=\"bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg\">
        <div className=\"flex items-start\">
          <AlertTriangle className=\"w-6 h-6 text-red-500 mt-0.5 mr-3 flex-shrink-0\" />
          <div>
            <h3 className=\"font-semibold text-red-900 mb-2\">Crisis Resources</h3>
            <p className=\"text-red-800 mb-4\">
              If you are experiencing thoughts of self-harm, suicide, or are in immediate danger,
              please contact emergency services or a crisis hotline immediately:
            </p>
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4 text-sm\">
              <div className=\"flex items-center text-red-800\">
                <Phone className=\"w-4 h-4 mr-2\" />
                <span><strong>US:</strong> 988 (Suicide & Crisis Lifeline)</span>
              </div>
              <div className=\"flex items-center text-red-800\">
                <MessageSquare className=\"w-4 h-4 mr-2\" />
                <span><strong>Text:</strong> HOME to 741741</span>
              </div>
              <div className=\"flex items-center text-red-800\">
                <Phone className=\"w-4 h-4 mr-2\" />
                <span><strong>Emergency:</strong> 911</span>
              </div>
              <div className=\"flex items-center text-red-800\">
                <ExternalLink className=\"w-4 h-4 mr-2\" />
                <span><strong>Global:</strong> findahelpline.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
        <div className=\"bg-blue-50 p-4 rounded-lg\">
          <Clock className=\"w-6 h-6 text-blue-600 mb-2\" />
          <h3 className=\"font-semibold text-blue-900 mb-1\">Session Limits</h3>
          <p className=\"text-sm text-blue-800\">
            Sessions are limited to 30 minutes for your wellbeing
          </p>
        </div>

        <div className=\"bg-purple-50 p-4 rounded-lg\">
          <Users className=\"w-6 h-6 text-purple-600 mb-2\" />
          <h3 className=\"font-semibold text-purple-900 mb-1\">Age Requirements</h3>
          <p className=\"text-sm text-purple-800\">
            Must be 13+ with parental consent for minors
          </p>
        </div>

        <div className=\"bg-green-50 p-4 rounded-lg\">
          <Shield className=\"w-6 h-6 text-green-600 mb-2\" />
          <h3 className=\"font-semibold text-green-900 mb-1\">Privacy Protected</h3>
          <p className=\"text-sm text-green-800\">
            Your conversations are private and secure
          </p>
        </div>
      </div>
    </div>
  );

  const renderAge = () => (
    <div className=\"space-y-6\">
      <div className=\"text-center\">
        <Users className=\"w-16 h-16 text-purple-500 mx-auto mb-4\" />
        <h2 className=\"text-2xl font-bold text-gray-900 mb-2\">
          Age Verification Required
        </h2>
        <p className=\"text-gray-600\">
          This service requires users to be at least 13 years old, with parental consent for minors.
        </p>
      </div>

      <div className=\"max-w-md mx-auto space-y-4\">
        <div>
          <label className=\"block text-sm font-medium text-gray-700 mb-2\">
            Birth Year *
          </label>
          <input
            type=\"number\"
            min=\"1900\"
            max={currentYear}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
            placeholder=\"e.g. 1990\"
          />
          {age > 0 && (
            <p className=\"mt-1 text-sm text-gray-600\">
              You are {age} years old
            </p>
          )}
        </div>

        {age > 0 && age < 13 && (
          <div className=\"bg-red-50 border border-red-200 rounded-lg p-4\">
            <p className=\"text-red-800 text-sm\">
              Unfortunately, this service is only available to users 13 years of age and older.
              Please speak with a parent or guardian about appropriate mental health resources.
            </p>
          </div>
        )}

        {isEligible && (
          <div className=\"space-y-4\">
            <label className=\"flex items-start space-x-3\">
              <input
                type=\"checkbox\"
                checked={ageVerified}
                onChange={(e) => setAgeVerified(e.target.checked)}
                className=\"mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\"
              />
              <span className=\"text-sm text-gray-700\">
                I confirm that the birth year I provided is accurate
              </span>
            </label>

            {isMinor && (
              <div className=\"bg-amber-50 border border-amber-200 rounded-lg p-4\">
                <h4 className=\"font-medium text-amber-900 mb-2\">Parental Consent Required</h4>
                <p className=\"text-sm text-amber-800 mb-3\">
                  As you are under 18, we require parental or guardian consent to use this service.
                </p>
                <label className=\"flex items-start space-x-3\">
                  <input
                    type=\"checkbox\"
                    checked={parentalConsent}
                    onChange={(e) => setParentalConsent(e.target.checked)}
                    className=\"mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded\"
                  />
                  <span className=\"text-sm text-amber-800\">
                    I have obtained consent from my parent or legal guardian to use this service
                  </span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderConsent = () => (
    <div className=\"space-y-6\">
      <div className=\"text-center\">
        <CheckCircle className=\"w-16 h-16 text-green-500 mx-auto mb-4\" />
        <h2 className=\"text-2xl font-bold text-gray-900 mb-2\">
          Final Consent
        </h2>
        <p className=\"text-gray-600\">
          Please confirm your understanding and agreement
        </p>
      </div>

      <div className=\"space-y-4 max-w-2xl mx-auto\">
        <label className=\"flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50\">
          <input
            type=\"checkbox\"
            checked={acceptedSafety}
            onChange={(e) => setAcceptedSafety(e.target.checked)}
            className=\"mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\"
          />
          <div className=\"text-sm\">
            <div className=\"font-medium text-gray-900 mb-1\">Safety Disclaimer</div>
            <div className=\"text-gray-700\">
              I understand that this AI companion is not a licensed mental health professional,
              cannot provide medical advice or treatment, and is not suitable for crisis situations.
              I will seek professional help for serious mental health concerns.
            </div>
          </div>
        </label>

        <label className=\"flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50\">
          <input
            type=\"checkbox\"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className=\"mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\"
          />
          <div className=\"text-sm\">
            <div className=\"font-medium text-gray-900 mb-1\">Terms of Service & Privacy Policy</div>
            <div className=\"text-gray-700\">
              I have read and agree to the{' '}
              <a href=\"/terms\" target=\"_blank\" className=\"text-blue-600 hover:underline\">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href=\"/privacy\" target=\"_blank\" className=\"text-blue-600 hover:underline\">
                Privacy Policy
              </a>.
            </div>
          </div>
        </label>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return true;
      case 2:
        return ageVerified && isEligible && (!isMinor || parentalConsent);
      case 3:
        return acceptedTerms && acceptedSafety;
      default:
        return false;
    }
  };

  return (
    <div className=\"max-w-4xl mx-auto\">
      <div className=\"bg-white rounded-xl shadow-lg overflow-hidden\">
        {/* Progress Bar */}
        <div className=\"bg-gray-50 px-6 py-4\">
          <div className=\"flex items-center justify-between mb-2\">
            <span className=\"text-sm font-medium text-gray-600\">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className=\"text-sm text-gray-500\">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className=\"w-full bg-gray-200 rounded-full h-2\">
            <div
              className=\"bg-blue-600 h-2 rounded-full transition-all duration-300\"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className=\"p-8\">
          <div className=\"text-center mb-6\">
            <h1 className=\"text-lg font-semibold text-gray-900\">
              {steps[currentStep].title}
            </h1>
            <p className=\"text-sm text-gray-600\">
              {steps[currentStep].subtitle}
            </p>
          </div>

          <AnimatePresence mode=\"wait\">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].content === 'introduction' && renderIntroduction()}
              {steps[currentStep].content === 'safety' && renderSafety()}
              {steps[currentStep].content === 'age' && renderAge()}
              {steps[currentStep].content === 'consent' && renderConsent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className=\"bg-gray-50 px-6 py-4 flex justify-between items-center\">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className=\"px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed\"
          >
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className=\"px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed\"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmitConsent}
              disabled={!canProceed() || isSubmitting}
              className=\"px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed\"
            >
              {isSubmitting ? 'Processing...' : 'Enter Safe Space'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}