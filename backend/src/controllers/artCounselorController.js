const artCounselorService = require('../services/artCounselorService');
const supabaseArtService = require('../services/supabaseArtService');
const { pool } = require('../config/database');
const { logger } = require('../utils/logger');
const { validationResult } = require('express-validator');

class ArtCounselorController {
    /**
     * Start a new art therapy session
     */
    async startSession(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { userId } = req;
            const { sessionType = 'general', initialEmotion } = req.body;

            const session = await artCounselorService.startSession(
                userId,
                sessionType,
                initialEmotion
            );

            logger.info(`Art counselor session started for user ${userId}`, {
                sessionId: session.sessionId,
                sessionType
            });

            res.json({
                success: true,
                data: {
                    sessionId: session.sessionId,
                    welcomeMessage: session.welcomeMessage,
                    userProfile: session.userProfile,
                    sessionType
                }
            });

        } catch (error) {
            logger.error('Error starting counselor session:', error);
            res.status(500).json({
                success: false,
                message: '세션을 시작하는 중 오류가 발생했습니다.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Get session details and conversation history
     */
    async getSession(req, res) {
        try {
            const { sessionId } = req.params;
            const { userId } = req;

            const client = await pool.connect();

            // Get session details
            const sessionQuery = `
                SELECT
                    id, session_type, session_goal, initial_emotion_state,
                    final_emotion_state, conversation_summary, key_insights,
                    started_at, ended_at, user_satisfaction, helpfulness_rating
                FROM art_counselor_sessions
                WHERE id = $1 AND user_id = $2
            `;

            const sessionResult = await client.query(sessionQuery, [sessionId, userId]);

            if (sessionResult.rows.length === 0) {
                client.release();
                return res.status(404).json({
                    success: false,
                    message: '세션을 찾을 수 없습니다.'
                });
            }

            // Get conversation history
            const conversationQuery = `
                SELECT
                    message_type, content, emotion_detected,
                    therapeutic_theme, created_at
                FROM counselor_conversation_memory
                WHERE session_id = $1
                ORDER BY created_at ASC
            `;

            const conversationResult = await client.query(conversationQuery, [sessionId]);

            client.release();

            res.json({
                success: true,
                data: {
                    session: sessionResult.rows[0],
                    conversation: conversationResult.rows
                }
            });

        } catch (error) {
            logger.error('Error getting session:', error);
            res.status(500).json({
                success: false,
                message: '세션 정보를 가져오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Send message to counselor
     */
    async sendMessage(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { sessionId } = req.params;
            const { userId } = req;
            const { message, artworkContext } = req.body;

            // Verify session belongs to user
            const client = await pool.connect();
            const sessionCheck = await client.query(
                'SELECT user_id FROM art_counselor_sessions WHERE id = $1',
                [sessionId]
            );

            if (sessionCheck.rows.length === 0 || sessionCheck.rows[0].user_id !== userId) {
                client.release();
                return res.status(403).json({
                    success: false,
                    message: '접근 권한이 없습니다.'
                });
            }

            client.release();

            // Process message with counselor
            const response = await artCounselorService.processMessage(
                sessionId,
                userId,
                message,
                artworkContext
            );

            logger.info(`Counselor message processed for user ${userId}`, {
                sessionId,
                therapeuticTheme: response.therapeuticTheme
            });

            res.json({
                success: true,
                data: {
                    response: response.response,
                    emotionDetected: response.emotionDetected,
                    therapeuticTheme: response.therapeuticTheme,
                    suggestedActions: response.suggestedActions,
                    artworkRecommendations: response.artworkRecommendations
                }
            });

        } catch (error) {
            logger.error('Error processing counselor message:', error);
            res.status(500).json({
                success: false,
                message: '메시지를 처리하는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * End therapy session
     */
    async endSession(req, res) {
        try {
            const { sessionId } = req.params;
            const { userId } = req;
            const { finalEmotionalState, sessionSummary } = req.body;

            const client = await pool.connect();

            // Verify session belongs to user
            const sessionCheck = await client.query(
                'SELECT user_id FROM art_counselor_sessions WHERE id = $1',
                [sessionId]
            );

            if (sessionCheck.rows.length === 0 || sessionCheck.rows[0].user_id !== userId) {
                client.release();
                return res.status(403).json({
                    success: false,
                    message: '접근 권한이 없습니다.'
                });
            }

            // Update session with end details
            const updateQuery = `
                UPDATE art_counselor_sessions
                SET
                    ended_at = CURRENT_TIMESTAMP,
                    final_emotion_state = $2,
                    conversation_summary = COALESCE($3, conversation_summary)
                WHERE id = $1
                RETURNING ended_at
            `;

            const result = await client.query(updateQuery, [
                sessionId,
                finalEmotionalState || {},
                sessionSummary
            ]);

            client.release();

            logger.info(`Counselor session ended for user ${userId}`, { sessionId });

            res.json({
                success: true,
                data: {
                    sessionId,
                    endedAt: result.rows[0].ended_at
                }
            });

        } catch (error) {
            logger.error('Error ending session:', error);
            res.status(500).json({
                success: false,
                message: '세션을 종료하는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Get daily art recommendation
     */
    async getDailyArtRecommendation(req, res) {
        try {
            const { userId } = req;
            const today = new Date().toISOString().split('T')[0];

            const client = await pool.connect();

            // Check if recommendation already exists for today
            const existingQuery = `
                SELECT * FROM daily_art_recommendations
                WHERE user_id = $1 AND recommendation_date = $2
                ORDER BY created_at DESC
                LIMIT 1
            `;

            const existingResult = await client.query(existingQuery, [userId, today]);

            if (existingResult.rows.length > 0) {
                client.release();
                return res.json({
                    success: true,
                    data: existingResult.rows[0]
                });
            }

            client.release();

            // Generate new recommendation
            const recommendation = await artCounselorService.generateDailyArtRecommendation(userId);

            logger.info(`Daily art recommendation generated for user ${userId}`, {
                artworkId: recommendation.artworkId
            });

            res.json({
                success: true,
                data: recommendation
            });

        } catch (error) {
            logger.error('Error getting daily art recommendation:', error);
            res.status(500).json({
                success: false,
                message: '일일 추천 작품을 가져오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Mark daily recommendation as viewed
     */
    async markRecommendationViewed(req, res) {
        try {
            const { recommendationId } = req.params;
            const { userId } = req;
            const { interactionTimeSeconds = 0 } = req.body;

            const client = await pool.connect();

            const updateQuery = `
                UPDATE daily_art_recommendations
                SET
                    viewed = true,
                    viewed_at = CURRENT_TIMESTAMP,
                    interaction_time_seconds = $3
                WHERE id = $1 AND user_id = $2
                RETURNING id
            `;

            const result = await client.query(updateQuery, [
                recommendationId,
                userId,
                interactionTimeSeconds
            ]);

            if (result.rows.length === 0) {
                client.release();
                return res.status(404).json({
                    success: false,
                    message: '추천 항목을 찾을 수 없습니다.'
                });
            }

            client.release();

            res.json({
                success: true,
                data: { viewed: true, viewedAt: new Date() }
            });

        } catch (error) {
            logger.error('Error marking recommendation as viewed:', error);
            res.status(500).json({
                success: false,
                message: '추천 확인 처리 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Record emotional response to artwork
     */
    async recordEmotionalResponse(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { userId } = req;
            const {
                artworkId,
                artworkTitle,
                artworkArtist,
                artworkYear,
                emotionalResponse,
                responseIntensity,
                personalMeaning,
                sessionId
            } = req.body;

            const client = await pool.connect();

            const insertQuery = `
                INSERT INTO artwork_emotional_responses (
                    user_id, artwork_id, artwork_title, artwork_artist,
                    artwork_year, emotional_response, response_intensity,
                    personal_meaning, session_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id, created_at
            `;

            const result = await client.query(insertQuery, [
                userId,
                artworkId,
                artworkTitle,
                artworkArtist,
                artworkYear,
                emotionalResponse,
                responseIntensity,
                personalMeaning,
                sessionId
            ]);

            client.release();

            logger.info(`Emotional response recorded for user ${userId}`, {
                artworkId,
                responseId: result.rows[0].id
            });

            res.json({
                success: true,
                data: {
                    responseId: result.rows[0].id,
                    recordedAt: result.rows[0].created_at
                }
            });

        } catch (error) {
            logger.error('Error recording emotional response:', error);
            res.status(500).json({
                success: false,
                message: '감정 응답을 기록하는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Get conversation memory
     */
    async getConversationMemory(req, res) {
        try {
            const { userId } = req;
            const { sessionId, limit = 20, theme } = req.query;

            const client = await pool.connect();

            let query = `
                SELECT
                    id, session_id, message_type, content,
                    emotion_detected, therapeutic_theme,
                    created_at
                FROM counselor_conversation_memory
                WHERE user_id = $1
            `;

            const params = [userId];
            let paramCount = 1;

            if (sessionId) {
                paramCount++;
                query += ` AND session_id = $${paramCount}`;
                params.push(sessionId);
            }

            if (theme) {
                paramCount++;
                query += ` AND therapeutic_theme = $${paramCount}`;
                params.push(theme);
            }

            query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1}`;
            params.push(limit);

            const result = await client.query(query, params);
            client.release();

            res.json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            logger.error('Error getting conversation memory:', error);
            res.status(500).json({
                success: false,
                message: '대화 기록을 가져오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Get emotional profile
     */
    async getEmotionalProfile(req, res) {
        try {
            const { userId } = req;

            const client = await pool.connect();

            const profileQuery = `
                SELECT
                    uep.*,
                    cup.preferred_counselor_persona,
                    cup.communication_formality,
                    cup.preferred_therapeutic_approaches,
                    cup.crisis_support_enabled,
                    cup.trigger_warnings_enabled
                FROM user_emotional_profiles uep
                LEFT JOIN counselor_user_preferences cup ON cup.user_id = uep.user_id
                WHERE uep.user_id = $1
            `;

            const result = await client.query(profileQuery, [userId]);
            client.release();

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '감정 프로필을 찾을 수 없습니다.'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            logger.error('Error getting emotional profile:', error);
            res.status(500).json({
                success: false,
                message: '감정 프로필을 가져오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Provide crisis support
     */
    async provideCrisisSupport(req, res) {
        try {
            const { userId } = req;
            const { immediateNeed, safetyLevel, message } = req.body;

            // Log crisis request for monitoring
            logger.warn(`Crisis support requested by user ${userId}`, {
                immediateNeed,
                safetyLevel,
                timestamp: new Date()
            });

            // Get crisis resources based on user location/preferences
            const client = await pool.connect();

            const userQuery = `
                SELECT
                    cup.crisis_resources_region,
                    cup.emergency_contact_email,
                    up.location
                FROM counselor_user_preferences cup
                LEFT JOIN user_profiles up ON up.user_id = cup.user_id
                WHERE cup.user_id = $1
            `;

            const userResult = await client.query(userQuery, [userId]);
            const userPrefs = userResult.rows[0] || {};

            client.release();

            // Generate crisis response
            const crisisResponse = this.generateCrisisResponse(safetyLevel, userPrefs);

            // If immediate danger, also log for emergency protocols
            if (safetyLevel === 'immediate_danger') {
                logger.error(`EMERGENCY: User ${userId} indicated immediate danger`, {
                    message,
                    emergencyContact: userPrefs.emergency_contact_email
                });
            }

            res.json({
                success: true,
                data: {
                    response: crisisResponse.message,
                    resources: crisisResponse.resources,
                    emergencyContacts: crisisResponse.emergencyContacts,
                    recommendedActions: crisisResponse.actions
                }
            });

        } catch (error) {
            logger.error('Error providing crisis support:', error);
            res.status(500).json({
                success: false,
                message: '위기 지원을 제공하는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Health check for service
     */
    async healthCheck(req, res) {
        try {
            const client = await pool.connect();
            await client.query('SELECT 1');
            client.release();

            res.json({
                success: true,
                service: 'Art Counselor Service',
                status: 'healthy',
                timestamp: new Date(),
                version: '1.0.0'
            });

        } catch (error) {
            res.status(503).json({
                success: false,
                service: 'Art Counselor Service',
                status: 'unhealthy',
                error: error.message
            });
        }
    }

    /**
     * Generate crisis response based on safety level
     */
    generateCrisisResponse(safetyLevel, userPrefs) {
        const baseResources = [
            {
                name: '생명의전화',
                phone: '1588-9191',
                description: '24시간 상담 서비스'
            },
            {
                name: '청소년전화',
                phone: '1388',
                description: '청소년 위기상담'
            }
        ];

        switch (safetyLevel) {
            case 'immediate_danger':
                return {
                    message: '지금 당장 안전이 우려되는 상황이시군요. 즉시 전문가의 도움을 받으시기 바랍니다.',
                    resources: [
                        { name: '응급실', phone: '119', urgent: true },
                        { name: '경찰', phone: '112', urgent: true },
                        ...baseResources
                    ],
                    emergencyContacts: userPrefs.emergency_contact_email ? [userPrefs.emergency_contact_email] : [],
                    actions: [
                        '즉시 안전한 장소로 이동하세요',
                        '신뢰할 수 있는 사람에게 연락하세요',
                        '응급 서비스에 연락하는 것을 주저하지 마세요'
                    ]
                };

            case 'at_risk':
                return {
                    message: '힘든 상황을 겪고 계시는군요. 혼자 감당하지 마시고 도움을 요청하세요.',
                    resources: baseResources,
                    emergencyContacts: [],
                    actions: [
                        '신뢰할 수 있는 친구나 가족에게 이야기하세요',
                        '전문 상담사와 상담을 고려해보세요',
                        '규칙적인 생활패턴을 유지하세요'
                    ]
                };

            default:
                return {
                    message: '어려운 감정을 느끼고 계시는군요. 함께 이겨낼 수 있어요.',
                    resources: baseResources,
                    emergencyContacts: [],
                    actions: [
                        '깊게 숨을 쉬고 현재 순간에 집중하세요',
                        '좋아하는 예술작품을 감상해보세요',
                        '산책이나 가벼운 운동을 해보세요'
                    ]
                };
        }
    }

    /**
     * Get today's artwork recommendation (Supabase-based)
     */
    async getTodaysArtwork(req, res) {
        try {
            const { userId } = req;

            const result = await supabaseArtService.selectDailyArtwork(userId);

            logger.info(`Daily artwork selected for user ${userId}`, {
                artworkId: result.artworkId
            });

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            logger.error('Error getting today\'s artwork:', error);
            res.status(500).json({
                success: false,
                message: '오늘의 작품을 가져오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Generate artwork presentation (Supabase-based)
     */
    async getArtworkPresentation(req, res) {
        try {
            const { artworkId } = req.params;
            const { userId } = req;

            const presentation = await supabaseArtService.generatePresentation(artworkId, userId);

            logger.info(`Artwork presentation generated for user ${userId}`, {
                artworkId
            });

            res.json({
                success: true,
                data: presentation
            });

        } catch (error) {
            logger.error('Error generating artwork presentation:', error);
            res.status(500).json({
                success: false,
                message: '작품 프레젠테이션을 생성하는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Save journal entry (Supabase-based)
     */
    async saveJournalEntry(req, res) {
        try {
            const { userId } = req;
            const { artworkId, entry } = req.body;

            const result = await supabaseArtService.saveJournalEntry(userId, artworkId, entry);

            logger.info(`Journal entry saved for user ${userId}`, {
                artworkId,
                entryId: result.id
            });

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            logger.error('Error saving journal entry:', error);
            res.status(500).json({
                success: false,
                message: '감상 기록을 저장하는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Get user collection (Supabase-based)
     */
    async getUserCollection(req, res) {
        try {
            const { userId } = req;
            const { limit = 20 } = req.query;

            const collection = await supabaseArtService.getUserCollection(userId, parseInt(limit));

            res.json({
                success: true,
                data: collection
            });

        } catch (error) {
            logger.error('Error getting user collection:', error);
            res.status(500).json({
                success: false,
                message: '사용자 컬렉션을 가져오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Get all artworks (Supabase-based)
     */
    async getAllArtworks(req, res) {
        try {
            const artworks = await supabaseArtService.getAllArtworks();

            res.json({
                success: true,
                data: artworks
            });

        } catch (error) {
            logger.error('Error getting all artworks:', error);
            res.status(500).json({
                success: false,
                message: '작품 목록을 가져오는 중 오류가 발생했습니다.'
            });
        }
    }

    // ====================================
    // HYBRID SESSION ENDPOINTS
    // ====================================

    /**
     * Hybrid Opening - Get initial question and options for artwork
     * GET /api/art-counselor/hybrid/opening/:artworkId/:personality
     */
    async hybridOpening(req, res) {
        try {
            const { artworkId, personality } = req.params;
            const { userId } = req;

            // Get artwork info
            let artwork = null;
            try {
                artwork = await supabaseArtService.getArtworkById(artworkId);
            } catch (e) {
                // Fallback to sample artwork data
                artwork = {
                    id: artworkId,
                    title: 'Water Lilies',
                    artist: 'Claude Monet',
                    year: '1906',
                    imageUrl: 'https://images.unsplash.com/photo-1500346138972-dc5b229af4ad?auto=format&fit=crop&w=900&q=80'
                };
            }

            // Generate opening message based on personality
            const openingMessages = {
                LAEF: '이 작품을 처음 보았을 때, 어떤 느낌이 먼저 다가왔나요?',
                SAEF: '작품 속 색채와 형태가 어떤 감정을 불러일으키나요?',
                LAMF: '이 작품이 전달하려는 이야기는 무엇일까요?',
                SRMF: '작품의 구조와 배치에서 무엇을 발견하셨나요?',
                default: '이 작품을 바라보며 가장 먼저 떠오르는 생각은 무엇인가요?'
            };

            const message = openingMessages[personality] || openingMessages.default;

            // Generate options based on personality
            const options = [
                {
                    id: 'calm',
                    label: '차분하고 평화로운 느낌이에요',
                    description: '고요함과 안정감을 느끼고 있어요',
                    tone: 'gentle'
                },
                {
                    id: 'curious',
                    label: '무언가 탐구하고 싶어지는 느낌이에요',
                    description: '작품 속에서 더 많은 것을 발견하고 싶어요',
                    tone: 'curious'
                },
                {
                    id: 'nostalgic',
                    label: '과거의 기억이 떠올라요',
                    description: '어떤 추억이나 감정이 연결되는 것 같아요',
                    tone: 'grounding'
                },
                {
                    id: 'free_input',
                    label: '다른 느낌이에요',
                    description: '직접 표현해볼게요',
                    tone: 'playful'
                }
            ];

            logger.info(`Hybrid opening generated for user ${userId}`, {
                artworkId,
                personality
            });

            res.json({
                success: true,
                data: {
                    artworkId: artwork.id,
                    artworkTitle: artwork.title,
                    artworkArtist: artwork.artist,
                    artworkYear: artwork.year,
                    personality,
                    emoji: '🎨',
                    message,
                    options,
                    stage: 'opening'
                }
            });

        } catch (error) {
            logger.error('Error in hybrid opening:', error);
            res.status(500).json({
                success: false,
                error: { message: '세션을 시작하는 중 오류가 발생했습니다.' }
            });
        }
    }

    /**
     * Hybrid Exploration - Process user selection and provide deeper exploration
     * POST /api/art-counselor/hybrid/exploration
     */
    async hybridExploration(req, res) {
        try {
            const { userId } = req;
            const { artworkId, personality, userSelection, freeText, sessionId } = req.body;

            // Generate exploration response based on user selection
            const explorationResponses = {
                calm: '평화로움을 느끼셨군요. 작품 속 어떤 요소가 특히 그런 안정감을 주었나요?',
                curious: '호기심이 생기셨네요. 작품에서 더 알고 싶은 부분이 있다면 무엇인가요?',
                nostalgic: '과거의 기억과 연결되셨군요. 어떤 시간이나 장소가 떠오르셨나요?',
                free_input: freeText
                    ? `"${freeText}"라고 느끼셨군요. 그 감정을 조금 더 자세히 이야기해주실 수 있나요?`
                    : '직접 표현해주셔서 감사해요. 더 깊이 탐색해볼까요?'
            };

            const message = explorationResponses[userSelection] || explorationResponses.free_input;

            // Options for exploration stage
            const options = [
                {
                    id: 'deeper',
                    label: '더 깊이 느껴보고 싶어요',
                    description: '이 감정을 좀 더 탐구해볼게요',
                    tone: 'curious'
                },
                {
                    id: 'connect',
                    label: '제 경험과 연결해보고 싶어요',
                    description: '작품과 저의 이야기를 엮어볼게요',
                    tone: 'grounding'
                },
                {
                    id: 'free_input',
                    label: '다른 이야기를 해볼게요',
                    description: '자유롭게 표현할게요',
                    tone: 'playful'
                }
            ];

            logger.info(`Hybrid exploration processed for user ${userId}`, {
                artworkId,
                personality,
                userSelection,
                sessionId
            });

            res.json({
                success: true,
                data: {
                    artworkId,
                    personality,
                    stage: 'connection',
                    message,
                    method: 'exploration',
                    options
                }
            });

        } catch (error) {
            logger.error('Error in hybrid exploration:', error);
            res.status(500).json({
                success: false,
                error: { message: '탐색 단계에서 오류가 발생했습니다.' }
            });
        }
    }

    /**
     * Hybrid Connection - Process reflection and generate connection response
     * POST /api/art-counselor/hybrid/connection
     */
    async hybridConnection(req, res) {
        try {
            const { userId } = req;
            const { artworkId, personality, userInput, sessionId } = req.body;

            // Store the reflection in conversation memory
            if (userInput && sessionId) {
                try {
                    await artCounselorService.storeConversationMemory(
                        sessionId,
                        userId,
                        'user',
                        userInput,
                        null,
                        'connection'
                    );
                } catch (e) {
                    logger.warn('Failed to store conversation memory:', e.message);
                }
            }

            // Generate connection response
            const message = userInput && userInput.length > 0
                ? `나눠주신 이야기가 참 의미있네요. "${userInput.substring(0, 50)}${userInput.length > 50 ? '...' : ''}" - 이 감정과 경험이 오늘 이 작품과 만나게 된 것 같아요. 이 순간을 소중히 기록해두면 좋겠어요.`
                : '오늘의 감상이 당신에게 의미있는 시간이었기를 바라요. 이 순간을 소중히 기록해두면 좋겠어요.';

            logger.info(`Hybrid connection processed for user ${userId}`, {
                artworkId,
                personality,
                sessionId
            });

            res.json({
                success: true,
                data: {
                    artworkId,
                    personality,
                    stage: 'connection',
                    message,
                    method: 'connection'
                }
            });

        } catch (error) {
            logger.error('Error in hybrid connection:', error);
            res.status(500).json({
                success: false,
                error: { message: '연결 단계에서 오류가 발생했습니다.' }
            });
        }
    }

    /**
     * Hybrid Complete - Finalize session and generate summary
     * POST /api/art-counselor/hybrid/complete
     */
    async hybridComplete(req, res) {
        try {
            const { userId } = req;
            const { artworkId, personality, sessionId } = req.body;

            // Get artwork info for summary
            let artwork = null;
            try {
                artwork = await supabaseArtService.getArtworkById(artworkId);
            } catch (e) {
                artwork = { title: '오늘의 작품' };
            }

            // Generate session summary
            const summary = `오늘 "${artwork?.title || '작품'}"과 함께한 시간이 의미있었기를 바라요. 작품을 통해 떠올린 감정과 기억들이 앞으로의 하루에 작은 위안이 되길 바랍니다. 당신의 감상은 고유하고 소중해요.`;

            // Store completion in database
            try {
                if (sessionId) {
                    const client = await pool.connect();
                    await client.query(
                        `UPDATE art_counselor_sessions
                         SET ended_at = CURRENT_TIMESTAMP,
                             conversation_summary = $1
                         WHERE id = $2 AND user_id = $3`,
                        [summary, sessionId, userId]
                    );
                    client.release();
                }
            } catch (e) {
                logger.warn('Failed to update session completion:', e.message);
            }

            logger.info(`Hybrid session completed for user ${userId}`, {
                artworkId,
                personality,
                sessionId
            });

            res.json({
                success: true,
                data: {
                    journalId: sessionId || `journal-${Date.now()}`,
                    summary,
                    artworkTitle: artwork?.title || '오늘의 작품',
                    createdAt: new Date().toISOString()
                }
            });

        } catch (error) {
            logger.error('Error in hybrid complete:', error);
            res.status(500).json({
                success: false,
                error: { message: '세션을 완료하는 중 오류가 발생했습니다.' }
            });
        }
    }

    /**
     * Get response history
     */
    async getResponseHistory(req, res) {
        try {
            const { userId } = req;
            const { limit = 20, artworkId, therapeuticTheme } = req.query;

            const client = await pool.connect();

            let query = `
                SELECT
                    id, artwork_id, artwork_title, artwork_artist,
                    emotional_response, response_intensity, personal_meaning,
                    created_at
                FROM artwork_emotional_responses
                WHERE user_id = $1
            `;

            const params = [userId];
            let paramCount = 1;

            if (artworkId) {
                paramCount++;
                query += ` AND artwork_id = $${paramCount}`;
                params.push(artworkId);
            }

            query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1}`;
            params.push(parseInt(limit));

            const result = await client.query(query, params);
            client.release();

            res.json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            logger.error('Error getting response history:', error);
            res.status(500).json({
                success: false,
                message: '응답 기록을 가져오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Get emotional progress
     */
    async getEmotionalProgress(req, res) {
        try {
            const { userId } = req;

            const client = await pool.connect();

            // Get session statistics
            const statsQuery = `
                SELECT
                    COUNT(*) as total_sessions,
                    COUNT(CASE WHEN ended_at IS NOT NULL THEN 1 END) as completed_sessions,
                    MAX(ended_at) as last_session
                FROM art_counselor_sessions
                WHERE user_id = $1
            `;

            const statsResult = await client.query(statsQuery, [userId]);
            const stats = statsResult.rows[0];

            // Get recent emotional responses
            const emotionsQuery = `
                SELECT emotional_response, created_at
                FROM artwork_emotional_responses
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT 5
            `;

            const emotionsResult = await client.query(emotionsQuery, [userId]);

            client.release();

            // Calculate streak (simplified)
            let weeklyStreak = 0;
            if (stats.last_session) {
                const lastSession = new Date(stats.last_session);
                const now = new Date();
                const daysDiff = Math.floor((now - lastSession) / (1000 * 60 * 60 * 24));
                if (daysDiff <= 1) {
                    weeklyStreak = Math.min(7, parseInt(stats.completed_sessions));
                }
            }

            res.json({
                success: true,
                data: {
                    completedSessions: parseInt(stats.completed_sessions) || 0,
                    totalSessions: parseInt(stats.total_sessions) || 0,
                    weeklyStreak,
                    lastEmotion: emotionsResult.rows[0]?.emotional_response?.primary || '아직 기록 없음',
                    recentEmotions: emotionsResult.rows
                }
            });

        } catch (error) {
            logger.error('Error getting emotional progress:', error);
            res.status(500).json({
                success: false,
                message: '진행 상황을 가져오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Provide feedback on daily art recommendation
     */
    async provideDailyArtFeedback(req, res) {
        try {
            const { recommendationId } = req.params;
            const { userId } = req;
            const { helpfulnessRating, emotionalImpact } = req.body;

            const client = await pool.connect();

            const updateQuery = `
                UPDATE daily_art_recommendations
                SET
                    helpfulness_rating = $3,
                    emotional_impact = $4,
                    feedback_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND user_id = $2
                RETURNING id
            `;

            const result = await client.query(updateQuery, [
                recommendationId,
                userId,
                helpfulnessRating,
                emotionalImpact
            ]);

            client.release();

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '추천 항목을 찾을 수 없습니다.'
                });
            }

            res.json({
                success: true,
                data: { feedbackRecorded: true }
            });

        } catch (error) {
            logger.error('Error providing daily art feedback:', error);
            res.status(500).json({
                success: false,
                message: '피드백을 저장하는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Search conversation memory using semantic similarity
     */
    async searchMemory(req, res) {
        try {
            const { userId } = req;
            const { query, limit = 10 } = req.body;

            const client = await pool.connect();

            // Simple text search (semantic search would require pgvector)
            const searchQuery = `
                SELECT
                    id, session_id, message_type, content,
                    emotion_detected, therapeutic_theme, created_at
                FROM counselor_conversation_memory
                WHERE user_id = $1
                  AND content ILIKE $2
                ORDER BY created_at DESC
                LIMIT $3
            `;

            const result = await client.query(searchQuery, [
                userId,
                `%${query}%`,
                limit
            ]);

            client.release();

            res.json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            logger.error('Error searching memory:', error);
            res.status(500).json({
                success: false,
                message: '기억을 검색하는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Update emotional profile
     */
    async updateEmotionalProfile(req, res) {
        try {
            const { userId } = req;
            const {
                therapeuticGoals,
                conversationStyle,
                communicationPace,
                preferredTherapeuticApproaches
            } = req.body;

            const client = await pool.connect();

            const updateQuery = `
                INSERT INTO user_emotional_profiles (
                    user_id, therapeutic_goals, conversation_style,
                    communication_pace, preferred_therapeutic_approaches,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id) DO UPDATE SET
                    therapeutic_goals = COALESCE($2, user_emotional_profiles.therapeutic_goals),
                    conversation_style = COALESCE($3, user_emotional_profiles.conversation_style),
                    communication_pace = COALESCE($4, user_emotional_profiles.communication_pace),
                    preferred_therapeutic_approaches = COALESCE($5, user_emotional_profiles.preferred_therapeutic_approaches),
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `;

            const result = await client.query(updateQuery, [
                userId,
                therapeuticGoals || null,
                conversationStyle || null,
                communicationPace || null,
                preferredTherapeuticApproaches || null
            ]);

            client.release();

            res.json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            logger.error('Error updating emotional profile:', error);
            res.status(500).json({
                success: false,
                message: '감정 프로필을 업데이트하는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Update counselor interaction preferences
     */
    async updatePreferences(req, res) {
        try {
            const { userId } = req;
            const {
                preferredCounselorPersona,
                communicationFormality,
                crisisSupportEnabled,
                triggerWarningsEnabled,
                communitySharing
            } = req.body;

            const client = await pool.connect();

            const updateQuery = `
                INSERT INTO counselor_user_preferences (
                    user_id, preferred_counselor_persona, communication_formality,
                    crisis_support_enabled, trigger_warnings_enabled, community_sharing,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id) DO UPDATE SET
                    preferred_counselor_persona = COALESCE($2, counselor_user_preferences.preferred_counselor_persona),
                    communication_formality = COALESCE($3, counselor_user_preferences.communication_formality),
                    crisis_support_enabled = COALESCE($4, counselor_user_preferences.crisis_support_enabled),
                    trigger_warnings_enabled = COALESCE($5, counselor_user_preferences.trigger_warnings_enabled),
                    community_sharing = COALESCE($6, counselor_user_preferences.community_sharing),
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `;

            const result = await client.query(updateQuery, [
                userId,
                preferredCounselorPersona || null,
                communicationFormality || null,
                crisisSupportEnabled ?? null,
                triggerWarningsEnabled ?? null,
                communitySharing ?? null
            ]);

            client.release();

            res.json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            logger.error('Error updating preferences:', error);
            res.status(500).json({
                success: false,
                message: '설정을 업데이트하는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Provide feedback on counselor session
     */
    async provideFeedback(req, res) {
        try {
            const { userId } = req;
            const { sessionId, userSatisfaction, helpfulnessRating, feedback } = req.body;

            const client = await pool.connect();

            const updateQuery = `
                UPDATE art_counselor_sessions
                SET
                    user_satisfaction = $3,
                    helpfulness_rating = $4,
                    user_feedback = $5
                WHERE id = $1 AND user_id = $2
                RETURNING id
            `;

            const result = await client.query(updateQuery, [
                sessionId,
                userId,
                userSatisfaction,
                helpfulnessRating,
                feedback
            ]);

            client.release();

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '세션을 찾을 수 없습니다.'
                });
            }

            logger.info(`Session feedback recorded for user ${userId}`, { sessionId });

            res.json({
                success: true,
                data: { feedbackRecorded: true }
            });

        } catch (error) {
            logger.error('Error providing feedback:', error);
            res.status(500).json({
                success: false,
                message: '피드백을 저장하는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Get personal therapeutic insights and progress
     */
    async getTherapeuticInsights(req, res) {
        try {
            const { userId } = req;
            const { timeframe = 'month' } = req.query;

            const client = await pool.connect();

            // Calculate date range
            let dateFilter = "INTERVAL '30 days'";
            if (timeframe === 'week') dateFilter = "INTERVAL '7 days'";
            else if (timeframe === 'quarter') dateFilter = "INTERVAL '90 days'";
            else if (timeframe === 'year') dateFilter = "INTERVAL '365 days'";

            // Get session insights
            const insightsQuery = `
                SELECT
                    COUNT(*) as session_count,
                    AVG(user_satisfaction) as avg_satisfaction,
                    AVG(helpfulness_rating) as avg_helpfulness,
                    array_agg(DISTINCT key_insights) FILTER (WHERE key_insights IS NOT NULL) as insights
                FROM art_counselor_sessions
                WHERE user_id = $1
                  AND started_at > NOW() - ${dateFilter}
            `;

            const insightsResult = await client.query(insightsQuery, [userId]);

            // Get emotional trends
            const trendsQuery = `
                SELECT
                    emotional_response->'primary' as emotion,
                    COUNT(*) as count
                FROM artwork_emotional_responses
                WHERE user_id = $1
                  AND created_at > NOW() - ${dateFilter}
                GROUP BY emotional_response->'primary'
                ORDER BY count DESC
                LIMIT 5
            `;

            const trendsResult = await client.query(trendsQuery, [userId]);

            client.release();

            const insights = insightsResult.rows[0];

            res.json({
                success: true,
                data: {
                    timeframe,
                    sessionCount: parseInt(insights.session_count) || 0,
                    avgSatisfaction: parseFloat(insights.avg_satisfaction) || 0,
                    avgHelpfulness: parseFloat(insights.avg_helpfulness) || 0,
                    keyInsights: insights.insights?.flat().filter(Boolean) || [],
                    emotionalTrends: trendsResult.rows
                }
            });

        } catch (error) {
            logger.error('Error getting therapeutic insights:', error);
            res.status(500).json({
                success: false,
                message: '인사이트를 가져오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * Get service usage statistics (admin only)
     */
    async getServiceStats(req, res) {
        try {
            const client = await pool.connect();

            // Get overall statistics
            const statsQuery = `
                SELECT
                    (SELECT COUNT(*) FROM art_counselor_sessions) as total_sessions,
                    (SELECT COUNT(DISTINCT user_id) FROM art_counselor_sessions) as unique_users,
                    (SELECT COUNT(*) FROM counselor_conversation_memory) as total_messages,
                    (SELECT COUNT(*) FROM artwork_emotional_responses) as total_responses,
                    (SELECT AVG(user_satisfaction) FROM art_counselor_sessions WHERE user_satisfaction IS NOT NULL) as avg_satisfaction
            `;

            const result = await client.query(statsQuery);
            client.release();

            const stats = result.rows[0];

            res.json({
                success: true,
                data: {
                    totalSessions: parseInt(stats.total_sessions) || 0,
                    uniqueUsers: parseInt(stats.unique_users) || 0,
                    totalMessages: parseInt(stats.total_messages) || 0,
                    totalResponses: parseInt(stats.total_responses) || 0,
                    avgSatisfaction: parseFloat(stats.avg_satisfaction) || 0
                }
            });

        } catch (error) {
            logger.error('Error getting service stats:', error);
            res.status(500).json({
                success: false,
                message: '통계를 가져오는 중 오류가 발생했습니다.'
            });
        }
    }
}

module.exports = new ArtCounselorController();