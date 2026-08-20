/**
 * Eventra - Multi-event data model
 *
 * One Google Spreadsheet per event, with these tabs:
 * Events (optional master sheet)
 * Participants
 * Payments
 * Submissions
 * Reviewers
 * ReviewerAssignments
 * Reviews
 * Notifications
 * Programme
 * Attendance
 * Certificates
 */

export const EVENT_TABS = [
  "Participants",
  "Payments",
  "Submissions",
  "Reviewers",
  "ReviewerAssignments",
  "Reviews",
  "Notifications",
  "Programme",
  "Attendance",
  "Certificates",
];

export const SUBMISSION_STATUS = [
  "Submitted",
  "Screening",
  "Under Review",
  "Revision Required",
  "Accepted",
  "Rejected",
];

export const PAYMENT_STATUS = [
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
];

export const PARTICIPANT_STATUS = [
  "Registered",
  "Confirmed",
  "Cancelled",
];
