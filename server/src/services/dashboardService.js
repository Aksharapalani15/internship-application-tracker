const { pool } = require("../config/db");

/**
 * Dashboard & Analytics Service
 * 
 * Computes live, aggregate performance metrics, activity timelines, and deadlines
 * using optimized single-query SQL aggregates scoped exclusively to the authenticated user.
 */

/**
 * Calculates high-level application metrics and conversion rates.
 * 
 * FORMULA DEFINITIONS & DESIGN DECISIONS:
 * 1. Active In-Progress Pipeline: All records not yet finalized (Applied, Assessment, Interview).
 * 2. Interview Conversion Rate:
 *    Formula: ((Interview + Offer) / Active + Closed Applications) * 100
 *    Where denominator excludes 'Saved' drafts (which haven't been submitted yet).
 *    If submitted applications count is 0, rate is 0.0%.
 * 3. Offer Conversion Rate:
 *    Formula: (Offers / (Interviews + Offers)) * 100
 *    Measures the ratio of interview stages that successfully culminated in an offer.
 *    If 0 interviews took place, rate is 0.0%.
 * 
 * @param {number} userId 
 * @returns {Promise<object>}
 */
async function getStats(userId) {
  const query = `
    SELECT
      COUNT(*) AS totalApplications,
      COUNT(CASE WHEN status = 'Saved' THEN 1 END) AS savedCount,
      COUNT(CASE WHEN status = 'Applied' THEN 1 END) AS appliedCount,
      COUNT(CASE WHEN status = 'Assessment' THEN 1 END) AS assessmentCount,
      COUNT(CASE WHEN status = 'Interview' THEN 1 END) AS interviewCount,
      COUNT(CASE WHEN status = 'Offer' THEN 1 END) AS offerCount,
      COUNT(CASE WHEN status = 'Rejected' THEN 1 END) AS rejectedCount,
      COUNT(CASE WHEN status = 'Withdrawn' THEN 1 END) AS withdrawnCount
    FROM applications
    WHERE user_id = ?
  `;

  const [rows] = await pool.query(query, [userId]);
  const row = rows[0] || {};

  const total = Number(row.totalApplications) || 0;
  const saved = Number(row.savedCount) || 0;
  const applied = Number(row.appliedCount) || 0;
  const assessment = Number(row.assessmentCount) || 0;
  const interview = Number(row.interviewCount) || 0;
  const offer = Number(row.offerCount) || 0;
  const rejected = Number(row.rejectedCount) || 0;
  const withdrawn = Number(row.withdrawnCount) || 0;

  // Submitted applications = all non-draft applications
  const submittedApplications = total - saved;

  // Applications that reached interview stage or higher
  const reachedInterviewOrOffer = interview + offer;

  const interviewConversionRate =
    submittedApplications > 0
      ? Number(((reachedInterviewOrOffer / submittedApplications) * 100).toFixed(2))
      : 0.0;

  const offerConversionRate =
    reachedInterviewOrOffer > 0
      ? Number(((offer / reachedInterviewOrOffer) * 100).toFixed(2))
      : 0.0;

  return {
    totalApplications: total,
    statusCounts: {
      Saved: saved,
      Applied: applied,
      Assessment: assessment,
      Interview: interview,
      Offer: offer,
      Rejected: rejected,
      Withdrawn: withdrawn,
    },
    interviewCount: interview,
    offerCount: offer,
    rejectionCount: rejected,
    conversionRates: {
      interviewConversionRate,
      offerConversionRate,
    },
  };
}

/**
 * Retrieves monthly application submission velocity for the past 6 calendar months.
 * Designed directly for frontend data charting (e.g. Recharts, Chart.js).
 * 
 * @param {number} userId 
 * @returns {Promise<Array<{ period: string, count: number }>>}
 */
async function getActivity(userId) {
  const query = `
    SELECT
      DATE_FORMAT(COALESCE(date_applied, DATE(created_at)), '%Y-%m') AS period,
      COUNT(*) AS count
    FROM applications
    WHERE user_id = ?
      AND COALESCE(date_applied, DATE(created_at)) >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
    GROUP BY period
    ORDER BY period ASC
  `;

  const [rows] = await pool.query(query, [userId]);

  return rows.map((row) => ({
    period: row.period,
    count: Number(row.count),
  }));
}

/**
 * Retrieves upcoming and overdue deadlines and follow-up reminders.
 * 
 * @param {number} userId 
 * @returns {Promise<object>}
 */
async function getUpcomingDeadlines(userId) {
  // 1. Upcoming deadlines (future, not yet submitted or draft)
  const upcomingDeadlinesQuery = `
    SELECT id, company_name, role, status, application_deadline AS date
    FROM applications
    WHERE user_id = ?
      AND application_deadline IS NOT NULL
      AND application_deadline >= CURRENT_DATE()
      AND status IN ('Saved', 'Applied')
    ORDER BY application_deadline ASC
    LIMIT 10
  `;

  // 2. Overdue deadlines (past deadline, still marked Saved or Applied)
  const overdueDeadlinesQuery = `
    SELECT id, company_name, role, status, application_deadline AS date
    FROM applications
    WHERE user_id = ?
      AND application_deadline IS NOT NULL
      AND application_deadline < CURRENT_DATE()
      AND status IN ('Saved', 'Applied')
    ORDER BY application_deadline DESC
    LIMIT 10
  `;

  // 3. Upcoming follow-up reminders
  const upcomingFollowUpsQuery = `
    SELECT id, company_name, role, status, next_action, follow_up_date AS date
    FROM applications
    WHERE user_id = ?
      AND follow_up_date IS NOT NULL
      AND follow_up_date >= CURRENT_DATE()
      AND status NOT IN ('Offer', 'Rejected', 'Withdrawn')
    ORDER BY follow_up_date ASC
    LIMIT 10
  `;

  // 4. Overdue follow-up reminders
  const overdueFollowUpsQuery = `
    SELECT id, company_name, role, status, next_action, follow_up_date AS date
    FROM applications
    WHERE user_id = ?
      AND follow_up_date IS NOT NULL
      AND follow_up_date < CURRENT_DATE()
      AND status NOT IN ('Offer', 'Rejected', 'Withdrawn')
    ORDER BY follow_up_date DESC
    LIMIT 10
  `;

  const [
    [upcomingDeadlines],
    [overdueDeadlines],
    [upcomingFollowUps],
    [overdueFollowUps],
  ] = await Promise.all([
    pool.query(upcomingDeadlinesQuery, [userId]),
    pool.query(overdueDeadlinesQuery, [userId]),
    pool.query(upcomingFollowUpsQuery, [userId]),
    pool.query(overdueFollowUpsQuery, [userId]),
  ]);

  return {
    upcomingDeadlines,
    overdueDeadlines,
    upcomingFollowUps,
    overdueFollowUps,
  };
}

module.exports = {
  getStats,
  getActivity,
  getUpcomingDeadlines,
};
