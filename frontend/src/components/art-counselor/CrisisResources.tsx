'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Phone,
  MessageSquare,
  Globe,
  AlertTriangle,
  Heart,
  Clock,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface CrisisResourcesProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CrisisResource {
  country: string;
  flag: string;
  hotline: string;
  text?: string;
  chat?: string;
  emergency: string;
  available: string;
}

export function CrisisResources({ isOpen, onClose }: CrisisResourcesProps) {
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [userLocation, setUserLocation] = useState<string | null>(null);

  const crisisResources: Record<string, CrisisResource> = {
    'US': {
      country: 'United States',
      flag: '🇺🇸',
      hotline: '988',
      text: 'Text HOME to 741741',
      chat: 'suicidepreventionlifeline.org/chat',
      emergency: '911',
      available: '24/7'
    },
    'GB': {
      country: 'United Kingdom',
      flag: '🇬🇧',
      hotline: '116 123',
      text: 'Text SHOUT to 85258',
      chat: 'samaritans.org',
      emergency: '999',
      available: '24/7'
    },
    'CA': {
      country: 'Canada',
      flag: '🇨🇦',
      hotline: '1-833-456-4566',
      text: 'Text 45645',
      chat: 'talksuicide.ca',
      emergency: '911',
      available: '24/7'
    },
    'AU': {
      country: 'Australia',
      flag: '🇦🇺',
      hotline: '13 11 14',
      text: 'Text 0477 13 11 14',
      chat: 'lifeline.org.au/crisis-chat',
      emergency: '000',
      available: '24/7'
    },
    'DE': {
      country: 'Germany',
      flag: '🇩🇪',
      hotline: '0800 111 0 111',
      text: 'Available via chat',
      chat: 'telefonseelsorge.de',
      emergency: '112',
      available: '24/7'
    },
    'FR': {
      country: 'France',
      flag: '🇫🇷',
      hotline: '3114',
      text: 'Available via chat',
      chat: 'suicide-ecoute.fr',
      emergency: '112',
      available: '24/7'
    },
    'ES': {
      country: 'Spain',
      flag: '🇪🇸',
      hotline: '717 003 717',
      text: 'Available via WhatsApp',
      chat: 'telefonodelaesperanza.org',
      emergency: '112',
      available: '24/7'
    },
    'IT': {
      country: 'Italy',
      flag: '🇮🇹',
      hotline: '800 86 00 22',
      text: 'Available via chat',
      chat: 'samaritansonlus.org',
      emergency: '112',
      available: '24/7'
    },
    'JP': {
      country: 'Japan',
      flag: '🇯🇵',
      hotline: '0120-783-556',
      text: 'Available via chat',
      chat: 'tell-j.org',
      emergency: '119',
      available: '24/7'
    },
    'KR': {
      country: 'South Korea',
      flag: '🇰🇷',
      hotline: '1393',
      text: 'Available via chat',
      chat: 'lifeline.or.kr',
      emergency: '119',
      available: '24/7'
    },
    'GLOBAL': {
      country: 'International',
      flag: '🌍',
      hotline: 'Visit findahelpline.com',
      text: 'Region-specific resources',
      chat: 'befrienders.org',
      emergency: 'Local emergency number',
      available: 'Varies by region'
    }
  };

  useEffect(() => {
    // Try to detect user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // In a real app, you'd use a geolocation API
            // For now, we'll just default to US
            setUserLocation('US');
            setSelectedRegion('US');
          } catch (error) {
            console.error('Error detecting location:', error);
          }
        },
        () => {
          // Default to US if location detection fails
          setSelectedRegion('US');
        }
      );
    }
  }, []);

  const currentResource = crisisResources[selectedRegion];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50\"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className=\"bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto\"
        >
          {/* Header */}
          <div className=\"bg-red-600 text-white p-6 rounded-t-xl\">
            <div className=\"flex items-center justify-between\">
              <div className=\"flex items-center\">
                <AlertTriangle className=\"w-8 h-8 mr-3\" />
                <div>
                  <h2 className=\"text-2xl font-bold\">Crisis Resources</h2>
                  <p className=\"text-red-100\">Immediate help is available 24/7</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className=\"text-white hover:text-red-200 transition-colors\"
              >
                <X className=\"w-6 h-6\" />
              </button>
            </div>
          </div>

          <div className=\"p-6\">
            {/* Emergency Banner */}
            <div className=\"bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg\">
              <div className=\"flex items-start\">
                <Heart className=\"w-6 h-6 text-red-500 mt-0.5 mr-3 flex-shrink-0\" />
                <div>
                  <h3 className=\"font-semibold text-red-900 mb-1\">You Are Not Alone</h3>
                  <p className=\"text-red-800 text-sm\">
                    If you are having thoughts of suicide, self-harm, or are in immediate danger,
                    please reach out for help right now. These resources are available 24/7.
                  </p>
                </div>
              </div>
            </div>

            {/* Region Selection */}
            <div className=\"mb-6\">
              <div className=\"flex items-center mb-3\">
                <MapPin className=\"w-5 h-5 text-gray-500 mr-2\" />
                <label className=\"text-sm font-medium text-gray-700\">
                  Select your region for local resources:
                </label>
              </div>
              <div className=\"grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2\">
                {Object.entries(crisisResources).map(([code, resource]) => (
                  <button
                    key={code}
                    onClick={() => setSelectedRegion(code)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${\n                      selectedRegion === code\n                        ? 'bg-blue-100 border-blue-300 text-blue-900'\n                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'\n                    }`}
                  >
                    <div className=\"text-lg mb-1\">{resource.flag}</div>
                    <div className=\"text-xs font-medium truncate\">{resource.country}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Crisis Resources for Selected Region */}
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6 mb-6\">
              {/* Phone Support */}
              <div className=\"bg-blue-50 p-6 rounded-lg\">
                <div className=\"flex items-center mb-4\">
                  <Phone className=\"w-6 h-6 text-blue-600 mr-3\" />
                  <h3 className=\"font-semibold text-blue-900\">Call for Help</h3>
                </div>
                <div className=\"space-y-3\">
                  <div>
                    <div className=\"text-sm text-blue-700 font-medium\">Crisis Hotline</div>
                    <div className=\"text-lg font-bold text-blue-900\">{currentResource.hotline}</div>
                  </div>
                  <div>
                    <div className=\"text-sm text-blue-700 font-medium\">Emergency Services</div>
                    <div className=\"text-lg font-bold text-blue-900\">{currentResource.emergency}</div>
                  </div>
                  <div className=\"flex items-center text-sm text-blue-700\">
                    <Clock className=\"w-4 h-4 mr-1\" />
                    Available {currentResource.available}
                  </div>
                </div>
              </div>

              {/* Text/Chat Support */}
              <div className=\"bg-green-50 p-6 rounded-lg\">
                <div className=\"flex items-center mb-4\">
                  <MessageSquare className=\"w-6 h-6 text-green-600 mr-3\" />
                  <h3 className=\"font-semibold text-green-900\">Text or Chat</h3>
                </div>
                <div className=\"space-y-3\">
                  {currentResource.text && (
                    <div>
                      <div className=\"text-sm text-green-700 font-medium\">Text Support</div>
                      <div className=\"text-sm text-green-900\">{currentResource.text}</div>
                    </div>
                  )}
                  {currentResource.chat && (
                    <div>
                      <div className=\"text-sm text-green-700 font-medium\">Online Chat</div>
                      <div className=\"text-sm text-green-900 flex items-center\">
                        {currentResource.chat}
                        <ExternalLink className=\"w-3 h-3 ml-1\" />
                      </div>
                    </div>
                  )}
                  <div className=\"flex items-center text-sm text-green-700\">
                    <Clock className=\"w-4 h-4 mr-1\" />
                    Available {currentResource.available}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Resources */}
            <div className=\"bg-gray-50 p-6 rounded-lg mb-6\">
              <div className=\"flex items-center mb-4\">
                <Globe className=\"w-6 h-6 text-gray-600 mr-3\" />
                <h3 className=\"font-semibold text-gray-900\">Additional Resources</h3>
              </div>
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4 text-sm\">
                <div>
                  <h4 className=\"font-medium text-gray-900 mb-2\">Online Support</h4>
                  <ul className=\"space-y-1 text-gray-700\">
                    <li>• Crisis Text Line (global)</li>
                    <li>• 7 Cups (free emotional support)</li>
                    <li>• BetterHelp (professional therapy)</li>
                    <li>• International Association for Suicide Prevention</li>
                  </ul>
                </div>
                <div>
                  <h4 className=\"font-medium text-gray-900 mb-2\">When to Seek Help</h4>
                  <ul className=\"space-y-1 text-gray-700\">
                    <li>• Thoughts of self-harm or suicide</li>
                    <li>• Feeling hopeless or trapped</li>
                    <li>• Severe depression or anxiety</li>
                    <li>• Substance abuse concerns</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Safety Planning */}
            <div className=\"bg-purple-50 p-6 rounded-lg mb-6\">
              <h3 className=\"font-semibold text-purple-900 mb-3\">Safety Planning Tips</h3>
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800\">
                <div>
                  <h4 className=\"font-medium mb-2\">Immediate Steps</h4>
                  <ul className=\"space-y-1\">
                    <li>• Remove means of self-harm</li>
                    <li>• Stay with someone you trust</li>
                    <li>• Call a crisis line</li>
                    <li>• Go to an emergency room</li>
                  </ul>
                </div>
                <div>
                  <h4 className=\"font-medium mb-2\">Build Your Support Network</h4>
                  <ul className=\"space-y-1\">
                    <li>• Identify trusted friends/family</li>
                    <li>• Save crisis numbers in your phone</li>
                    <li>• Find local mental health services</li>
                    <li>• Consider professional therapy</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className=\"flex flex-col sm:flex-row gap-3\">
              <a
                href={`tel:${currentResource.hotline.replace(/[^\\d]/g, '')}`}
                className=\"flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium text-center hover:bg-red-700 transition-colors\"
              >
                <Phone className=\"w-5 h-5 inline mr-2\" />
                Call Crisis Line Now
              </a>
              <button
                onClick={onClose}
                className=\"flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors\"
              >
                Close
              </button>
            </div>

            {/* Disclaimer */}
            <div className=\"mt-6 text-xs text-gray-500 text-center\">
              <p>
                These resources are provided for emergency situations. SAYU is not affiliated with these organizations.
                If you are in immediate danger, please contact local emergency services.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}