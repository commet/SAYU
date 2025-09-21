const { pool } = require('../config/database');
const OpenAI = require('openai');
const { logger } = require('../utils/logger');
const safetyService = require('./safetyService');

class ArtCounselorService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // Memory window for conversation context
        this.contextWindow = 10; // Last 10 messages
        this.embeddingModel = 'text-embedding-3-small';
        this.chatModel = 'gpt-4-turbo-preview';
    }

    /**
     * Start or continue an art therapy session
     */
    async startSession(userId, sessionType = 'general', initialEmotion = null) {
        try {
            const client = await pool.connect();

            // Create new session
            const sessionQuery = `
                INSERT INTO art_counselor_sessions (
                    user_id, session_type, initial_emotion_state, started_at
                ) VALUES ($1, $2, $3, $4)
                RETURNING id, started_at
            `;

            const sessionResult = await client.query(sessionQuery, [
                userId,
                sessionType,
                initialEmotion || {},
                new Date()
            ]);

            const sessionId = sessionResult.rows[0].id;

            // Get user's emotional profile and personality for context
            const profileQuery = `
                SELECT
                    uep.*,
                    u.personality_type,
                    cup.preferred_counselor_persona,
                    cup.communication_formality,
                    cup.preferred_therapeutic_approaches
                FROM user_emotional_profiles uep
                LEFT JOIN users u ON u.id = uep.user_id
                LEFT JOIN counselor_user_preferences cup ON cup.user_id = uep.user_id
                WHERE uep.user_id = $1
            `;

            const profileResult = await client.query(profileQuery, [userId]);
            let userProfile = profileResult.rows[0];

            // Create default profile if doesn't exist
            if (!userProfile) {
                await this.createDefaultEmotionalProfile(userId, client);
                const defaultResult = await client.query(profileQuery, [userId]);
                userProfile = defaultResult.rows[0];
            }

            // Generate personalized welcome message
            const welcomeMessage = await this.generateWelcomeMessage(userProfile, sessionType);

            // Store welcome message in conversation memory
            await this.storeConversationMemory(sessionId, userId, 'counselor', welcomeMessage, client);

            client.release();

            return {
                sessionId,
                welcomeMessage,
                userProfile: {
                    personalityType: userProfile.personality_type,
                    currentEmotions: userProfile.current_emotions,
                    dominantEmotion: userProfile.dominant_emotion,
                    therapeuticGoals: userProfile.therapeutic_goals
                }
            };

        } catch (error) {
            logger.error('Error starting counselor session:', error);
            throw new Error('Failed to start counseling session');
        }
    }

    /**
     * Process user message and generate counselor response using RAG with safety
     */
    async processMessage(sessionId, userId, userMessage, artworkContext = null) {
        try {
            const client = await pool.connect();

            // 1. Safety analysis first
            const safetyAnalysis = await safetyService.analyzeMessageSafety(userMessage, userId);

            // 2. Handle crisis situations immediately
            if (safetyAnalysis.isCrisis) {
                const crisisResponse = safetyService.generateCrisisResponse(
                    safetyAnalysis,
                    'en-US' // Could be determined from user settings
                );

                // Log crisis intervention
                await client.query(`
                    INSERT INTO crisis_interventions (
                        user_id, risk_level, triggers, message_excerpt,
                        intervention_type, resources_provided
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    userId,
                    'crisis',
                    safetyAnalysis.triggers,
                    userMessage.substring(0, 200),
                    'crisis_response',
                    safetyAnalysis.recommendations
                ]);

                client.release();
                return {
                    response: crisisResponse.message,
                    isCrisisIntervention: true,
                    sessionEnded: true,
                    crisisResources: safetyService.getCrisisResources('en-US')
                };
            }

            // 3. Handle boundary redirections
            if (safetyAnalysis.shouldRedirect) {
                const redirectResponse = safetyService.generateCrisisResponse(safetyAnalysis);

                client.release();
                return {
                    response: redirectResponse.message,
                    isRedirection: true,
                    shouldLimitResponse: true,
                    professionalHelpSuggested: true
                };
            }

            // 4. Detect emotions in user message (if safe to proceed)
            const emotionAnalysis = await this.analyzeEmotions(userMessage);

            // 2. Store user message with emotion analysis
            await this.storeConversationMemory(
                sessionId,
                userId,
                'user',
                userMessage,
                client,
                {
                    emotion_detected: emotionAnalysis,
                    artwork_context_id: artworkContext?.id
                }
            );

            // 3. Retrieve relevant conversation history using vector similarity
            const relevantMemories = await this.retrieveRelevantMemories(userId, userMessage, client);

            // 4. Get current session context
            const sessionContext = await this.getSessionContext(sessionId, client);

            // 5. Get user's therapeutic profile for personalization
            const userProfile = await this.getUserTherapeuticProfile(userId, client);

            // 6. Generate counselor response using RAG
            const counselorResponse = await this.generateCounselorResponse({
                userMessage,
                emotionAnalysis,
                relevantMemories,
                sessionContext,
                userProfile,
                artworkContext
            });

            // 7. Store counselor response with safety metadata
            await this.storeConversationMemory(
                sessionId,
                userId,
                'counselor',
                counselorResponse.content,
                client,
                {
                    therapeutic_theme: counselorResponse.theme,
                    counselor_technique: counselorResponse.technique,
                    memory_importance: counselorResponse.importance,
                    safety_analysis: safetyAnalysis
                }
            );

            // 8. Update session insights
            await this.updateSessionInsights(sessionId, counselorResponse.insights, client);

            client.release();

            return {
                response: counselorResponse.content,
                emotionDetected: emotionAnalysis,
                therapeuticTheme: counselorResponse.theme,
                suggestedActions: counselorResponse.suggestedActions,
                artworkRecommendations: counselorResponse.artworkRecommendations,
                safetyDisclaimer: "I'm an AI companion, not a replacement for professional therapy."
            };

        } catch (error) {
            logger.error('Error processing counselor message:', error);
            throw new Error('Failed to process message');
        }
    }

    /**
     * Analyze emotions in text using OpenAI
     */
    async analyzeEmotions(text) {
        try {
            const prompt = `
                Analyze the emotional content of this message and return a JSON object with:
                1. Primary emotions (joy, sadness, anger, fear, surprise, disgust, trust, anticipation) with intensity 0-1
                2. Emotional intensity overall (0-1)
                3. Therapeutic indicators (anxiety, depression, stress, hope, growth, healing)
                4. Urgency level (low, medium, high, crisis)

                Message: "${text}"

                Return only valid JSON:
            `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 300
            });

            return JSON.parse(response.choices[0].message.content);

        } catch (error) {
            logger.error('Error analyzing emotions:', error);
            return {
                primary_emotions: { neutral: 0.5 },
                emotional_intensity: 0.5,
                therapeutic_indicators: {},
                urgency_level: 'low'
            };
        }
    }

    /**
     * Retrieve relevant conversation memories using vector similarity
     */
    async retrieveRelevantMemories(userId, queryText, client) {
        try {
            // Generate embedding for query
            const queryEmbedding = await this.generateEmbedding(queryText);

            // Search for similar conversations
            const memoryQuery = `
                SELECT
                    content,
                    message_type,
                    emotion_detected,
                    therapeutic_theme,
                    memory_importance,
                    created_at,
                    1 - (content_embedding <=> $1::vector) as similarity
                FROM counselor_conversation_memory
                WHERE user_id = $2
                    AND content_embedding IS NOT NULL
                ORDER BY content_embedding <=> $1::vector
                LIMIT 5
            `;

            const result = await client.query(memoryQuery, [queryEmbedding, userId]);
            return result.rows.filter(row => row.similarity > 0.7); // Only highly relevant memories

        } catch (error) {
            logger.error('Error retrieving memories:', error);
            return [];
        }
    }

    /**
     * Generate counselor response using RAG and therapeutic principles
     */
    async generateCounselorResponse({
        userMessage,
        emotionAnalysis,
        relevantMemories,
        sessionContext,
        userProfile,
        artworkContext
    }) {
        try {
            // Build context from relevant memories
            const memoryContext = relevantMemories
                .map(m => `${m.message_type}: ${m.content} (Theme: ${m.therapeutic_theme})`)
                .join('\n');

            // Construct personalized system prompt
            const systemPrompt = this.buildTherapeuticSystemPrompt(userProfile, sessionContext);

            // Build user context
            const userContext = `
                Current message: "${userMessage}"

                Detected emotions: ${JSON.stringify(emotionAnalysis)}

                Relevant conversation history:
                ${memoryContext}

                ${artworkContext ? `Artwork being discussed: ${artworkContext.title} by ${artworkContext.artist}` : ''}

                User's therapeutic goals: ${userProfile.therapeutic_goals?.join(', ') || 'General wellbeing'}
                User's personality type: ${userProfile.personality_type}
                Current emotional state: ${JSON.stringify(userProfile.current_emotions)}
            `;

            const response = await this.openai.chat.completions.create({
                model: this.chatModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContext }
                ],
                temperature: 0.7,
                max_tokens: 800
            });

            const content = response.choices[0].message.content;

            // Parse structured response
            return this.parseTherapeuticResponse(content, emotionAnalysis);

        } catch (error) {
            logger.error('Error generating counselor response:', error);
            return {
                content: "I'm here to listen and support you. Could you tell me more about what you're experiencing?",
                theme: 'supportive_listening',
                technique: 'active_listening',
                importance: 0.5,
                insights: [],
                suggestedActions: [],
                artworkRecommendations: []
            };
        }
    }

    /**
     * Build therapeutic system prompt based on user profile
     */
    buildTherapeuticSystemPrompt(userProfile, sessionContext) {
        const personalityGuidance = this.getPersonalityBasedGuidance(userProfile.personality_type);
        const therapeuticApproach = userProfile.preferred_therapeutic_approaches?.join(', ') || 'person-centered therapy';

        return `
            You are MIYU, a compassionate AI art companion specialized in helping people explore their emotions through art.

            IMPORTANT SAFETY BOUNDARIES:
            - You are NOT a licensed therapist, psychologist, or medical professional
            - You cannot provide medical advice, diagnoses, or treatment recommendations
            - For crisis situations, always direct users to professional help immediately
            - Avoid discussing trauma details, abuse, or heavy clinical topics
            - Focus on present feelings and art-based emotional exploration

            THERAPEUTIC PRINCIPLES:
            - Use ${therapeuticApproach} approach within safe boundaries
            - Be empathetic, non-judgmental, and supportive
            - Help users explore emotions through art appreciation and creation
            - Validate feelings while gently encouraging growth
            - Use art as a bridge to emotional understanding
            - Always emphasize your role as a supportive companion, not a therapist

            USER CONTEXT:
            - Personality type: ${userProfile.personality_type}
            - Communication style: ${userProfile.communication_formality || 'casual'}
            - ${personalityGuidance}

            RESPONSE GUIDELINES:
            - Keep responses conversational and warm (150-300 words)
            - Ask open-ended questions to encourage reflection about art and current feelings
            - Reference relevant art when appropriate
            - Suggest gentle art-based coping strategies
            - If serious mental health concerns arise, kindly redirect to professional resources
            - Always include your identity as an AI companion in context
            - Focus on art appreciation rather than deep psychological analysis

            GLOBAL CONSIDERATIONS:
            - Avoid culturally specific references unless user indicates their culture
            - Use universal art themes and emotions
            - Be sensitive to different cultural perspectives on mental health
            - Provide crisis resources appropriate to user's region when needed

            Remember: You're a supportive AI companion focused on art and emotional wellness, not a replacement for professional mental health care.
        `;
    }

    /**
     * Get personality-specific therapeutic guidance
     */
    getPersonalityBasedGuidance(personalityType) {
        const guidance = {
            'LAEF': 'This user (Fox) is naturally curious and creative. Encourage exploration of abstract art and experimental expressions.',
            'LAEC': 'This user (Cat) appreciates beauty and harmony. Focus on aesthetically pleasing art and emotional resonance.',
            'LAMF': 'This user (Owl) seeks depth and meaning. Discuss symbolism and philosophical aspects of art.',
            'LAMC': 'This user (Turtle) values tradition and stability. Reference classical art and established techniques.',
            'LREF': 'This user (Chameleon) adapts easily. Introduce diverse art styles and cultural perspectives.',
            'LREC': 'This user (Hedgehog) is introspective. Focus on personal meaning and intimate artistic expression.',
            'LRMF': 'This user (Octopus) is complex and multifaceted. Explore layered meanings in art.',
            'LRMC': 'This user (Beaver) is practical. Connect art to real-life applications and tangible benefits.',
            'SAEF': 'This user (Butterfly) is socially aware and transformative. Discuss art\'s social impact.',
            'SAEC': 'This user (Penguin) values community. Explore collaborative art and shared experiences.',
            'SAMF': 'This user (Parrot) is expressive and communicative. Encourage narrative and storytelling through art.',
            'SAMC': 'This user (Deer) is gentle and nurturing. Focus on healing and calming artistic expressions.',
            'SREF': 'This user (Dog) is loyal and energetic. Use dynamic art to channel emotions.',
            'SREC': 'This user (Duck) is adaptable and social. Explore community art projects and social themes.',
            'SRMF': 'This user (Elephant) has strong memory and wisdom. Connect past artistic experiences to current growth.',
            'SRMC': 'This user (Eagle) has broad perspective. Discuss art\'s universal themes and cultural significance.'
        };

        return guidance[personalityType] || 'Adapt your approach to this user\'s unique perspective and needs.';
    }

    /**
     * Parse structured therapeutic response
     */
    parseTherapeuticResponse(content, emotionAnalysis) {
        // Extract insights and suggestions from response
        const insights = [];
        const suggestedActions = [];
        const artworkRecommendations = [];

        // Determine therapeutic theme based on emotion analysis
        const theme = this.determineTherapeuticTheme(emotionAnalysis);

        // Determine counselor technique used
        const technique = this.determineCounselorTechnique(content);

        // Calculate memory importance
        const importance = this.calculateMemoryImportance(emotionAnalysis, content);

        return {
            content,
            theme,
            technique,
            importance,
            insights,
            suggestedActions,
            artworkRecommendations
        };
    }

    /**
     * Generate daily personalized art recommendation
     */
    async generateDailyArtRecommendation(userId) {
        try {
            const client = await pool.connect();

            // Get user's current emotional state and preferences
            const userQuery = `
                SELECT
                    uep.*,
                    u.personality_type,
                    cup.preferred_therapeutic_approaches
                FROM user_emotional_profiles uep
                JOIN users u ON u.id = uep.user_id
                LEFT JOIN counselor_user_preferences cup ON cup.user_id = uep.user_id
                WHERE uep.user_id = $1
            `;

            const userResult = await client.query(userQuery, [userId]);
            const userProfile = userResult.rows[0];

            if (!userProfile) {
                throw new Error('User profile not found');
            }

            // Analyze recent emotional patterns
            const recentEmotions = await this.analyzeRecentEmotionalPatterns(userId, client);

            // Get artwork recommendation from AI
            const recommendation = await this.getAIArtworkRecommendation({
                personalityType: userProfile.personality_type,
                currentEmotions: userProfile.current_emotions,
                recentPatterns: recentEmotions,
                therapeuticGoals: userProfile.therapeutic_goals,
                preferredStyles: userProfile.preferred_art_styles
            });

            // Store recommendation
            const recQuery = `
                INSERT INTO daily_art_recommendations (
                    user_id, recommendation_date, recommendation_reason,
                    therapeutic_goal, artwork_id, artwork_data,
                    user_emotional_state, apt_personality_factor
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `;

            const recResult = await client.query(recQuery, [
                userId,
                new Date().toISOString().split('T')[0],
                recommendation.reason,
                recommendation.therapeuticGoal,
                recommendation.artworkId,
                recommendation.artworkData,
                userProfile.current_emotions,
                { personalityType: userProfile.personality_type }
            ]);

            client.release();

            return {
                id: recResult.rows[0].id,
                ...recommendation
            };

        } catch (error) {
            logger.error('Error generating daily art recommendation:', error);
            throw new Error('Failed to generate daily recommendation');
        }
    }

    /**
     * Store conversation memory with vector embedding
     */
    async storeConversationMemory(sessionId, userId, messageType, content, client, metadata = {}) {
        try {
            // Generate embedding for content
            const embedding = await this.generateEmbedding(content);

            const query = `
                INSERT INTO counselor_conversation_memory (
                    session_id, user_id, message_type, content, content_embedding,
                    emotion_detected, artwork_context_id, therapeutic_theme,
                    counselor_technique, memory_importance, memory_tags
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id
            `;

            const values = [
                sessionId,
                userId,
                messageType,
                content,
                embedding,
                metadata.emotion_detected || null,
                metadata.artwork_context_id || null,
                metadata.therapeutic_theme || null,
                metadata.counselor_technique || null,
                metadata.memory_importance || 0.5,
                metadata.memory_tags || []
            ];

            const result = await client.query(query, values);
            return result.rows[0].id;

        } catch (error) {
            logger.error('Error storing conversation memory:', error);
            throw error;
        }
    }

    /**
     * Generate text embedding using OpenAI
     */
    async generateEmbedding(text) {
        try {
            const response = await this.openai.embeddings.create({
                model: this.embeddingModel,
                input: text,
                encoding_format: 'float'
            });

            return JSON.stringify(response.data[0].embedding);

        } catch (error) {
            logger.error('Error generating embedding:', error);
            return null;
        }
    }

    /**
     * Create default emotional profile for new users
     */
    async createDefaultEmotionalProfile(userId, client) {
        const query = `
            INSERT INTO user_emotional_profiles (
                user_id, current_emotions, dominant_emotion,
                emotional_patterns, therapeutic_goals, conversation_style
            ) VALUES ($1, $2, $3, $4, $5, $6)
        `;

        await client.query(query, [
            userId,
            { neutral: 0.7, curious: 0.3 },
            'neutral',
            {},
            ['general_wellbeing', 'emotional_awareness'],
            'supportive'
        ]);
    }

    // Helper methods
    determineTherapeuticTheme(emotionAnalysis) {
        const { primary_emotions, urgency_level } = emotionAnalysis;

        if (urgency_level === 'crisis') return 'crisis_support';
        if (primary_emotions.sadness > 0.7) return 'grief_processing';
        if (primary_emotions.anxiety > 0.6) return 'anxiety_management';
        if (primary_emotions.joy > 0.6) return 'joy_celebration';
        if (primary_emotions.anger > 0.6) return 'anger_processing';

        return 'general_support';
    }

    determineCounselorTechnique(content) {
        if (content.includes('?')) return 'open_ended_questioning';
        if (content.includes('reflect') || content.includes('consider')) return 'reflection_encouragement';
        if (content.includes('art') || content.includes('create')) return 'art_therapy_guidance';
        if (content.includes('feel') || content.includes('emotion')) return 'emotional_validation';

        return 'active_listening';
    }

    calculateMemoryImportance(emotionAnalysis, content) {
        let importance = 0.5;

        // Higher importance for crisis or breakthrough moments
        if (emotionAnalysis.urgency_level === 'crisis') importance += 0.4;
        if (emotionAnalysis.urgency_level === 'high') importance += 0.2;

        // Higher importance for strong emotions
        const maxEmotion = Math.max(...Object.values(emotionAnalysis.primary_emotions || {}));
        importance += maxEmotion * 0.3;

        // Higher importance for therapeutic insights
        if (content.includes('insight') || content.includes('breakthrough')) importance += 0.2;

        return Math.min(importance, 1.0);
    }

    async getSessionContext(sessionId, client) {
        const query = `
            SELECT session_type, session_goal, initial_emotion_state,
                   conversation_summary, key_insights, started_at
            FROM art_counselor_sessions
            WHERE id = $1
        `;

        const result = await client.query(query, [sessionId]);
        return result.rows[0] || {};
    }

    async getUserTherapeuticProfile(userId, client) {
        const query = `
            SELECT
                uep.*,
                u.personality_type,
                cup.preferred_counselor_persona,
                cup.communication_formality,
                cup.preferred_therapeutic_approaches
            FROM user_emotional_profiles uep
            JOIN users u ON u.id = uep.user_id
            LEFT JOIN counselor_user_preferences cup ON cup.user_id = uep.user_id
            WHERE uep.user_id = $1
        `;

        const result = await client.query(query, [userId]);
        return result.rows[0] || {};
    }

    async updateSessionInsights(sessionId, insights, client) {
        const query = `
            UPDATE art_counselor_sessions
            SET key_insights = array_cat(COALESCE(key_insights, '{}'), $2),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `;

        await client.query(query, [sessionId, insights]);
    }
}

module.exports = new ArtCounselorService();