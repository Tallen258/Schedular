# Google Calendar AI Assistant Proposal

I want to create a calendar with an AI assistant that will help me plan and reschedule my week. It will have the ability to find free time, identify good schedules and make changes I approve of.  
It will have room to grow with the ability to compare schedules versus others peoples schedules and plan best meeting time between the two.

---

## Contributors
Taft

---

## My custom features will be
- To have the AI suggest free time slots. Or times when there might be low conflict.  
- The ability to createEvent which will include changing the time and date and add that with user confirmation to the calendar.  
- The ability to reschedule an Event if a conflict arises.  
- The Ability to compare schedules via uploading an image and based on that information propose best times to meet via free time slots.

---

## My additional task will be
To analyze calendar pictures for the schedule comparison.

---

## Pages / Views
1. **Dashboard view:** this will show all upcoming events and free time slots.  
2. **Home page view:** this is for if you're not logged in if not it will be the dashboard view.  
3. **Calendar view:** This will allow me to see the calendar itself.  
4. **Create Event form:** this will be a form that the user can fill out or just tell the AI to do.  
5. **Event Detail view:** this will show specifics about the event and possible conflicts.  
6. **Compare the schedule page:** this will allow for user photo upload and compare schedules.  
7. **Image review page:** to make sure that the AI read it correctly.  
8. **Default settings view:** which allows for user configs to set default work/school hours.  
9. **Help view:** this explains how to use the app.  
10. **AI chat view.**
###########################################################################################
## Project Schedule

### Oct 29

#### Estimates
**Rubric Items**
- [X] Technology: CI/CD pipeline  
- [X] Technology: linting in pipeline  
- [X] Technology: Developer type helping (typescript)  
- [X] Technology: 10+ pages or views  

**Features**
- [X] GitHub repo + README proposal + 10 views list  
- [X] Router with 10 view stubs (TypeScript frontend)  
- [X] Toast provider + error boundary wrappers  
- [X] Create client and server

#### Delivered
**Rubric Items:** [X] CI/CD pipeline, [X] TypeScript, [X] 10+ views
**Features:** [X] All features completed

---

### Nov 1

#### Estimates
**Rubric Items**
- [X] Technology: Client side state stores (e.g. tanstack query or context)  
- [X] Technology: authentication and user account support  
- [X] Technology: authorized pages and public pages  
- [X] Technology: Toasts / global notifications or alerts  

**Features**
- [X] Home (Login) + Dashboard + Calendar (static grid)  
- [X] Reusable inputs v1: DateTimePicker, Toggle, Select  
- [X] Toasts on simple navigation/actions  

#### Delivered
**Rubric Items:** [X] TanStack Query, [X] Authentication (OIDC), [X] Auth/Public pages, [X] Toasts
**Features:** [X] Home/Dashboard/Calendar views, [X] Toast notifications, [X] datetime-local inputs (reusable date/time picker)

---

### Nov 5

#### Estimates
**Rubric Items**
- [X] Technology: use local storage  
- [X] Technology: Error handling (both on api requests and render errors)  
- [X] Technology: Network Calls that read and write data  

**Features**
- [X] Postgres connected (`google_tokens` table created, `events_cache`, `agent_actions` pending)  
- [X] Settings View (work / school hour defaults)  
- [X] Zod schemas (Event, FreeSlot, ActionLogEntry)  
- [X] Create Event Form (simple validation)  

#### Delivered
**Rubric Items:** [X] Local storage (user settings + sync timestamps), [X] Error handling (error boundary + mutation error handling), [X] Network calls (full CRUD API + Google Calendar integration)
**Features:** [X] PostgreSQL with Docker Compose + health checks, [X] Google OAuth token storage table + events table with indexes, [X] Frontend-backend integration, [X] Create Event form with validation and React Hook Form patterns, [X] Settings View with localStorage persistence, [X] Zod schemas (Event, FreeSlot, ActionLogEntry)

---

### Nov 8

#### Estimates
**Rubric Items**
- [X] Technology: tests run in pipeline, pipeline aborts if they fail  
- [X] Technology: authentication and user account support (OAuth integration)  
- [X] Technology: Network Calls that read and write data  

**Features**
- [X] Google OAuth (Auth Code + PKCE) + encrypted token storage  
- [X] Calendar → Create Event flow (confirm → save → navigate)  
- [X] Reusable input #3 (TimeRangePicker or AttendeeSelect)  

#### Delivered
**Rubric Items:** [X] Google OAuth integration with token storage, [X] Full CRUD API for events
**Features:** [X] Google Calendar OAuth flow with refresh token storage, [X] Create/Update/Delete events with form validation, [X] Event sync from Google Calendar to local database, [X] datetime-local inputs for time selection

---

### Nov 12

#### Estimates
**Rubric Items**
- [X] Additional Task: Working with Pictures (OCR endpoint)  
- [X] Technology: 3+ generic form input components  
- [X] Technology: 4+ generic layout components  

**Features**
- [X] Image Review page (verify/edit parsed times)  
- [X] Compare Schedule page (upload photo or add participant)  
- [X] Autonomous action `suggestFreeTimeSlots`  

#### Delivered
**Rubric Items:** [X] Form inputs (datetime-local, text, textarea, checkbox, select), [X] Layout components (card, navbar, sidebar, form layouts)
**Features:** [X] Server code refactored into modular route files (auth, googleOAuth, googleCalendar, events), [X] Schedule comparison page with form, [X] Event Detail page with edit/delete functionality, [X] Help page with getting started guide, [X] Google Calendar sync component with import functionality, [X] Full CRUD operations for events

---

### Nov 15

#### Estimates
**Rubric Items**
- [X] Technology: Client side state stores (e.g. tanstack query or context)  
- [X] Technology: Network Calls that read and write data  
- [X] Technology: Toasts / global notifications or alerts  

**Features**
- [ ] Agent loop MVP (`AI Chat` view stream + confirm/deny)  
- [ ] Persist decisions in `agent_actions` + show Action Log  
- [ ] `rescheduleEvent` wired with confirm  
- [X] Spinners and disabled states  

#### Delivered
**Rubric Items:** [X] TanStack Query state management, [X] Full CRUD network calls with mutations, [X] Toast notifications throughout app
**Features:** [X] AI Chat view with conversational interface, [X] AI tool calling for event creation from chat, [X] Image upload support in chat, [X] Loading states and disabled buttons during mutations

---

### Nov 19

#### Estimates
**Rubric Items**
- [X] Technology: 3+ generic form input components  
- [X] Technology: 4+ generic layout components  
- [X] Technology: Network Calls that read and write data  

**Features**
- [X] `compareSchedulesAndPropose` 
- [ ] Confirmation → `createEvent`  
- [ ] Compare Schedule view shows top slots + reasons  
- [ ] Event Detail page (conflict display)  

#### Delivered
**Rubric Items:** [X] 3 generic form input components (TextInput, TextArea, DateTimeInput), [X] 4 generic layout components (Card, PageContainer, PageHeader, Grid), [X] Network calls (17 total: 6 read + 11 write operations including CRUD events, AI chat, Google Calendar sync, schedule image upload)
**Features:** [X] Schedule comparison with AI vision image parsing, [X] Event conflict detection utilities, [X] Reusable form and layout components implemented

---

### Nov 22

#### Estimates
**Rubric Items**
- [ ] Experience: all experiences mobile friendly  
- [ ] Experience: 3 instances where elements re-order themselves on smaller screens  
- [ ] Professional, organized and smooth experience  

**Features**
- [ ] Responsive layout pass (≥ 3 reorders)  
- [ ] Help View (usage + consent notes)  
- [ ] Polish empty states and layout transitions  

#### Delivered
**Rubric Items:** [X] Agentic UI implementation
**Features:** [X] Agentic UI - actions automatically adjust UI 

---

### Nov 25

#### Estimates
**Rubric Items**
- [X] Technology: tests run in pipeline, pipeline aborts if they fail  
- [X] Technology: authentication and user account support  
- [X] Technology: Loading states and user feedback  

**Features**
- [X] Test suite setup with Vitest  
- [X] Auth buttons and authentication flow improvements  
- [X] Loading spinners throughout app  
- [X] Schedule comparison conflict detection  

#### Delivered
**Rubric Items:**  Authentication improvements (auth buttons),  Loading states (spinners),  Tests (setup complete, need CI integration)
**Features:**  Vitest , Auth button component with Google sign-in, Loading spinners for async operations, Conflict checking for manual event entry (button-triggered), Conflict checking for AI-extracted events,

---

### **Nov 29 — Finish Target**

#### Estimates
**Rubric Items**
- [ ] Project scope is 2–3 times larger than Inventory Management (per group member)  
- [ ] Technology: tests run in pipeline, pipeline aborts if they fail  
- [ ] Technology: linting in pipeline  
- [ ] Technology: CI/CD pipeline  
- [ ] Production deployment (Kubernetes public URL)

**Features**
- [ ] CI tests + lint must pass for deployment  
- [ ] Polish UX details and bug fixes  

#### Delivered
**Rubric Items:**  
**Features:**

---

### Dec 3 (Buffer Week)

#### Estimates
**Rubric Items**
- [ ] Technology: CI/CD pipeline  
- [ ] Professional, organized and smooth experience  

**Features**
- [ ] CI/CD hardening (secrets + prod config)  
- [ ] Documentation and cleanup  

#### Delivered
**Rubric Items:**  
**Features:**

---

### Dec 6 (Final Demo)

#### Estimates
**Rubric Items**
- [ ] Professional, organized and smooth experience  

**Features**
- [ ] Final rubric checklist pass  
- [ ] Demo script + screenshots/gif  
- [ ] Performance tuning and overflow fixes  

#### Delivered
**Rubric Items:**  
**Features:**
