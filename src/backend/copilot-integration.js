/**
 * Copilot Integration Module
 * Handles daily report generation using Azure OpenAI / Copilot APIs
 */

require('dotenv').config();

class CopilotIntegration {
  constructor() {
    this.apiKey = process.env.AZURE_OPENAI_API_KEY;
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
  }

  /**
   * Generate daily report from activities using Copilot
   * @param {Array} activities - Array of activities for the day
   * @param {String} date - Date of the report (YYYY-MM-DD)
   * @returns {Promise<Object>} Generated report
   */
  async generateDailyReport(activities, date) {
    if (!activities || activities.length === 0) {
      return this.createEmptyReport(date);
    }

    const prompt = this.buildPrompt(activities, date);
    const generatedContent = await this.callCopilot(prompt);

    return {
      date,
      summary: generatedContent.summary,
      highlights: generatedContent.highlights,
      projects: generatedContent.projects,
      issues: generatedContent.issues,
      nextActions: generatedContent.nextActions,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Build prompt for Copilot based on activities
   * @param {Array} activities - Daily activities
   * @param {String} date - Report date
   * @returns {String} Formatted prompt
   */
  buildPrompt(activities, date) {
    const activitiesText = activities
      .map(a => `[${a.startTime}-${a.endTime}] ${a.task}${a.projectId ? ` (Project: ${a.projectId})` : ''}${a.notes ? ` - ${a.notes}` : ''}`)
      .join('\n');

    return `以下は2026年${date}の活動ログです。これを基に日報を生成してください。

【活動ログ】
${activitiesText}

【生成してください】
1. 本日の活動サマリー（2-3文）
2. 主な成果・ハイライト（3-5項目）
3. プロジェクト別の進捗状況
4. 発見された課題・問題点
5. 次のアクションアイテム

JSON形式で以下の構造で返してください：
{
  "summary": "...",
  "highlights": ["...", "..."],
  "projects": {"projectName": "進捗内容"},
  "issues": ["...", "..."],
  "nextActions": ["...", "..."]
}`;
  }

  /**
   * Call Azure OpenAI / Copilot API
   * @param {String} prompt - Input prompt
   * @returns {Promise<Object>} API response
   */
  async callCopilot(prompt) {
    // Mock implementation - replace with actual API call
    // For production, implement actual Azure OpenAI API integration

    if (!this.apiKey || !this.endpoint) {
      console.warn('Copilot API credentials not configured. Using mock response.');
      return this.getMockResponse();
    }

    try {
      // Placeholder for actual API implementation
      // const response = await fetch(...);
      return this.getMockResponse();
    } catch (error) {
      console.error('Copilot API error:', error);
      throw new Error('Failed to generate report with Copilot');
    }
  }

  /**
   * Generate mock response for testing
   * @returns {Object} Mock generated content
   */
  getMockResponse() {
    return {
      summary: '本日は新規事業プロジェクトと契約準備に注力。複数の契約書準備が完了し、デジタル支援員制度の拡大が進展。',
      highlights: [
        'デジタル支援員契約書3名分の準備完了',
        'マンションプラン機器設定サポート実施',
        '業務委託契約書の送付処理完了'
      ],
      projects: {
        'デジタル支援員制度': '3名の契約書準備完了、口之島・諏訪之瀬島・平島への展開準備中',
        'マンションプラン': '機器セットアップフェーズ進行中、WiFi設定など実施',
        '契約体制整備': '土岐さん契約書送付完了、複数案件の進捗管理'
      },
      issues: [
        '連絡つながらない状況への書面対応継続',
        '総務省事業終了に伴う来年度方針検討',
        '証憑対応の急速進捗が必要'
      ],
      nextActions: [
        '書面返却・契約確認待ち',
        '複数島への契約書送付',
        '各契約者からの返却確認'
      ]
    };
  }

  /**
   * Create empty report template
   * @param {String} date - Report date
   * @returns {Object} Empty report
   */
  createEmptyReport(date) {
    return {
      date,
      summary: '本日の活動ログがありません',
      highlights: [],
      projects: {},
      issues: [],
      nextActions: [],
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Summarize text using Copilot
   * @param {String} text - Text to summarize
   * @returns {Promise<String>} Summarized text
   */
  async summarizeText(text) {
    const prompt = `以下のテキストを簡潔に要約してください（50語以内）：\n\n${text}`;
    const response = await this.callCopilot(prompt);
    return response.summary || text;
  }

  /**
   * Extract key points from activities
   * @param {Array} activities - Activities to analyze
   * @returns {Promise<Array>} Key points
   */
  async extractKeyPoints(activities) {
    if (!activities || activities.length === 0) return [];

    const activitiesText = activities
      .map(a => `${a.task}${a.notes ? `: ${a.notes}` : ''}`)
      .join('\n');

    const prompt = `以下の活動から最大5つの重要なポイントを抽出してください：\n\n${activitiesText}`;
    const response = await this.callCopilot(prompt);
    return response.highlights || [];
  }
}

module.exports = CopilotIntegration;
