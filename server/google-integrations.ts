import { google } from 'googleapis';
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

// Gmail client helper (using Replit integration)
let gmailConnectionSettings: any;

async function getGmailAccessToken() {
  if (gmailConnectionSettings && gmailConnectionSettings.settings.expires_at && new Date(gmailConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return gmailConnectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  gmailConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = gmailConnectionSettings?.settings?.access_token || gmailConnectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!gmailConnectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

export async function getUncachableGmailClient() {
  const accessToken = await getGmailAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

// Google Calendar client helper (using Replit integration)
let calendarConnectionSettings: any;

async function getCalendarAccessToken() {
  if (calendarConnectionSettings && calendarConnectionSettings.settings.expires_at && new Date(calendarConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return calendarConnectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  calendarConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = calendarConnectionSettings?.settings?.access_token || calendarConnectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!calendarConnectionSettings || !accessToken) {
    throw new Error('Google Calendar not connected');
  }
  return accessToken;
}

export async function getUncachableGoogleCalendarClient() {
  const accessToken = await getCalendarAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

// MCP Tool: Read recent Gmail messages
export const readGmailTool = tool(
  "read_gmail",
  "Read recent emails from Gmail inbox. Returns the most recent emails with sender, subject, snippet, and date information.",
  {
    maxResults: z.number().optional().describe("Maximum number of emails to retrieve (default: 10, max: 50)")
  },
  async (args) => {
    try {
      const gmail = await getUncachableGmailClient();
      const maxResults = Math.min(args.maxResults || 10, 50);
      
      // List messages from inbox
      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        maxResults: maxResults,
        q: 'in:inbox'
      });

      const messages = listResponse.data.messages || [];
      
      if (messages.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: "No messages found in inbox."
          }]
        };
      }

      // Get full details for each message
      const emailDetails = await Promise.all(
        messages.map(async (message) => {
          const msg = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'full'
          });

          const headers = msg.data.payload?.headers || [];
          const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
          const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
          const date = headers.find(h => h.name === 'Date')?.value || 'Unknown Date';
          const snippet = msg.data.snippet || '';

          return `From: ${from}\nSubject: ${subject}\nDate: ${date}\nSnippet: ${snippet}\n`;
        })
      );

      return {
        content: [{
          type: "text" as const,
          text: `Retrieved ${emailDetails.length} recent emails:\n\n${emailDetails.join('\n---\n\n')}`
        }]
      };
    } catch (error: any) {
      // Check for insufficient permissions error
      const errorMsg = error.message || '';
      if (error.code === 403 || errorMsg.includes('insufficient') || errorMsg.includes('scope') || errorMsg.includes('permission')) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ Gmail Read Permission Not Available\n\n` +
                  `The Replit Gmail connector is missing the "gmail.readonly" OAuth scope needed to read your emails.\n\n` +
                  `How to fix:\n` +
                  `1. Contact Replit support at replit.com/support\n` +
                  `2. Request they add the "gmail.readonly" scope to the Gmail connector\n` +
                  `3. Once updated, reconnect your Gmail account in the Connectors panel\n\n` +
                  `In the meantime, you can manually check your emails at gmail.com\n\n` +
                  `Technical details: ${errorMsg}`
          }]
        };
      }
      
      return {
        content: [{
          type: "text" as const,
          text: `Error reading Gmail: ${errorMsg}`
        }]
      };
    }
  }
);

// MCP Tool: Send email via Gmail
export const sendGmailTool = tool(
  "send_gmail",
  "Send an email via Gmail. Compose and send emails to one or more recipients with optional CC, BCC, subject, and body.",
  {
    to: z.string().describe("Recipient email address(es), comma-separated for multiple recipients"),
    subject: z.string().describe("Email subject line"),
    body: z.string().describe("Email body content (plain text or HTML)"),
    cc: z.string().optional().describe("CC email address(es), comma-separated"),
    bcc: z.string().optional().describe("BCC email address(es), comma-separated"),
    isHtml: z.boolean().optional().describe("Whether the body is HTML (default: false)")
  },
  async (args) => {
    try {
      const gmail = await getUncachableGmailClient();
      
      // Build email headers
      const headers = [
        `To: ${args.to}`,
        `Subject: ${args.subject}`
      ];
      
      if (args.cc) {
        headers.push(`Cc: ${args.cc}`);
      }
      
      if (args.bcc) {
        headers.push(`Bcc: ${args.bcc}`);
      }
      
      headers.push(`Content-Type: ${args.isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`);
      headers.push('');
      headers.push(args.body);
      
      // Encode email in base64url format
      const email = headers.join('\r\n');
      const encodedEmail = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Send the email
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail
        }
      });
      
      return {
        content: [{
          type: "text" as const,
          text: `✅ Email sent successfully!\n\n` +
                `To: ${args.to}\n` +
                `Subject: ${args.subject}\n` +
                `Message ID: ${response.data.id}\n` +
                `Thread ID: ${response.data.threadId}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text" as const,
          text: `❌ Error sending email: ${error.message || 'Unknown error'}`
        }]
      };
    }
  }
);

// MCP Tool: Read upcoming calendar events
export const readCalendarTool = tool(
  "read_calendar",
  "Read upcoming events from Google Calendar. Returns events with title, start/end times, location, and description.",
  {
    maxResults: z.number().optional().describe("Maximum number of events to retrieve (default: 10, max: 50)"),
    daysAhead: z.number().optional().describe("Number of days ahead to look (default: 7)")
  },
  async (args) => {
    try {
      const calendar = await getUncachableGoogleCalendarClient();
      const maxResults = Math.min(args.maxResults || 10, 50);
      const daysAhead = args.daysAhead || 7;
      
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      // List events from primary calendar
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: futureDate.toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = response.data.items || [];
      
      if (events.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `No upcoming events found in the next ${daysAhead} days.`
          }]
        };
      }

      // Format events
      const eventDetails = events.map(event => {
        const start = event.start?.dateTime || event.start?.date || 'No start time';
        const end = event.end?.dateTime || event.end?.date || 'No end time';
        const summary = event.summary || 'No Title';
        const location = event.location ? `\nLocation: ${event.location}` : '';
        const description = event.description ? `\nDescription: ${event.description}` : '';
        
        return `Event: ${summary}\nStart: ${start}\nEnd: ${end}${location}${description}`;
      });

      return {
        content: [{
          type: "text" as const,
          text: `Retrieved ${eventDetails.length} upcoming events:\n\n${eventDetails.join('\n\n---\n\n')}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text" as const,
          text: `Error reading Google Calendar: ${error.message}`
        }]
      };
    }
  }
);
