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

Goal: finish one week early (target **Nov 29**).  
Keep everything TypeScript (frontend + backend) and focused on the required rubric items.

---

## Project Schedule

 (target **Nov 29**).  
---

### Oct 29

#### Estimates
**Rubric Items**
- [ ] Technology: CI/CD pipeline  
- [ ] Technology: linting in pipeline  
- [ ] Technology: Developer type helping (typescript)  
- [ ] Technology: 10+ pages or views  

**Features**
- [ ] GitHub repo + README proposal + 10 views list  
- [ ] Router with 10 view stubs (TypeScript frontend)  
- [ ] Toast provider + error boundary wrappers  
- [ ] Create client and server
#### Delivered
**Rubric Items:**  
**Features:**

---

### Nov 1

#### Estimates
**Rubric Items**
- [ ] Technology: Client side state stores (e.g. tanstack query or context)  
- [ ] Technology: authentication and user account support  
- [ ] Technology: authorized pages and public pages  
- [ ] Technology: Toasts / global notifications or alerts  

**Features**
- [ ] Home (Login) + Dashboard + Calendar (static grid)  
- [ ] Reusable inputs v1: DateTimePicker, Toggle, Select  
- [ ] Toasts on simple navigation/actions  

#### Delivered
**Rubric Items:**  
**Features:**

---

### Nov 5

#### Estimates
**Rubric Items**
- [ ] Technology: use local storage  
- [ ] Technology: Error handling (both on api requests and render errors)  
- [ ] Technology: Network Calls that read and write data  

**Features**
- [ ] Postgres connected (`events_cache`, `agent_actions`, `oauth_tokens`)  
- [ ] Settings View (work / school hour defaults)  
- [ ] Zod schemas (Event, FreeSlot, ActionLogEntry)  
- [ ] Create Event Form (simple validation)  

#### Delivered
**Rubric Items:**  
**Features:**

---

### Nov 8

#### Estimates
**Rubric Items**
- [ ] Technology: tests run in pipeline, pipeline aborts if they fail  
- [ ] Technology: authentication and user account support (OAuth integration)  
- [ ] Technology: Network Calls that read and write data  

**Features**
- [ ] Google OAuth (Auth Code + PKCE) + encrypted token storage  
- [ ] Calendar → Create Event flow (confirm → save → navigate)  
- [ ] Reusable input #3 (TimeRangePicker or AttendeeSelect)  

#### Delivered
**Rubric Items:**  
**Features:**

---

### Nov 12

#### Estimates
**Rubric Items**
- [ ] Project scope is 2–3 times larger than Inventory Management (per group member)  
- [ ] Additional Task: Working with Pictures (OCR endpoint)  
- [ ] Technology: 3+ generic form input components  
- [ ] Technology: 4+ generic layout components  

**Features**
- [ ] Image Review page (verify/edit parsed times)  
- [ ] Compare Schedule page (upload photo or add participant)  
- [ ] Autonomous action `suggestFreeTimeSlots`  
- [ ] Confirmation action `createEvent` integrated  

#### Delivered
**Rubric Items:**  
**Features:**

---

### Nov 15

#### Estimates
**Rubric Items**
- [ ] Technology: Client side state stores (e.g. tanstack query or context)  
- [ ] Technology: Network Calls that read and write data  
- [ ] Technology: Toasts / global notifications or alerts  

**Features**
- [ ] Agent loop MVP (`AI Chat` view stream + confirm/deny)  
- [ ] Persist decisions in `agent_actions` + show Action Log  
- [ ] `rescheduleEvent` wired with confirm  
- [ ] Spinners and disabled states  

#### Delivered
**Rubric Items:**  
**Features:**

---

### Nov 19

#### Estimates
**Rubric Items**
- [ ] Technology: 3+ generic form input components  
- [ ] Technology: 4+ generic layout components  
- [ ] Technology: Network Calls that read and write data  

**Features**
- [ ] `compareSchedulesAndPropose` (ranked meeting slots)  
- [ ] Confirmation → `createEvent`  
- [ ] Compare Schedule view shows top slots + reasons  
- [ ] Event Detail page (conflict display)  

#### Delivered
**Rubric Items:**  
**Features:**

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
**Rubric Items:**  
**Features:**

---

### **Nov 29 — Finish Target**

#### Estimates
**Rubric Items**
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
