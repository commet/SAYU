'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Palette, Brain, Heart, Trophy, ArrowRight, X, Users, Camera, Coffee, Briefcase } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  onPurposeSelected?: (purpose: string) => void;
}

export function WelcomeModal({ isOpen, onClose, userName, onPurposeSelected }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPurpose, setSelectedPurpose] = useState<string>('');

  const purposeOptions = [
    { 
      id: 'exploring', 
      icon: <Camera className="w-8 h-8" />, 
      title: '예술 탐험', 
      description: '새로운 예술 경험을 발견하고 싶어요' 
    },
    { 
      id: 'dating', 
      icon: <Heart className="w-8 h-8" />, 
      title: '의미있는 만남', 
      description: '예술을 통해 특별한 사람을 만나고 싶어요' 
    },
    { 
      id: 'social', 
      icon: <Users className="w-8 h-8" />, 
      title: '친구 만들기', 
      description: '예술을 함께 즐길 친구들을 찾고 있어요' 
    },
    { 
      id: 'family', 
      icon: <Coffee className="w-8 h-8" />, 
      title: '가족과 함께', 
      description: '가족과 함께 문화생활을 즐기고 싶어요' 
    },
    { 
      id: 'professional', 
      icon: <Briefcase className="w-8 h-8" />, 
      title: '전문적 네트워킹', 
      description: '예술 분야 전문가들과 교류하고 싶어요' 
    }
  ];

  const steps = [
    {
      icon: <Sparkles className="w-12 h-12 text-purple-400" />,
      title: `Welcome to SAYU${userName ? ', ' + userName : ''}!`,
      description: "You're about to discover your unique aesthetic personality through our scientifically-designed assessment.",
      image: "/images/onboarding/welcome.png"
    },
    {
      icon: <Heart className="w-12 h-12 text-pink-400" />,
      title: "SAYU를 통해 무엇을 하고 싶나요?",
      description: "당신의 목적에 맞는 최적의 경험을 제공해드릴게요.",
      purposeSelection: true
    },
    {
      icon: <Brain className="w-12 h-12 text-blue-400" />,
      title: "Two-Part Assessment",
      description: "First, we'll explore how you experience art galleries, then discover what types of art resonate with your soul.",
      bullets: [
        "Exhibition preferences (5 minutes)",
        "Artwork preferences (5 minutes)",
        "Instant personality profile generation"
      ]
    },
    {
      icon: <Palette className="w-12 h-12 text-pink-400" />,
      title: "Your Personalized Experience",
      description: "Based on your responses, we'll create a unique profile from 128 possible aesthetic personalities.",
      bullets: [
        "AI-generated profile artwork",
        "Personalized UI theme",
        "Curated art recommendations"
      ]
    },
    {
      icon: <Heart className="w-12 h-12 text-red-400" />,
      title: "AI Curator & Community",
      description: "Chat with an AI curator who understands your taste, and connect with others who share your aesthetic vision.",
      bullets: [
        "24/7 AI art companion",
        "Weekly insight reports",
        "Achievement system"
      ]
    },
    {
      icon: <Trophy className="w-12 h-12 text-yellow-400" />,
      title: "Ready to Begin?",
      description: "Your journey to aesthetic self-discovery starts now. The assessment takes about 10 minutes.",
      cta: true
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (selectedPurpose && onPurposeSelected) {
        onPurposeSelected(selectedPurpose);
      }
      onClose();
    }
  };

  const handlePurposeSelect = (purpose: string) => {
    setSelectedPurpose(purpose);
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleSkip()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Progress Bar */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm text-gray-400">Getting Started</h3>
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-purple-500' : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="flex justify-center mb-6">
                  {currentStepData.icon}
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">
                  {currentStepData.title}
                </h2>

                <p className="text-gray-300 text-lg mb-6">
                  {currentStepData.description}
                </p>

                {currentStepData.bullets && (
                  <ul className="text-left max-w-md mx-auto mb-8 space-y-3">
                    {currentStepData.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start text-gray-400">
                        <span className="text-purple-400 mr-2">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {currentStepData.image && (
                  <img
                    src={currentStepData.image}
                    alt={currentStepData.title}
                    className="rounded-lg mx-auto mb-8 max-w-full"
                  />
                )}

                {currentStepData.purposeSelection && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {purposeOptions.map((option) => (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePurposeSelect(option.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedPurpose === option.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`${selectedPurpose === option.id ? 'text-purple-400' : 'text-gray-400'}`}>
                            {option.icon}
                          </div>
                          <h3 className={`font-semibold ${selectedPurpose === option.id ? 'text-white' : 'text-gray-200'}`}>
                            {option.title}
                          </h3>
                        </div>
                        <p className={`text-sm ${selectedPurpose === option.id ? 'text-gray-300' : 'text-gray-400'}`}>
                          {option.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-800 flex justify-between">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-400 hover:text-white"
              >
                Skip Tour
              </Button>

              <div className="flex gap-3">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={currentStepData.purposeSelection && !selectedPurpose}
                  className={
                    currentStepData.cta
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : ''
                  }
                >
                  {currentStepData.cta ? "Start Assessment" : "Next"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}