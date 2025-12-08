---
title: Product Requirements Document
app: flying-salamander-chirp
created: 2025-12-08T16:52:17.910Z
version: 1
source: Deep Mode PRD Generation
---

# PRODUCT REQUIREMENTS DOCUMENT

**EXECUTIVE SUMMARY**

*   **Product Vision:** Daily Action Hub aims to be the essential productivity platform for busy professionals, integrating with Google Calendar to transform meeting outcomes into actionable tasks with one-click execution, ensuring no important follow-up falls through the cracks.
*   **Core Purpose:** To automate the capture, processing, and execution of meeting follow-ups, reducing cognitive load and decision fatigue for managers and executives.
*   **Target Users:** Product Managers, Executives, Team Leads, Project Coordinators, and other professionals with high meeting loads who frequently attend both online and offline meetings.
*   **Key Features:**
    *   Google Calendar Integration (System)
    *   Meeting Recording Retrieval (User-Generated Content)
    *   AI-powered Next Step Extraction (User-Generated Content)
    *   One-Click Action Item Generation (User-Generated Content)
    *   Daily Dashboard for Today's Actions (User-Generated Content)
*   **Complexity Assessment:** Moderate
    *   **State Management:** Local (user-specific data, no complex distributed state).
    *   **External Integrations:** 4 (Google Calendar, Gmail, Granola, Notion). These are independent API calls, which simplifies integration complexity.
    *   **Business Logic:** Moderate (orchestrating multiple integrations, conditional workflows for meeting types, AI processing of external summaries, action generation).
    *   **Data Synchronization:** Basic (one-way sync from Google Calendar, push to Gmail/Google Calendar/Notion/Granola).
*   **MVP Success Metrics:**
    *   Users can successfully connect Google Calendar, Granola, Notion, and Gmail.
    *   Users can complete the core workflow: from a meeting (online/offline/unrecorded) to a confirmed and executed action (email, calendar invite, Notion/Granola task).
    *   The system reliably processes daily meetings and presents them on the "Today's Dashboard."

**1. USERS & PERSONAS**

*   **Primary Persona:**
    *   **Name:** Sarah, The Executive Lead
    *   **Context:** Sarah is a busy executive who spends 60-70% of her day in meetings (both online and offline). She struggles to keep up with follow-ups, often prioritizing urgent but less important tasks over critical action items from meetings. She uses Google Calendar, Gmail, and her team uses Notion for project tracking.
    *   **Goals:** To ensure no important action items from meetings are missed, to reduce the time spent reviewing meeting notes or recordings, and to streamline the process of turning discussions into concrete tasks.
    *   **Needs:** An automated system that identifies meeting outcomes, suggests next steps, and allows for quick, one-click execution of follow-up actions.
*   **Secondary Personas:**
    *   **Name:** Mark, The Project Coordinator
    *   **Context:** Mark manages multiple projects and teams, requiring him to attend numerous internal and external meetings. He needs to efficiently track and assign tasks that emerge from these discussions.
    *   **Goals:** To centralize meeting follow-ups, easily assign tasks to team members, and maintain transparency on project progress.
    *   **Needs:** A tool that integrates with his existing task management (Notion) and helps him quickly process meeting outputs into actionable items.

**2. FUNCTIONAL REQUIREMENTS**

*   **2.1 User-Requested Features (All are Priority 0)**

    *   **FR-001: User Authentication & Authorization**
        *   **Description:** Users can securely sign in to the Daily Action Hub using their Google account (Google OAuth). The system will request necessary permissions for Google Calendar and Gmail integration.
        *   **Entity Type:** System/Configuration
        *   **User Benefit:** Protects user data and personalizes the experience by linking to their existing Google ecosystem.
        *   **Primary User:** All personas
        *   **Lifecycle Operations:**
            *   **Create:** Register new account via Google OAuth.
            *   **View:** View basic profile information (e.g., connected Google account).
            *   **Edit:** Update integration permissions (e.g., disconnect Granola).
            *   **Delete:** Account deletion option (with data export).
            *   **Additional:** Password reset (handled by Google), session management.
        *   **Acceptance Criteria:**
            *   - [ ] Given a Google account, when a user signs in via Google OAuth, then access is granted.
            *   - [ ] Given a user is signed in, when they disconnect an integration (e.g., Granola), then the system revokes access to that service.
            *   - [ ] Users can delete their Daily Action Hub account, and their associated data is removed.

    *   **FR-002: Google Calendar Integration & Meeting Classification**
        *   **Description:** The system automatically syncs the user's Google Calendar daily to retrieve all meetings. It classifies each meeting as "Online" (if a Zoom/Meet/Teams link is detected) or "Offline" (physical location or no online link).
        *   **Entity Type:** System/Configuration (Meeting data is read-only from external source)
        *   **User Benefit:** Provides an automated overview of their meeting schedule and context without manual input.
        *   **Primary User:** All personas
        *   **Lifecycle Operations:**
            *   **Create:** Internal representation of a meeting is created upon sync.
            *   **View:** Users can view meeting details (title, time, participants, online/offline status) within the Daily Action Hub.
            *   **Edit:** Not allowed (meeting data is read-only from Google Calendar).
            *   **Delete:** Internal representation is removed if meeting is deleted from Google Calendar.
            *   **List/Search:** Meetings are listed on the daily dashboard.
        *   **Acceptance Criteria:**
            *   - [ ] Given a connected Google Calendar, when the daily sync runs, then all meetings for the day are retrieved.
            *   - [ ] Given an online meeting (e.g., with a Zoom link), when synced, then it is classified as "Online."
            *   - [ ] Given an offline meeting (e.g., with a physical address), when synced, then it is classified as "Offline."

    *   **FR-003: Recording Retrieval (Granola/Notion)**
        *   **Description:** For online meetings, the system attempts to match meeting metadata (title, time, participants) against entries in the user's connected Granola and/or Notion accounts. If a match is found, it retrieves the summary/transcript link. If no recording is found, the meeting is marked as "unrecorded."
        *   **Entity Type:** User-Generated Content (MeetingSummary)
        *   **User Benefit:** Eliminates the need to manually search for meeting recordings or rewatch entire sessions.
        *   **Primary User:** All personas
        *   **Lifecycle Operations:**
            *   **Create:** MeetingSummary is created internally upon successful retrieval.
            *   **View:** Users can view the retrieved summary/transcript link.
            *   **Edit:** Not allowed (summary is from external source).
            *   **Delete:** Not applicable (summary is linked, not stored directly).
            *   **Additional:** Mark as "unrecorded" if no match.
        *   **Acceptance Criteria:**
            *   - [ ] Given an online meeting with a corresponding Granola/Notion entry, when the system attempts retrieval, then the summary/transcript link is successfully retrieved.
            *   - [ ] Given an online meeting with no corresponding Granola/Notion entry, when the system attempts retrieval, then the meeting is marked as "unrecorded."

    *   **FR-004: AI-powered Next Step Extraction**
        *   **Description:** The system parses the retrieved Granola/Notion summaries (or user-provided text for offline/unrecorded meetings) to identify and extract explicit next steps, including potential owners and due dates if mentioned.
        *   **Entity Type:** User-Generated Content (ActionItem)
        *   **User Benefit:** Automatically identifies actionable tasks, saving time and reducing the risk of missing critical follow-ups.
        *   **Primary User:** All personas
        *   **Lifecycle Operations:**
            *   **Create:** Proposed ActionItems are generated from summaries/user input.
            *   **View:** Users can view the proposed next steps.
            *   **Edit:** Users can modify the proposed next steps (see FR-006).
            *   **Delete:** Users can reject/delete proposed next steps (see FR-006).
            *   **List/Search:** Proposed next steps are listed on the daily dashboard.
        *   **Acceptance Criteria:**
            *   - [ ] Given a Granola/Notion summary containing an explicit action item (e.g., "John to send report by Friday"), when processed, then a proposed ActionItem "Send report" with owner "John" and due date "Friday" is extracted.
            *   - [ ] Given user input for an offline meeting, when processed, then a proposed ActionItem is generated from the text.

    *   **FR-005: Action Item Generation & Execution**
        *   **Description:** For each extracted next step, the system provides a dropdown of actionable choices: "Send Email," "Create Calendar Invite," or "Assign Task (to Notion/Granola)." Upon user selection and confirmation, the system executes the chosen action:
            *   **Send Email:** Drafts a Gmail message pre-filled with recipient(s), subject, and body based on meeting context and next step.
            *   **Create Calendar Invite:** Suggests available slots via Google Calendar and pre-fills invite details.
            *   **Assign Task:** Pushes the task into the user's connected Notion or Granola account.
        *   **Entity Type:** User-Generated Content (ActionItem)
        *   **User Benefit:** Enables one-click execution of follow-ups, drastically reducing friction and time spent on administrative tasks.
        *   **Primary User:** All personas
        *   **Lifecycle Operations:**
            *   **Create:** ActionItem is created upon user confirmation.
            *   **View:** Users can view the status of an ActionItem (pending, executed).
            *   **Edit:** Users can modify the action details (e.g., email recipients, task description) before execution.
            *   **Delete:** Users can delete an ActionItem.
            *   **Additional:** Execute (trigger external API call).
        *   **Acceptance Criteria:**
            *   - [ ] Given a proposed next step, when the user selects "Send Email" and confirms, then a pre-filled Gmail draft is created.
            *   - [ ] Given a proposed next step, when the user selects "Create Calendar Invite" and confirms, then a Google Calendar invite is created with suggested slots.
            *   - [ ] Given a proposed next step, when the user selects "Assign Task" and confirms, then a task is created in Notion or Granola.

    *   **FR-006: User Control & Confirmation**
        *   **Description:** Before any action is executed (email sent, invite created, task assigned), the user is presented with the proposed next step and action details. They can edit the next step's text, modify action parameters (e.g., email recipients, task due date), or reject/delete the proposed action entirely.
        *   **Entity Type:** User-Generated Content (ActionItem)
        *   **User Benefit:** Builds confidence and trust by ensuring the user remains in control of all automated actions.
        *   **Primary User:** All personas
        *   **Lifecycle Operations:**
            *   **Edit:** Users can modify proposed ActionItems.
            *   **Delete:** Users can reject/delete proposed ActionItems.
            *   **Additional:** Confirm (move from pending to executed).
        *   **Acceptance Criteria:**
            *   - [ ] Given a proposed ActionItem, when the user clicks "Edit," then they can modify its text and associated action parameters.
            *   - [ ] Given a proposed ActionItem, when the user clicks "Reject" or "Delete," then the ActionItem is removed from the dashboard.

    *   **FR-007: Fallback Workflow (Unclear Next Steps)**
        *   **Description:** When the AI cannot confidently infer a next step from a summary (or if a meeting is marked "unrecorded"), the system prompts the user with "What should the next step be?" User input is then converted into a structured action item with associated action buttons (as per FR-005).
        *   **Entity Type:** User-Generated Content (ActionItem)
        *   **User Benefit:** Ensures that even ambiguous or unrecorded meetings can still generate actionable follow-ups, preventing anything from falling through the cracks.
        *   **Primary User:** All personas
        *   **Lifecycle Operations:**
            *   **Create:** ActionItem is created from user text input.
            *   **View:** User can view their input as a structured action.
            *   **Edit:** User can edit their input before it's structured.
            *   **Delete:** User can discard their input.
        *   **Acceptance Criteria:**
            *   - [ ] Given a meeting where no next steps are extracted, when the user views it, then they are prompted to manually enter next steps.
            *   - [ ] Given user input in the fallback prompt, when submitted, then it is converted into a proposed ActionItem with action choices.

    *   **FR-008: Offline Meeting Workflow**
        *   **Description:** For meetings classified as "Offline," the system prompts the user with "You had an offline meeting with [X]. Any to-dos?" The user can type free-form text, which the system then processes to determine next steps and generate relevant actions (similar to FR-007).
        *   **Entity Type:** User-Generated Content (ActionItem)
        *   **User Benefit:** Provides a dedicated mechanism to capture tasks from in-person meetings, preventing them from being forgotten.
        *   **Primary User:** All personas
        *   **Lifecycle Operations:**
            *   **Create:** ActionItem is created from user text input.
            *   **View:** User can view their input as a structured action.
            *   **Edit:** User can edit their input before it's structured.
            *   **Delete:** User can discard their input.
        *   **Acceptance Criteria:**
            *   - [ ] Given an offline meeting, when the user views it, then they are prompted to manually enter to-dos.
            *   - [ ] Given user input for an offline meeting, when submitted, then it is converted into a proposed ActionItem with action choices.

    *   **FR-009: Daily Dashboard (Today's View)**
        *   **Description:** A centralized interface displaying all of *today's* meetings (online/offline), their summaries (auto-generated or user-input), and the associated next steps with their action choices. It includes a "Pending" section for unconfirmed actions.
        *   **Entity Type:** User-Generated Content (Meeting, MeetingSummary, ActionItem)
        *   **User Benefit:** Provides a single, clear overview of all daily follow-ups, enabling efficient prioritization and execution.
        *   **Primary User:** All personas
        *   **Lifecycle Operations:**
            *   **View:** Users can view all relevant information for today's meetings and actions.
            *   **List/Search:** Meetings and actions are listed chronologically.
        *   **Acceptance Criteria:**
            *   - [ ] Given a user with meetings and actions for today, when they access the dashboard, then all today's meetings, summaries, and actions are displayed.
            *   - [ ] The dashboard clearly distinguishes between confirmed and pending actions.

*   **2.2 Essential Market Features**

    *   **FR-XXX: User Profile & Settings**
        *   **Description:** Users can view and manage their basic profile information and integration settings.
        *   **Entity Type:** Configuration/System
        *   **User Benefit:** Allows users to personalize their experience and manage connected services.
        *   **Primary User:** All personas
        *   **Lifecycle Operations:**
            *   **View:** View connected integrations.
            *   **Edit:** Enable/disable integrations.
        *   **Acceptance Criteria:**
            *   - [ ] Users can see which external services (Google Calendar, Gmail, Granola, Notion) are connected.
            *   - [ ] Users can disconnect any of the integrated services.

**3. USER WORKFLOWS**

*   **3.1 Primary Workflow: Process Daily Meeting Outcomes**
    *   **Trigger:** User logs in to Daily Action Hub in the morning.
    *   **Outcome:** User reviews and executes all critical follow-up actions from their meetings.
    *   **Steps:**
        1.  User logs in via Google OAuth.
        2.  System automatically syncs Google Calendar for today's meetings (FR-002).
        3.  System attempts to retrieve Granola/Notion summaries for online meetings (FR-003).
        4.  System processes summaries (or marks as unrecorded) and extracts proposed next steps (FR-004).
        5.  For offline/unrecorded meetings, system prompts user for manual input (FR-007, FR-008).
        6.  User views "Today's Dashboard" (FR-009) showing all meetings, summaries, and proposed next steps with action choices.
        7.  For each proposed next step, user reviews, edits (FR-006), selects an action (FR-005), and confirms.
        8.  System executes the chosen action (e.g., drafts Gmail, creates Calendar Invite, assigns task in Notion/Granola) (FR-005).
        9.  User repeats for all pending actions until the dashboard is clear.

*   **3.2 Entity Management Workflows**

    *   **ActionItem Management Workflow**
        *   **Create ActionItem (Automated):**
            1.  System processes meeting summary/user input.
            2.  System generates proposed ActionItem.
            3.  User reviews and confirms the ActionItem.
            4.  System confirms creation and marks as pending execution.
        *   **Create ActionItem (Manual):**
            1.  User is prompted for input for offline/unrecorded meetings.
            2.  User types in next steps.
            3.  System converts input into proposed ActionItem.
            4.  User reviews and confirms the ActionItem.
            5.  System confirms creation and marks as pending execution.
        *   **Edit ActionItem:**
            1.  User locates a pending ActionItem on the dashboard.
            2.  User clicks "Edit" option.
            3.  User modifies the next step text or action parameters.
            4.  User saves changes.
            5.  System updates the ActionItem.
        *   **Delete ActionItem:**
            1.  User locates a pending ActionItem.
            2.  User clicks "Reject" or "Delete" option.
            3.  System asks for confirmation.
            4.  User confirms deletion.
            5.  System removes the ActionItem from the dashboard.
        *   **Execute ActionItem:**
            1.  User locates a pending ActionItem.
            2.  User selects an action (e.g., "Send Email").
            3.  User confirms execution.
            4.  System triggers the corresponding external API call (Gmail, Google Calendar, Notion/Granola).
            5.  System marks the ActionItem as "Executed."

**4. BUSINESS RULES**

*   **Entity Lifecycle Rules:**
    *   **User:** Can create, view, edit (profile/settings), and delete their account. Account deletion should offer data export.
    *   **Meeting:** Read-only from Google Calendar. Internal representation is created/updated/deleted based on Google Calendar sync.
    *   **MeetingSummary:** Created upon retrieval from Granola/Notion. View-only within Daily Action Hub. Not directly editable or deletable by user (source of truth is external).
    *   **ActionItem:**
        *   **Who can create:** System (from AI) or User (manual input).
        *   **Who can view:** Only the owning user.
        *   **Who can edit:** Only the owning user, before execution.
        *   **Who can delete:** Only the owning user, before execution.
        *   **What happens on deletion:** Hard delete from Daily Action Hub.
        *   **Related data handling:** Deleting an ActionItem does not affect the original meeting summary.
*   **Access Control:**
    *   All data and actions are private to the individual user. There are no sharing or collaboration features in MVP.
    *   Access to external services (Google Calendar, Gmail, Granola, Notion) requires explicit OAuth consent from the user.
*   **Data Rules:**
    *   Meeting classification (Online/Offline) is based on the presence of known video conferencing links (Zoom, Google Meet, Microsoft Teams).
    *   Action items must have a description. Owner and due date are optional.
    *   Gmail drafts will be created in the user's Gmail account.
    *   Google Calendar invites will be created in the user's Google Calendar.
    *   Tasks will be created in the user's specified Notion or Granola workspace/database.
*   **Process Rules:**
    *   Google Calendar sync runs daily, preferably in the early morning.
    *   If multiple Granola/Notion entries match a meeting, the system should prioritize the most relevant (e.g., by exact title/time match) or present options to the user (deferred for MVP, assume single best match).
    *   If no recording is found for an online meeting, it follows the "unrecorded" workflow, prompting for user input.

**5. DATA REQUIREMENTS**

*   **Core Entities:**
    *   **User**
        *   **Type:** System/Configuration
        *   **Attributes:** `user_id` (identifier), `google_id`, `email`, `name`, `created_date`, `last_modified_date`, `google_calendar_access_token`, `gmail_access_token`, `granola_access_token`, `notion_access_token`
        *   **Relationships:** Has many Meetings, Has many ActionItems
        *   **Lifecycle:** Full CRUD with account deletion option
        *   **Retention:** User-initiated deletion with data export (basic export of ActionItems).
    *   **Meeting**
        *   **Type:** System/Configuration (derived from external source)
        *   **Attributes:** `meeting_id` (identifier), `google_event_id`, `user_id` (owner), `title`, `start_time`, `end_time`, `is_online` (boolean), `location`, `participants` (list of emails), `summary_link` (URL to Granola/Notion), `is_recorded` (boolean), `created_date`, `last_modified_date`
        *   **Relationships:** Belongs to User, Has one MeetingSummary (link), Has many ActionItems
        *   **Lifecycle:** Create/View/Delete (based on Google Calendar sync), Not editable directly.
        *   **Retention:** Deleted if removed from Google Calendar.
    *   **MeetingSummary**
        *   **Type:** User-Generated Content (link to external source)
        *   **Attributes:** `summary_id` (identifier), `meeting_id`, `user_id`, `external_url` (link to Granola/Notion summary), `retrieved_date`
        *   **Relationships:** Belongs to Meeting, Belongs to User
        *   **Lifecycle:** Create/View only.
        *   **Retention:** Linked to Meeting.
    *   **ActionItem**
        *   **Type:** User-Generated Content
        *   **Attributes:** `action_item_id` (identifier), `meeting_id` (optional, if from a meeting), `user_id` (owner), `description`, `proposed_action_type` (e.g., "Send Email", "Create Calendar Invite", "Assign Task"), `status` (e.g., "Pending", "Confirmed", "Executed", "Rejected"), `owner` (optional, if extracted), `due_date` (optional, if extracted), `created_date`, `last_modified_date`, `executed_date`
        *   **Relationships:** Belongs to User, Belongs to Meeting (optional)
        *   **Lifecycle:** Create/View/Edit/Delete/Execute
        *   **Retention:** User-initiated deletion.

**6. INTEGRATION REQUIREMENTS**

*   **External Systems:**
    *   **Google Calendar API:**
        *   **Purpose:** Retrieve meeting metadata (title, time, participants, online/offline status).
        *   **Data Exchange:** Read meeting events from user's calendar.
        *   **Frequency:** Daily sync.
    *   **Gmail API:**
        *   **Purpose:** Draft emails.
        *   **Data Exchange:** Create draft email with recipient, subject, body.
        *   **Frequency:** On-demand, when user confirms "Send Email" action.
    *   **Google Calendar API (for invites):**
        *   **Purpose:** Create new calendar events/invites.
        *   **Data Exchange:** Create event with title, time, participants.
        *   **Frequency:** On-demand, when user confirms "Create Calendar Invite" action.
    *   **Granola API:**
        *   **Purpose:** Fetch meeting summaries/transcripts.
        *   **Data Exchange:** Read summary content or link based on meeting metadata.
        *   **Frequency:** On-demand, after Google Calendar sync for online meetings.
    *   **Notion API:**
        *   **Purpose:** Fetch meeting summaries/transcripts, push tasks.
        *   **Data Exchange:** Read summary content or link, create new database entries (tasks).
        *   **Frequency:** On-demand, after Google Calendar sync for online meetings, and when user confirms "Assign Task" action.

**7. FUNCTIONAL VIEWS/AREAS**

*   **Primary Views:**
    *   **Login/Onboarding View:** Google OAuth sign-in, initial permission requests for integrations.
    *   **Today's Daily Dashboard:** (FR-009) Central view displaying today's meetings, summaries, and pending/confirmed action items.
    *   **Meeting Detail View:** A modal or dedicated section for each meeting, showing its summary, extracted next steps, and action choices.
    *   **Action Item Confirmation/Edit Form:** A modal or inline form for users to review, edit, and confirm proposed actions before execution.
    *   **Settings Area:** (FR-XXX) To manage connected integrations and basic user profile.
*   **Modal/Overlay Needs:**
    *   Confirmation dialogs for executing actions (e.g., "Are you sure you want to send this email?").
    *   Confirmation dialogs for deleting ActionItems.
    *   Input prompt for offline/unrecorded meetings.
*   **Navigation Structure:**
    *   **Persistent access to:** Today's Daily Dashboard, Settings.
    *   **Default landing:** Today's Daily Dashboard after login.
    *   **Entity management:** Clicking on a meeting on the dashboard opens its detail view. Clicking on an action item opens its confirmation/edit form.

**8. MVP SCOPE & CONSTRAINTS**

*   **MVP Success Definition:**
    *   A new user can successfully sign up, connect their Google Calendar, Gmail, and at least one of Granola/Notion.
    *   The core workflow (from meeting detection to action execution) functions end-to-end for both online (with summary) and offline/unrecorded meetings.
    *   All features defined in Section 2.1 are fully functional and reliable.
    *   The "Today's Daily Dashboard" accurately reflects current meetings and actions.
*   **Technical Constraints for MVP:**
    *   **Expected concurrent users:** Up to 100.
    *   **Data volume limits:** Reasonable for individual users with typical meeting loads (e.g., 20-30 meetings per day).
    *   **Performance:** Good enough for a responsive user experience, not highly optimized for extreme edge cases.
*   **Explicitly Excluded from MVP:**
    *   **Past Dashboards (7 days, collapsed, color-coded, view more):** Not essential for the core daily action loop. Adds significant UI/UX and data management complexity for historical views.
    *   **Notifications & Reminders (email/in-app, morning brief):** Enhances user engagement but is not critical for the initial validation of the core action creation and execution flow.
    *   **Obsidian Integration:** A specific integration that adds value but is not core to the primary task management flow (Notion/Granola are sufficient for MVP).
    *   **Advanced "Assign Task" Integrations (Asana, Jira, Trello):** Expanding task system integrations beyond Notion/Granola is a clear V2 feature.
    *   **Dashboard Filtering/Searching:** Basic listing is sufficient for MVP; advanced search/filter adds complexity.
    *   **Advanced Named Entity Recognition (NER):** While the AI will implicitly use NER to extract owners/dates, building a robust, configurable NER system is more complex than simply extracting the "next step" text and allowing the user to refine it. For MVP, the focus is on extracting the core action and allowing user confirmation.
    *   **Scalability for 1000+ events/month and multi-user org accounts:** MVP focuses on single-user functionality and reasonable load.
    *   **Full GDPR-compliant data deletion/export:** A basic account deletion with data removal is sufficient for MVP; full GDPR compliance with detailed data export can be enhanced post-MVP.
*   **Post-MVP Roadmap Preview:**
    *   Implement "Past Dashboards" with historical views, filtering, and status indicators.
    *   Add Notifications & Reminders (email, in-app, daily brief).
    *   Integrate with additional task management systems (Asana, Jira, Trello) and note-taking apps (Obsidian).
    *   Introduce advanced dashboard filtering and search capabilities.
    *   Explore team/organization-level features and analytics.

**9. ASSUMPTIONS & DECISIONS**

*   **Business Model:** Assumed to be a freemium or subscription model, but not defined for MVP.
*   **Access Model:** Individual user accounts only for MVP. No team or multi-tenant features.
*   **Entity Lifecycle Decisions:**
    *   **Meeting:** Read-only from Google Calendar. Internal representation mirrors Google Calendar.
    *   **MeetingSummary:** View-only. The Daily Action Hub does not generate summaries, it consumes them from Granola/Notion.
    *   **ActionItem:** Full CRUD + execution. User has full control over proposed actions.
*   **From User's Product Idea:**
    *   **Product:** A web application that integrates with Google Calendar, Granola, Notion, and Gmail to automate meeting follow-ups.
    *   **Technical Level:** User is familiar with modern web applications and integrations.
*   **Key Assumptions Made:**
    *   Granola and Notion APIs provide sufficient access to meeting summaries/transcripts for extraction.
    *   The AI component for extracting next steps from summaries can be implemented using existing NLP models or services (e.g., OpenAI, custom fine-tuned models) via API calls, without requiring complex in-house AI infrastructure development for MVP.
    *   Users will connect at least one of Granola or Notion for online meeting processing. If neither is connected, online meetings will default to the "unrecorded" workflow.
    *   The "AI Evaluation" step focuses on extracting explicit next steps from *already summarized* content provided by Granola/Notion, not performing the initial summarization itself.

PRD Complete - Ready for development