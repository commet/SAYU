const { logger } = require('../utils/logger');

/**
 * Safety Service for Art Counselor
 * Implements content filtering, crisis detection, and safety measures
 */
class SafetyService {
    constructor() {
        // Crisis keywords and patterns (multiple languages)
        this.crisisKeywords = [
            // English
            'suicide', 'kill myself', 'want to die', 'end it all', 'not worth living',
            'self harm', 'cut myself', 'hurt myself', 'suicide plan', 'goodbye world',
            'overdose', 'jump off', 'hang myself', 'can\'t go on', 'hopeless',

            // Spanish
            'suicidio', 'matarme', 'quiero morir', 'acabar con todo', 'no vale la pena vivir',

            // French
            'suicide', 'me tuer', 'veux mourir', 'en finir', 'ne vaut pas la peine',

            // German
            'selbstmord', 'mich umbringen', 'sterben wollen', 'alles beenden',

            // More patterns
            'i want to hurt myself', 'planning my death', 'saying goodbye',
            'life insurance', 'will and testament', 'final message'
        ];

        // Heavy topic patterns to redirect
        this.heavyTopicPatterns = [
            /\b(abuse|abused|molest|assault|rape|trauma|ptsd)\b/i,
            /\b(addiction|alcoholic|drug use|overdose|withdraw)\b/i,
            /\b(eating disorder|anorexia|bulimia|starving myself)\b/i,
            /\b(self.?harm|cutting|burning myself|hurting myself)\b/i,
            /\b(violent|violence|hit|beat|punch|fight)\b/i
        ];

        // Medical/psychological advice patterns
        this.medicalAdvicePatterns = [
            /\b(diagnose|diagnosis|medication|prescribe|doctor|therapist|treatment)\b/i,
            /\b(depression|anxiety|bipolar|schizophrenia|disorder|syndrome)\b/i,
            /\b(what medication|should i take|medical advice|psychological evaluation)\b/i
        ];

        // Crisis resources by region/language
        this.crisisResources = {
            'en-US': {
                hotline: '988 (Suicide & Crisis Lifeline)',
                text: 'Text HOME to 741741 (Crisis Text Line)',
                chat: 'suicidepreventionlifeline.org/chat',
                emergency: '911'
            },
            'en-GB': {
                hotline: '116 123 (Samaritans)',
                text: 'Text SHOUT to 85258',
                chat: 'samaritans.org',
                emergency: '999'
            },
            'es': {
                hotline: '1-888-628-9454 (Spanish National Suicide Prevention Lifeline)',
                text: 'Text "HOLA" to 741741',
                emergency: '112'
            },
            'global': {
                hotline: 'International Association for Suicide Prevention: iasp.info/resources/Crisis_Centres',
                emergency: 'Local emergency services'
            }
        };

        this.sessionLimits = {
            maxDurationMinutes: 30,
            maxMessagesPerSession: 50,
            cooldownMinutes: 10
        };
    }

    /**
     * Analyze message for crisis indicators and safety concerns
     */
    async analyzeMessageSafety(message, userId = null) {
        const analysis = {
            isCrisis: false,
            isHeavyTopic: false,
            isMedicalAdvice: false,
            riskLevel: 'low', // low, medium, high, crisis
            triggers: [],
            recommendations: [],
            shouldRedirect: false,
            redirectReason: null
        };

        // 1. Crisis detection
        const crisisScore = this.detectCrisisIndicators(message);
        if (crisisScore >= 0.7) {
            analysis.isCrisis = true;
            analysis.riskLevel = 'crisis';
            analysis.triggers.push('crisis_keywords');
            analysis.recommendations.push('immediate_crisis_resources');
        } else if (crisisScore >= 0.4) {
            analysis.riskLevel = 'high';
            analysis.triggers.push('concerning_language');
            analysis.recommendations.push('professional_help_suggestion');
        }

        // 2. Heavy topic detection
        if (this.containsHeavyTopics(message)) {
            analysis.isHeavyTopic = true;
            analysis.shouldRedirect = true;
            analysis.redirectReason = 'heavy_topic';
            analysis.recommendations.push('gentle_redirect_to_professionals');
        }

        // 3. Medical advice request detection
        if (this.requestsMedicalAdvice(message)) {
            analysis.isMedicalAdvice = true;
            analysis.shouldRedirect = true;
            analysis.redirectReason = 'medical_advice';
            analysis.recommendations.push('redirect_to_healthcare_provider');
        }

        // 4. Log concerning content (anonymized)
        if (analysis.riskLevel !== 'low') {
            logger.warn('Content safety concern detected', {
                userId: userId ? 'user_' + userId.slice(-4) : 'anonymous',
                riskLevel: analysis.riskLevel,
                triggers: analysis.triggers,
                messageLength: message.length,
                timestamp: new Date().toISOString()
            });
        }

        return analysis;
    }

    /**
     * Detect crisis indicators in message
     */
    detectCrisisIndicators(message) {
        const lowerMessage = message.toLowerCase();
        let score = 0;
        let matchCount = 0;

        // Direct keyword matches
        for (const keyword of this.crisisKeywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                score += 0.3;
                matchCount++;
            }
        }

        // Pattern-based detection
        const crisisPatterns = [
            /\bi\s+(want|need|have)\s+to\s+(die|kill|end)/i,
            /\blife\s+(isn't|is\s+not)\s+worth/i,
            /\bno\s+point\s+(in\s+)?living/i,
            /\beveryone\s+would\s+be\s+better\s+without\s+me/i,
            /\bplanning\s+(my|to)\s+(death|suicide)/i
        ];

        for (const pattern of crisisPatterns) {
            if (pattern.test(message)) {
                score += 0.4;
                matchCount++;
            }
        }

        // Adjust score based on match density
        const density = matchCount / Math.max(message.split(' ').length, 1);
        if (density > 0.1) score += 0.2;

        return Math.min(score, 1.0);
    }

    /**
     * Check for heavy topics that require professional help
     */
    containsHeavyTopics(message) {
        return this.heavyTopicPatterns.some(pattern => pattern.test(message));
    }

    /**
     * Check if message requests medical/psychological advice
     */
    requestsMedicalAdvice(message) {
        return this.medicalAdvicePatterns.some(pattern => pattern.test(message));
    }

    /**
     * Get crisis resources for user's region/language
     */
    getCrisisResources(locale = 'en-US') {
        return this.crisisResources[locale] || this.crisisResources['global'];
    }

    /**
     * Generate safe response for crisis situations
     */
    generateCrisisResponse(analysis, locale = 'en-US') {
        const resources = this.getCrisisResources(locale);

        if (analysis.isCrisis) {
            return {
                message: `I'm really concerned about what you're sharing. Your safety is the most important thing right now. Please reach out for immediate help:

🚨 **Crisis Hotline**: ${resources.hotline}
💬 **Crisis Text**: ${resources.text || 'Available in your region'}
🌐 **Online Chat**: ${resources.chat || 'Crisis support available online'}
🚑 **Emergency**: ${resources.emergency}

You don't have to go through this alone. There are people who want to help you right now.`,
                shouldEndSession: true,
                requiresImmediate: true
            };
        }

        if (analysis.shouldRedirect) {
            return {
                message: this.getRedirectMessage(analysis.redirectReason),
                shouldLimit: true,
                suggestProfessionalHelp: true
            };
        }

        return null;
    }

    /**
     * Get appropriate redirect message
     */
    getRedirectMessage(reason) {
        const messages = {
            heavy_topic: `I can hear that you're dealing with something really difficult. While I'm here to support you through art and creativity, what you're sharing sounds like it would benefit from speaking with a professional counselor or therapist who can provide the specialized support you deserve.

Would you like to explore how art can help you express emotions in a gentler way instead?`,

            medical_advice: `I'm not qualified to provide medical or psychological advice, and I want to make sure you get the best care possible. For questions about mental health treatment, medication, or diagnosis, please speak with a healthcare provider or mental health professional.

I'm here to support you through art appreciation and creative expression. How are you feeling right now, and would you like to explore some artwork that might resonate with your current mood?`
        };

        return messages[reason] || messages.heavy_topic;
    }

    /**
     * Check session limits and safety
     */
    checkSessionLimits(sessionData) {
        const now = new Date();
        const sessionStart = new Date(sessionData.started_at);
        const durationMinutes = (now - sessionStart) / (1000 * 60);

        return {
            exceedsTimeLimit: durationMinutes > this.sessionLimits.maxDurationMinutes,
            exceedsMessageLimit: sessionData.messageCount > this.sessionLimits.maxMessagesPerSession,
            shouldWarn: durationMinutes > (this.sessionLimits.maxDurationMinutes * 0.8),
            remainingTime: Math.max(0, this.sessionLimits.maxDurationMinutes - durationMinutes)
        };
    }

    /**
     * Generate session limit warning
     */
    generateSessionLimitWarning(limits) {
        if (limits.exceedsTimeLimit || limits.exceedsMessageLimit) {
            return `Our conversation has been going for a while now. For your wellbeing, I recommend taking a break. Art therapy works best when we process things gradually.

Feel free to return anytime, and remember that if you need immediate support, professional counselors are available 24/7.`;
        }

        if (limits.shouldWarn) {
            return `We've been chatting for about ${Math.round(this.sessionLimits.maxDurationMinutes - limits.remainingTime)} minutes. I want to make sure you're taking care of yourself. How are you feeling right now?`;
        }

        return null;
    }

    /**
     * Validate age compliance (13+ requirement)
     */
    validateAgeCompliance(birthYear) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;

        return {
            isCompliant: age >= 13,
            requiresParentalConsent: age < 18,
            age: age
        };
    }
}

module.exports = new SafetyService();