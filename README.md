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

### Oct 29

#### Estimates
**Rubric Items**
- [ ] GitHub repo + README proposal + 10 views list  
- [ ] CI/CD pipeline (build + lint + fail-on-lint)  
- [ ] Kubernetes scaffold (namespace + deployment + ingress)

**Features**
- [ ] Router with 10 view stubs (TypeScript frontend)  
- [ ] Basic AppShell + one layout component  
- [ ] Toast provider + error boundary wrappers  

#### Delivered
**Rubric Items:**  
**Features:**

---

### Nov 1

#### Estimates
**Rubric Items**
- [ ] Global client state (store or React Context)  
- [ ] Auth foundation (Google OAuth skeleton)  
- [ ] Route guards (public / protected)  

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
- [ ] Postgres connected (`events_cache`, `agent_actions`, `oauth_tokens`)  
- [ ] Server error handling (API + render)

**Features**
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
- [ ] Unit test scaffold + CI test job  
- [ ] Google OAuth (Auth Code + PKCE) + encrypted token storage  
- [ ] Network calls (read events + create event)

**Features**
- [ ] Calendar → Create Event flow (confirm → save → navigate)  
- [ ] Reusable input #3 (TimeRangePicker or AttendeeSelect)

#### Delivered
**Rubric Items:**  
**Features:**

---

### Nov 12

#### Estimates
**Rubric Items**
- [ ] **Additional Task: Working with Pictures (OCR endpoint)**  
- [ ] **Image Review page (verify/edit parsed times)**  
- [ ] Autonomous action `suggestFreeTimeSlots` (highlights UI)  
- [ ] Confirmation action `createEvent` integrated  
- [ ] Zod output validation for slots and events

**Features**
- [ ] Compare Schedule page (upload photo or add participant)  
- [ ] Convert parsed events → availability windows  

#### Delivered
**Rubric Items:**  
**Features:**

---

### Nov 15

#### Estimates
**Rubric Items**
- [ ] Agent loop MVP (`AI Chat` view stream + confirm/deny)  
- [ ] Persist decisions in `agent_actions` + show Action Log  

**Features**
- [ ] `rescheduleEvent` wired with confirm  
- [ ] Animations + spinners + disabled buttons  

#### Delivered
**Rubric Items:**  
**Features:**

---

### Nov 19

#### Estimates
**Rubric Items**
- [ ] `compareSchedulesAndPropose` (ranked meeting slots)  
- [ ] Confirmation → `createEvent`  

**Features**
- [ ] Compare Schedule view shows top slots + reasons  
- [ ] Event Detail page (conflict display)  

#### Delivered
**Rubric Items:**  
**Features:**

---

### Nov 22

#### Estimates
**Rubric Items**
- [ ] Insights View Zod schema (weekly summary)  
- [ ] Mobile responsive (≥ 3 layout reorders)  
- [ ] 3 reusable inputs + 2 layout components confirmed  

**Features**
- [ ] Insights / Analytics View (simple charts or list summary)  
- [ ] Help View (usage + consent notes)  

#### Delivered
**Rubric Items:**  
**Features:**

---

### **Nov 29 — Finish Target**

#### Estimates
**Rubric Items**
- [ ] CI tests + lint must pass for deployment  
- [ ] Production Kubernetes deployment live (public URL)

**Features**
- [ ] Polish empty states + minor UI cleanup  
- [ ] Small UX improvements  

#### Delivered
**Rubric Items:**  
**Features:**

---

### Dec 3 (Buffer Week)

#### Estimates
**Rubric Items**
- [ ] CI/CD hardening (secrets + prod config)  
- [ ] Code review & cleanup  

**Features**
- [ ] Edge-case error toasts  
- [ ] Documentation polish  

#### Delivered
**Rubric Items:**  
**Features:**

---

### Dec 6 (Final Demo)

#### Estimates
**Rubric Items**
- [ ] Final rubric checklist pass  
- [ ] Demo script + screenshots/gif  

**Features**
- [ ] Performance tuning  
- [ ] Any overflow bug fixes  

#### Delivered
**Rubric Items:**  
**Features:**
