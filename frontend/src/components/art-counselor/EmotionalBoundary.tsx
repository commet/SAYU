'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  Shield,
  Phone,
  ExternalLink,
  Palette,
  Users,
  MessageSquare
} from 'lucide-react';

interface EmotionalBoundaryProps {
  isOpen: boolean;
  onClose: () => void;
  boundaryType: 'heavy_topic' | 'medical_advice' | null;
}

export function EmotionalBoundary({ isOpen, onClose, boundaryType }: EmotionalBoundaryProps) {
  if (!isOpen || !boundaryType) return null;

  const getContent = () => {
    switch (boundaryType) {
      case 'heavy_topic':
        return {
          title: 'A Gentle Pause',
          subtitle: 'Let's redirect to safer waters',
          icon: Heart,
          iconColor: 'text-purple-500',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          message: `I can hear that you're dealing with something really difficult, and I want to acknowledge your courage in sharing.

While I'm here to support you through art and creativity, what you're sharing sounds like it would benefit from speaking with a professional counselor or therapist who can provide the specialized support you deserve.

These trained professionals have the expertise to help you work through complex and challenging experiences in a safe, confidential environment.`,
          suggestions: [
            'Explore how art can help express emotions in gentle ways',
            'Look at artwork that brings comfort and peace',
            'Practice mindful art appreciation',
            'Discuss what colors or shapes represent hope for you'
          ],
          resources: [
            {
              title: 'Crisis Text Line',
              description: 'Text HOME to 741741',
              icon: MessageSquare
            },
            {
              title: 'Psychology Today',
              description: 'Find therapists in your area',
              icon: Users,
              link: 'https://psychologytoday.com'
            },
            {
              title: 'National Suicide Prevention Lifeline',
              description: '988 (US) - 24/7 support',
              icon: Phone
            }
          ]
        };

      case 'medical_advice':
        return {
          title: 'I Care About Your Health',
          subtitle: 'Let me guide you to the right resources',
          icon: Shield,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          message: `I'm not qualified to provide medical or psychological advice, and I want to make sure you get the best care possible.

For questions about mental health treatment, medication, diagnosis, or any medical concerns, please speak with a healthcare provider or mental health professional who can give you accurate, personalized guidance.

Your health and wellbeing are too important to leave to chance - you deserve expert care from qualified professionals.`,
          suggestions: [
            'Explore artwork that resonates with your current mood',
            'Discuss what art styles make you feel peaceful',
            'Share what creative activities bring you joy',
            'Talk about colors that represent healing to you'
          ],
          resources: [
            {
              title: 'Find a Healthcare Provider',
              description: 'Psychology Today therapist directory',
              icon: Users,
              link: 'https://psychologytoday.com'
            },
            {
              title: 'Crisis Support',
              description: '988 Suicide & Crisis Lifeline',
              icon: Phone
            },
            {
              title: 'Online Therapy',
              description: 'BetterHelp, Talkspace, etc.',
              icon: MessageSquare,
              link: 'https://betterhelp.com'
            }
          ]
        };

      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  const { title, subtitle, icon: Icon, iconColor, bgColor, borderColor, message, suggestions, resources } = content;

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
          className=\"bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto\"
        >
          {/* Header */}
          <div className={`${bgColor} ${borderColor} border-b p-6 rounded-t-xl`}>
            <div className=\"flex items-center justify-between\">
              <div className=\"flex items-center\">
                <Icon className={`w-8 h-8 ${iconColor} mr-3`} />
                <div>
                  <h2 className=\"text-xl font-bold text-gray-900\">{title}</h2>
                  <p className=\"text-gray-600\">{subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className=\"text-gray-400 hover:text-gray-600 transition-colors\"
              >
                <X className=\"w-6 h-6\" />
              </button>
            </div>
          </div>

          <div className=\"p-6\">
            {/* Main Message */}
            <div className=\"mb-6\">
              <p className=\"text-gray-700 leading-relaxed whitespace-pre-line\">
                {message}
              </p>
            </div>

            {/* Professional Resources */}
            <div className=\"mb-6\">
              <h3 className=\"font-semibold text-gray-900 mb-3 flex items-center\">
                <Users className=\"w-5 h-5 mr-2 text-green-500\" />
                Professional Resources
              </h3>
              <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
                {resources.map((resource, index) => (
                  <div
                    key={index}
                    className=\"bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors\"
                  >
                    <div className=\"flex items-start\">
                      <resource.icon className=\"w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0\" />
                      <div>
                        <h4 className=\"font-medium text-gray-900 text-sm\">{resource.title}</h4>
                        <p className=\"text-xs text-gray-600 mt-1\">{resource.description}</p>
                        {resource.link && (
                          <a
                            href={resource.link}
                            target=\"_blank\"
                            rel=\"noopener noreferrer\"
                            className=\"text-blue-600 hover:text-blue-700 text-xs font-medium mt-1 inline-flex items-center\"
                          >
                            Visit <ExternalLink className=\"w-3 h-3 ml-1\" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Art-Based Alternatives */}
            <div className=\"mb-6\">
              <h3 className=\"font-semibold text-gray-900 mb-3 flex items-center\">
                <Palette className=\"w-5 h-5 mr-2 text-purple-500\" />
                Let's Try Art Instead
              </h3>
              <div className=\"bg-purple-50 border border-purple-200 rounded-lg p-4\">
                <p className=\"text-purple-800 text-sm mb-3\">
                  Here are some gentle ways we can explore your feelings through art:
                </p>
                <ul className=\"space-y-2\">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className=\"flex items-start text-sm text-purple-700\">
                      <div className=\"w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0\" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className=\"flex flex-col sm:flex-row gap-3\">
              <button
                onClick={onClose}
                className=\"flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors\"
              >
                <Palette className=\"w-5 h-5 inline mr-2\" />
                Continue with Art
              </button>
              <a
                href=\"tel:988\"
                className=\"flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium text-center hover:bg-green-700 transition-colors\"
              >
                <Phone className=\"w-5 h-5 inline mr-2\" />
                Get Professional Help
              </a>
            </div>

            {/* Footer Note */}
            <div className=\"mt-6 text-center\">
              <p className=\"text-xs text-gray-500\">
                Remember: Seeking professional help is a sign of strength, not weakness.
                You deserve support that matches your needs.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}