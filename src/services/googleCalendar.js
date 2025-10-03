/**
 * Google Calendar API service for patient record system
 * Handles authentication, event fetching, and syncing with Google Calendar
 */

import { google } from "googleapis";

// Google API configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin;

// OAuth2 scopes for Google Calendar
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];

// Global variables for OAuth flow
let oauth2Client = null;
let gapi = null;

/**
 * Initialize Google API client
 */
export function initializeGoogleAPI() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn(
      "Google API credentials not configured. Google Calendar integration will be disabled."
    );
    return false;
  }

  try {
    // Initialize OAuth2 client for server-side operations
    oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    return true;
  } catch (error) {
    console.error("Failed to initialize Google API:", error);
    return false;
  }
}

/**
 * Check if Google API is properly configured
 */
export function isGoogleAPIConfigured() {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

/**
 * Get Google OAuth2 authorization URL
 */
export function getAuthUrl() {
  if (!oauth2Client) return null;

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code) {
  if (!oauth2Client) throw new Error("Google API not initialized");

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    throw error;
  }
}

/**
 * Set OAuth2 credentials
 */
export function setCredentials(tokens) {
  if (!oauth2Client) throw new Error("Google API not initialized");
  oauth2Client.setCredentials(tokens);
}

/**
 * Create Google Calendar API client
 */
function createCalendarClient() {
  if (!oauth2Client) throw new Error("Google API not initialized");
  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Fetch events from Google Calendar
 */
export async function fetchGoogleCalendarEvents(
  timeMin = null,
  timeMax = null,
  calendarId = "primary"
) {
  if (!oauth2Client) throw new Error("Google API not initialized");

  try {
    const calendar = createCalendarClient();

    const params = {
      calendarId,
      singleEvents: true,
      orderBy: "startTime",
    };

    if (timeMin) params.timeMin = timeMin;
    if (timeMax) params.timeMax = timeMax;

    const response = await calendar.events.list(params);

    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    throw error;
  }
}

/**
 * Create an event in Google Calendar
 */
export async function createGoogleCalendarEvent(
  eventData,
  calendarId = "primary"
) {
  if (!oauth2Client) throw new Error("Google API not initialized");

  try {
    const calendar = createCalendarClient();

    const event = {
      summary: eventData.title || eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: eventData.timeZone || "UTC",
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: eventData.timeZone || "UTC",
      },
      location: eventData.location,
      attendees: eventData.attendees,
    };

    const response = await calendar.events.insert({
      calendarId,
      resource: event,
    });

    return response.data;
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    throw error;
  }
}

/**
 * Update an event in Google Calendar
 */
export async function updateGoogleCalendarEvent(
  eventId,
  eventData,
  calendarId = "primary"
) {
  if (!oauth2Client) throw new Error("Google API not initialized");

  try {
    const calendar = createCalendarClient();

    const event = {
      summary: eventData.title || eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: eventData.timeZone || "UTC",
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: eventData.timeZone || "UTC",
      },
      location: eventData.location,
      attendees: eventData.attendees,
    };

    const response = await calendar.events.update({
      calendarId,
      eventId,
      resource: event,
    });

    return response.data;
  } catch (error) {
    console.error("Error updating Google Calendar event:", error);
    throw error;
  }
}

/**
 * Delete an event from Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  eventId,
  calendarId = "primary"
) {
  if (!oauth2Client) throw new Error("Google API not initialized");

  try {
    const calendar = createCalendarClient();

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    return true;
  } catch (error) {
    console.error("Error deleting Google Calendar event:", error);
    throw error;
  }
}

/**
 * Convert system appointment to Google Calendar event format
 */
export function convertAppointmentToGoogleEvent(appointment) {
  const startDateTime = `${appointment.date}T${appointment.time}:00`;
  const duration = appointment.duration || 30; // minutes
  const endDateTime = new Date(
    new Date(startDateTime).getTime() + duration * 60000
  ).toISOString();

  return {
    summary: `Appointment: ${appointment.patient}`,
    description: `Medical appointment for ${
      appointment.patient
    }\nDuration: ${duration} minutes\n${appointment.description || ""}`,
    startDateTime,
    endDateTime,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: "Medical Clinic",
  };
}

/**
 * Convert Google Calendar event to system format
 */
export function convertGoogleEventToAppointment(googleEvent) {
  const start = new Date(googleEvent.start.dateTime || googleEvent.start.date);
  const end = new Date(googleEvent.end.dateTime || googleEvent.end.date);

  return {
    id: `google_${googleEvent.id}`,
    title: googleEvent.summary,
    description: googleEvent.description,
    date: start.toISOString().split("T")[0],
    time: start.toTimeString().slice(0, 5),
    duration: Math.round((end - start) / (1000 * 60)), // minutes
    patient: googleEvent.summary.replace(/^Appointment:\s*/, ""),
    type: "google_calendar",
    googleEventId: googleEvent.id,
    source: "google",
  };
}

/**
 * Check if user has valid Google Calendar access
 */
export async function checkGoogleCalendarAccess() {
  if (!oauth2Client) return false;

  try {
    const calendar = createCalendarClient();
    await calendar.calendarList.list({ maxResults: 1 });
    return true;
  } catch (error) {
    console.error("Google Calendar access check failed:", error);
    return false;
  }
}

/**
 * Refresh OAuth2 tokens if needed
 */
export async function refreshTokensIfNeeded() {
  if (!oauth2Client) return false;

  try {
    const tokens = oauth2Client.credentials;
    if (
      tokens &&
      tokens.expiry_date &&
      tokens.expiry_date < Date.now() + 60000
    ) {
      // Token expires within 1 minute, refresh it
      await oauth2Client.refreshAccessToken();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    return false;
  }
}

export default {
  initializeGoogleAPI,
  isGoogleAPIConfigured,
  getAuthUrl,
  getTokensFromCode,
  setCredentials,
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  convertAppointmentToGoogleEvent,
  convertGoogleEventToAppointment,
  checkGoogleCalendarAccess,
  refreshTokensIfNeeded,
};
