/**
 * Microsoft Graph API Integration Module
 * Fetches activity data from Outlook Calendar, Teams, and other Microsoft 365 services
 */

require('dotenv').config();

class MicrosoftGraphIntegration {
  constructor() {
    this.apiEndpoint = 'https://graph.microsoft.com/v1.0';
    this.accessToken = process.env.MICROSOFT_GRAPH_TOKEN;
  }

  /**
   * Fetch calendar events for a given date
   * @param {String} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Calendar events
   */
  async getCalendarEvents(date) {
    if (!this.accessToken) {
      console.warn('Microsoft Graph token not configured. Using mock data.');
      return this.getMockCalendarEvents(date);
    }

    try {
      const startTime = new Date(`${date}T00:00:00Z`);
      const endTime = new Date(`${date}T23:59:59Z`);

      const response = await fetch(
        `${this.apiEndpoint}/me/calendarview?startDateTime=${startTime.toISOString()}&endDateTime=${endTime.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      if (!response.ok) throw new Error(`Calendar fetch failed: ${response.status}`);

      const data = await response.json();
      return this.formatCalendarEvents(data.value || []);
    } catch (error) {
      console.error('Calendar fetch error:', error);
      return [];
    }
  }

  /**
   * Fetch recent emails
   * @param {Number} limit - Number of emails to fetch
   * @returns {Promise<Array>} Recent emails
   */
  async getRecentEmails(limit = 10) {
    if (!this.accessToken) {
      console.warn('Microsoft Graph token not configured. Using mock data.');
      return this.getMockEmails(limit);
    }

    try {
      const response = await fetch(
        `${this.apiEndpoint}/me/mailfolders/inbox/messages?$top=${limit}&$orderby=receivedDateTime desc`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      if (!response.ok) throw new Error(`Email fetch failed: ${response.status}`);

      const data = await response.json();
      return this.formatEmails(data.value || []);
    } catch (error) {
      console.error('Email fetch error:', error);
      return [];
    }
  }

  /**
   * Fetch Teams activity/messages
   * @param {String} teamId - Teams ID
   * @returns {Promise<Array>} Teams activity
   */
  async getTeamsActivity(teamId = null) {
    if (!this.accessToken) {
      console.warn('Microsoft Graph token not configured. Using mock data.');
      return this.getMockTeamsActivity();
    }

    try {
      const endpoint = teamId
        ? `${this.apiEndpoint}/teams/${teamId}/channels`
        : `${this.apiEndpoint}/me/teamwork/joinedTeams`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      if (!response.ok) throw new Error(`Teams fetch failed: ${response.status}`);

      const data = await response.json();
      return this.formatTeamsData(data.value || []);
    } catch (error) {
      console.error('Teams fetch error:', error);
      return [];
    }
  }

  /**
   * Format calendar events into activity objects
   * @param {Array} events - Raw calendar events
   * @returns {Array} Formatted activities
   */
  formatCalendarEvents(events) {
    return events.map((event) => ({
      type: 'calendar',
      title: event.subject || 'No title',
      startTime: event.start?.dateTime || event.start?.date,
      endTime: event.end?.dateTime || event.end?.date,
      description: event.bodyPreview || '',
      organizer: event.organizer?.emailAddress?.name || 'Unknown',
      attendees: event.attendees?.length || 0,
    }));
  }

  /**
   * Format emails into activity objects
   * @param {Array} emails - Raw emails
   * @returns {Array} Formatted activities
   */
  formatEmails(emails) {
    return emails.map((email) => ({
      type: 'email',
      title: email.subject || '(No subject)',
      from: email.from?.emailAddress?.name || 'Unknown',
      receivedTime: email.receivedDateTime,
      preview: email.bodyPreview || '',
      importance: email.importance || 'normal',
    }));
  }

  /**
   * Format Teams data into activity objects
   * @param {Array} data - Raw Teams data
   * @returns {Array} Formatted activities
   */
  formatTeamsData(data) {
    return data.map((item) => ({
      type: 'teams',
      title: item.displayName || 'No title',
      description: item.description || '',
      memberCount: item.memberCount || 0,
    }));
  }

  /**
   * Get mock calendar events for testing
   * @param {String} date - Date
   * @returns {Array} Mock events
   */
  getMockCalendarEvents(date) {
    return [
      {
        type: 'calendar',
        title: 'デジタル支援員契約書準備',
        startTime: `${date}T14:00:00Z`,
        endTime: `${date}T17:00:00Z`,
        description: '山之上様、白坂さん、日高純司さんの契約書準備',
        organizer: 'System',
        attendees: 0,
      },
      {
        type: 'calendar',
        title: 'マンションプラン機器設定サポート',
        startTime: `${date}T10:00:00Z`,
        endTime: `${date}T14:00:00Z`,
        description: 'WiFi設定など機器セットアップ',
        organizer: 'Team Lead',
        attendees: 2,
      },
    ];
  }

  /**
   * Get mock emails for testing
   * @param {Number} limit - Number of emails
   * @returns {Array} Mock emails
   */
  getMockEmails(limit) {
    const mockEmails = [
      {
        type: 'email',
        title: '土岐さんからの問い合わせ',
        from: '土岐さん',
        receivedTime: new Date().toISOString(),
        preview: '契約書の件について...',
        importance: 'high',
      },
      {
        type: 'email',
        title: '総務省事業に関する通知',
        from: '総務省事務局',
        receivedTime: new Date().toISOString(),
        preview: '本年度事業の終了について...',
        importance: 'high',
      },
    ];

    return mockEmails.slice(0, limit);
  }

  /**
   * Get mock Teams activity for testing
   * @returns {Array} Mock Teams data
   */
  getMockTeamsActivity() {
    return [
      {
        type: 'teams',
        title: 'デジタル支援事業チーム',
        description: 'デジタル活用支援に関する打ち合わせ',
        memberCount: 5,
      },
      {
        type: 'teams',
        title: 'マンションプラン推進チーム',
        description: 'マンションまるごとプランの実装推進',
        memberCount: 3,
      },
    ];
  }

  /**
   * Merge data from multiple sources
   * @param {String} date - Date for activity
   * @returns {Promise<Array>} Merged activities
   */
  async getMergedActivities(date) {
    const [calendarEvents, emails, teamsActivity] = await Promise.all([
      this.getCalendarEvents(date),
      this.getRecentEmails(5),
      this.getTeamsActivity(),
    ]);

    return {
      calendar: calendarEvents,
      emails,
      teams: teamsActivity,
      all: [...calendarEvents, ...emails, ...teamsActivity],
    };
  }
}

module.exports = MicrosoftGraphIntegration;
