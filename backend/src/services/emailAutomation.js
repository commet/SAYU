const cron = require('node-cron');
const { pool } = require('../config/database');
const { getSupabaseAdmin } = require('../config/supabase');
const emailService = require('./emailService');
const { logger } = require('../config/logger');

class EmailAutomationService {
  constructor() {
    this.jobs = new Map();
    this.weeklyFeedbackRecipients = this.parseWeeklyRecipients(
      process.env.WEEKLY_FEEDBACK_SUMMARY_RECIPIENTS || 'yclee913@gmail.com'
    );
    this.initializeScheduledJobs();
  }

  initializeScheduledJobs() {
    logger.info('Initializing email automation jobs...');

    // Weekly insights - Every Sunday at 9 AM
    this.scheduleJob('weekly-insights', '0 9 * * 0', () => {
      this.sendWeeklyInsights();
    });

    // Weekly admin feedback summary - Every Sunday at 9:30 AM
    this.scheduleJob('weekly-feedback-summary', '30 9 * * 0', () => {
      this.sendWeeklyFeedbackSummary();
    });

    // Re-engagement emails - Daily at 10 AM
    this.scheduleJob('re-engagement', '0 10 * * *', () => {
      this.sendReEngagementEmails();
    });

    // Profile completion reminders - Daily at 2 PM
    this.scheduleJob('profile-reminders', '0 14 * * *', () => {
      this.sendProfileReminders();
    });

    // Monthly curator's pick - First day of month at 8 AM
    this.scheduleJob('curators-pick', '0 8 1 * *', () => {
      this.sendMonthlyCharacteristicPick();
    });

    // Welcome series follow-ups - Daily at 11 AM
    this.scheduleJob('welcome-series', '0 11 * * *', () => {
      this.sendWelcomeSeriesEmails();
    });

    logger.info('Email automation jobs initialized successfully');
  }

  scheduleJob(name, cronPattern, callback) {
    const job = cron.schedule(cronPattern, callback, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.jobs.set(name, job);
    job.start();
    logger.info(`Scheduled job '${name}' with pattern '${cronPattern}'`);
  }

  async sendWeeklyInsights() {
    logger.info('Starting weekly insights email send...');

    try {
      // Get all active users who haven't opted out
      const usersQuery = `
        SELECT u.*, up.type_code, up.archetype_name 
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.email_preferences->>'weekly_insights' != 'false'
        AND u.created_at <= NOW() - INTERVAL '7 days'
        AND u.last_login >= NOW() - INTERVAL '30 days'
      `;

      const users = await pool.query(usersQuery);

      for (const user of users.rows) {
        try {
          const insights = await this.generateWeeklyInsights(user.id);

          if (insights.artworksViewed > 0) {
            await emailService.sendWeeklyInsights(user, insights);
            logger.info(`Weekly insights sent to ${user.email}`);
          }
        } catch (error) {
          logger.error(`Failed to send weekly insights to ${user.email}:`, error);
        }
      }

      logger.info(`Weekly insights process completed for ${users.rows.length} users`);
    } catch (error) {
      logger.error('Weekly insights job failed:', error);
    }
  }

  parseWeeklyRecipients(rawRecipients) {
    return String(rawRecipients)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  async sendWeeklyFeedbackSummary() {
    logger.info('Starting weekly feedback summary email send...');

    try {
      if (!this.weeklyFeedbackRecipients.length) {
        logger.warn('No weekly feedback summary recipients configured');
        return;
      }

      const summary = await this.generateWeeklyFeedbackSummary();
      if (!summary) {
        logger.warn('Weekly feedback summary skipped: summary generation returned no result');
        return;
      }

      for (const recipient of this.weeklyFeedbackRecipients) {
        try {
          await emailService.sendWeeklyFeedbackSummaryEmail(recipient, summary);
          logger.info(`Weekly feedback summary sent to ${recipient}`);
        } catch (error) {
          logger.error(`Failed to send weekly feedback summary to ${recipient}:`, error);
        }
      }

      logger.info(`Weekly feedback summary process completed for ${this.weeklyFeedbackRecipients.length} recipients`);
    } catch (error) {
      logger.error('Weekly feedback summary job failed:', error);
    }
  }

  async generateWeeklyFeedbackSummary() {
    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      logger.warn('Supabase admin is not configured. Skipping weekly feedback summary email.');
      return null;
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeekStart = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [currentWeekResult, previousWeekResult] = await Promise.all([
      supabaseAdmin
        .from('feedback')
        .select('id, type, status, rating, message, context, created_at')
        .gte('created_at', weekAgo.toISOString())
        .lte('created_at', now.toISOString()),
      supabaseAdmin
        .from('feedback')
        .select('id')
        .gte('created_at', prevWeekStart.toISOString())
        .lt('created_at', weekAgo.toISOString())
    ]);

    if (currentWeekResult.error) {
      throw currentWeekResult.error;
    }

    if (previousWeekResult.error) {
      throw previousWeekResult.error;
    }

    const feedbackRows = Array.isArray(currentWeekResult.data) ? currentWeekResult.data : [];
    const previousCount = Array.isArray(previousWeekResult.data) ? previousWeekResult.data.length : 0;

    const totalFeedback = feedbackRows.length;
    const unresolvedCount = feedbackRows.filter(
      (row) => row.status === 'new' || row.status === 'in_review'
    ).length;
    const resolvedCount = feedbackRows.filter((row) => row.status === 'resolved').length;
    const bugCount = feedbackRows.filter((row) => row.type === 'bug').length;

    const ratings = feedbackRows
      .map((row) => Number(row.rating))
      .filter((value) => Number.isFinite(value) && value > 0);

    const averageRating = ratings.length
      ? (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(2)
      : '0.00';

    const weekOverWeekChange = previousCount > 0
      ? `${(((totalFeedback - previousCount) / previousCount) * 100).toFixed(1)}%`
      : totalFeedback > 0
        ? '+100.0%'
        : '0.0%';

    const pageCount = {};
    const featureCount = {};
    const issueCategoryCount = {
      bug: 0,
      recommendation: 0,
      performance: 0,
      auth: 0,
      ui: 0,
      other: 0
    };

    feedbackRows.forEach((row) => {
      const page = typeof row.context?.page === 'string' ? row.context.page.trim() : '';
      const feature = typeof row.context?.feature === 'string' ? row.context.feature.trim() : '';
      if (page) pageCount[page] = (pageCount[page] || 0) + 1;
      if (feature) featureCount[feature] = (featureCount[feature] || 0) + 1;

      const rawText = `${row.message || ''} ${page} ${feature}`.toLowerCase();
      if (row.type === 'bug' || rawText.includes('bug') || rawText.includes('오류')) {
        issueCategoryCount.bug += 1;
      } else if (rawText.includes('recommend') || rawText.includes('추천')) {
        issueCategoryCount.recommendation += 1;
      } else if (rawText.includes('slow') || rawText.includes('lag') || rawText.includes('느리')) {
        issueCategoryCount.performance += 1;
      } else if (rawText.includes('login') || rawText.includes('auth') || rawText.includes('로그인')) {
        issueCategoryCount.auth += 1;
      } else if (rawText.includes('ui') || rawText.includes('ux') || rawText.includes('화면')) {
        issueCategoryCount.ui += 1;
      } else {
        issueCategoryCount.other += 1;
      }
    });

    const topPages = Object.entries(pageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const topFeatures = Object.entries(featureCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const topIssues = Object.entries(issueCategoryCount)
      .sort((a, b) => b[1] - a[1])
      .filter(([, count]) => count > 0)
      .slice(0, 5);

    const issueLabelMap = {
      bug: 'Bug / Error',
      recommendation: 'Recommendation Quality',
      performance: 'Performance',
      auth: 'Authentication',
      ui: 'UI/UX',
      other: 'Other'
    };

    const topIssuesHtml = this.buildHtmlList(
      topIssues.map(([key, count]) => `${issueLabelMap[key] || key}: ${count}`)
    );
    const topPagesHtml = this.buildHtmlList(topPages.map(([name, count]) => `${name}: ${count}`));
    const topFeaturesHtml = this.buildHtmlList(topFeatures.map(([name, count]) => `${name}: ${count}`));

    const actionItems = [];
    if (topIssues.length > 0) {
      actionItems.push(`P1: Stabilize ${issueLabelMap[topIssues[0][0]] || topIssues[0][0]} issues first.`);
    }
    if (unresolvedCount > 0) {
      actionItems.push(`P1: Triage ${unresolvedCount} unresolved feedback items.`);
    }
    if (topPages.length > 0) {
      actionItems.push(`P2: Review UX on top complaint page: ${topPages[0][0]}.`);
    }
    if (topFeatures.length > 0) {
      actionItems.push(`P2: Re-check feature behavior for: ${topFeatures[0][0]}.`);
    }
    if (actionItems.length === 0) {
      actionItems.push('No high-risk items detected this week. Keep monitoring trend lines.');
    }

    return {
      weekRange: this.getWeekRange(),
      generatedAt: now.toISOString(),
      totalFeedback,
      unresolvedCount,
      resolvedCount,
      bugCount,
      averageRating,
      weekOverWeekChange,
      topIssuesHtml,
      topPagesHtml,
      topFeaturesHtml,
      actionItemsHtml: this.buildHtmlList(actionItems)
    };
  }

  buildHtmlList(items) {
    if (!items || items.length === 0) {
      return '<p style=\"margin:0;color:#6b7280;\">No data</p>';
    }

    const listItems = items.map((item) => `<li style=\"margin-bottom:6px;\">${item}</li>`).join('');
    return `<ul style=\"margin:0;padding-left:18px;color:#111827;\">${listItems}</ul>`;
  }

  async generateWeeklyInsights(userId) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get user activity stats
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT ua.artwork_id) as artworks_viewed,
        COALESCE(SUM(ua.time_spent), 0) as total_time_spent,
        COUNT(DISTINCT DATE(ua.created_at)) as active_days,
        COUNT(DISTINCT ac.id) as conversations_count
      FROM user_artwork_interactions ua
      LEFT JOIN agent_conversations ac ON ac.user_id = ua.user_id 
        AND ac.created_at >= $2
      WHERE ua.user_id = $1 AND ua.created_at >= $2
    `;

    const statsResult = await pool.query(statsQuery, [userId, oneWeekAgo]);
    const stats = statsResult.rows[0];

    // Get most viewed artwork
    const topArtworkQuery = `
      SELECT a.title, a.artist, a.image_url, SUM(ua.time_spent) as total_time
      FROM user_artwork_interactions ua
      JOIN artworks a ON a.id = ua.artwork_id
      WHERE ua.user_id = $1 AND ua.created_at >= $2
      GROUP BY a.id, a.title, a.artist, a.image_url
      ORDER BY total_time DESC
      LIMIT 1
    `;

    const topArtworkResult = await pool.query(topArtworkQuery, [userId, oneWeekAgo]);

    // Generate personalized recommendations
    const recommendations = await this.generatePersonalizedRecommendations(userId);

    return {
      weekRange: this.getWeekRange(),
      artworksViewed: parseInt(stats.artworks_viewed) || 0,
      timeSpent: Math.round(parseInt(stats.total_time_spent) / 60) || 0,
      newDiscoveries: parseInt(stats.artworks_viewed) || 0,
      conversationsCount: parseInt(stats.conversations_count) || 0,
      topArtwork: topArtworkResult.rows[0] || null,
      recommendations
    };
  }

  async generatePersonalizedRecommendations(userId) {
    // Get user's aesthetic profile
    const profileQuery = `
      SELECT type_code, archetype_name, emotional_tags, artwork_scores
      FROM user_profiles WHERE user_id = $1
    `;
    const profile = await pool.query(profileQuery, [userId]);

    if (!profile.rows[0]) return [];

    const userProfile = profile.rows[0];

    // Generate context-aware recommendations
    const recommendations = [
      {
        emoji: '🎨',
        text: `Explore ${this.getRecommendedPeriod(userProfile.type_code)} artworks that align with your ${userProfile.archetype_name} personality`
      },
      {
        emoji: '💬',
        text: `Ask your AI curator about the symbolism in abstract works - perfect for your analytical nature`
      },
      {
        emoji: '🏛️',
        text: `Visit the virtual exhibitions section for curated collections matching your taste`
      },
      {
        emoji: '📝',
        text: `Create your first artwork archive to track pieces that resonate with you`
      }
    ];

    return recommendations;
  }

  async sendReEngagementEmails() {
    logger.info('Starting re-engagement email process...');

    try {
      // Find users who haven't logged in for 7-30 days
      const inactiveUsersQuery = `
        SELECT u.*, up.type_code, up.archetype_name,
               EXTRACT(DAY FROM NOW() - u.last_login) as days_inactive
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.last_login BETWEEN NOW() - INTERVAL '30 days' AND NOW() - INTERVAL '7 days'
        AND u.email_preferences->>'re_engagement' != 'false'
        AND NOT EXISTS (
          SELECT 1 FROM email_logs el 
          WHERE el.user_id = u.id 
          AND el.email_type = 'nudge' 
          AND el.sent_at >= NOW() - INTERVAL '7 days'
        )
      `;

      const users = await pool.query(inactiveUsersQuery);

      for (const user of users.rows) {
        try {
          await emailService.sendReEngagementEmail(user, Math.floor(user.days_inactive));

          // Log the email send
          await this.logEmailSent(user.id, 'nudge');

          logger.info(`Re-engagement email sent to ${user.email} (${user.days_inactive} days inactive)`);
        } catch (error) {
          logger.error(`Failed to send re-engagement email to ${user.email}:`, error);
        }
      }

      logger.info(`Re-engagement process completed for ${users.rows.length} users`);
    } catch (error) {
      logger.error('Re-engagement job failed:', error);
    }
  }

  async sendProfileReminders() {
    logger.info('Starting profile completion reminders...');

    try {
      // Find users registered 3+ days ago who haven't completed profile
      const incompleteProfilesQuery = `
        SELECT u.*,
               EXTRACT(DAY FROM NOW() - u.created_at) as days_registered
        FROM users u
        WHERE u.created_at <= NOW() - INTERVAL '3 days'
        AND NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = u.id)
        AND u.email_preferences->>'profile_reminders' != 'false'
        AND NOT EXISTS (
          SELECT 1 FROM email_logs el 
          WHERE el.user_id = u.id 
          AND el.email_type = 'profile-reminder' 
          AND el.sent_at >= NOW() - INTERVAL '7 days'
        )
      `;

      const users = await pool.query(incompleteProfilesQuery);

      for (const user of users.rows) {
        try {
          await emailService.sendProfileReminderEmail(user);
          await this.logEmailSent(user.id, 'profile-reminder');

          logger.info(`Profile reminder sent to ${user.email}`);
        } catch (error) {
          logger.error(`Failed to send profile reminder to ${user.email}:`, error);
        }
      }

      logger.info(`Profile reminder process completed for ${users.rows.length} users`);
    } catch (error) {
      logger.error('Profile reminder job failed:', error);
    }
  }

  async sendMonthlyCharacteristicPick() {
    logger.info('Starting monthly curator\'s pick emails...');

    try {
      const usersQuery = `
        SELECT u.*, up.type_code, up.archetype_name 
        FROM users u
        JOIN user_profiles up ON u.id = up.user_id
        WHERE u.email_preferences->>'curators_pick' != 'false'
      `;

      const users = await pool.query(usersQuery);

      for (const user of users.rows) {
        try {
          const curatorsPick = await this.generateCuratorsPick(user);
          await emailService.sendCuratorsPick(user, curatorsPick);

          logger.info(`Curator's pick sent to ${user.email}`);
        } catch (error) {
          logger.error(`Failed to send curator's pick to ${user.email}:`, error);
        }
      }

      logger.info(`Curator's pick process completed for ${users.rows.length} users`);
    } catch (error) {
      logger.error('Curator\'s pick job failed:', error);
    }
  }

  async generateCuratorsPick(user) {
    // This would typically call the OpenAI service to generate personalized picks
    // For now, returning a template
    return {
      title: 'The Great Wave off Kanagawa',
      artist: 'Katsushika Hokusai',
      imageUrl: 'https://example.com/great-wave.jpg',
      message: `This month's selection speaks to your ${user.archetype_name} personality...`,
      reasoning: 'The dynamic composition and emotional depth align perfectly with your aesthetic preferences.'
    };
  }

  async logEmailSent(userId, emailType) {
    const query = `
      INSERT INTO email_logs (user_id, email_type, sent_at)
      VALUES ($1, $2, NOW())
    `;
    await pool.query(query, [userId, emailType]);
  }

  getWeekRange() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    };

    return `${formatDate(oneWeekAgo)} - ${formatDate(now)}`;
  }

  getRecommendedPeriod(typeCode) {
    // Map type codes to historical periods
    const periodMap = {
      'A': 'Contemporary',
      'R': 'Renaissance',
      'M': 'Modern',
      'E': 'Impressionist'
    };

    return periodMap[typeCode?.[0]] || 'Contemporary';
  }

  // Manual trigger methods for testing
  async triggerWeeklyInsights() {
    await this.sendWeeklyInsights();
  }

  async triggerWeeklyFeedbackSummary() {
    await this.sendWeeklyFeedbackSummary();
  }

  async triggerReEngagement() {
    await this.sendReEngagementEmails();
  }

  stopAllJobs() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });
  }

  startAllJobs() {
    this.jobs.forEach((job, name) => {
      job.start();
      logger.info(`Started job: ${name}`);
    });
  }
}

module.exports = new EmailAutomationService();
