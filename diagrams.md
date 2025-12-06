# Schedule Compare Workflow

## Overview
The Schedule Compare feature allows users to analyze and compare their calendar events with schedules from uploaded images to find common free time slots.

## Complete Workflow Diagram

```mermaid
flowchart TD
    Start([User Opens Schedule Compare Page]) --> SelectMode{Select Mode}
    
    SelectMode -->|Manual Entry| ManualMode[Manual Event Entry Mode]
    SelectMode -->|AI Analysis| AIMode[AI Image Analysis Mode]
    
    %% Manual Mode Path
    ManualMode --> ManualEntry[Enter Events Manually]
    ManualEntry --> CheckManualOverlap[Check for Overlaps]
    
    %% AI Mode Path - Main Flow
    AIMode --> SelectDate[Select Date for Analysis]
    SelectDate --> ViewMyEvents[View My Events for Selected Date]
    ViewMyEvents --> UploadImage[Upload Schedule Image]
    
    UploadImage --> ImagePreview{Image Uploaded?}
    ImagePreview -->|No| UploadImage
    ImagePreview -->|Yes| ShowPreview[Display Image Preview]
    
    ShowPreview --> ClickAnalyze[User Clicks 'Analyze Schedule']
    ClickAnalyze --> PrepareData[Prepare Request Data]
    
    %% API Call Process
    PrepareData --> BuildFormData[Build FormData with:<br/>- Image File<br/>- Selected Date<br/>- My Events<br/>- Work Hours]
    BuildFormData --> SendAPI[POST /api/schedule/compare]
    
    %% Server-Side Processing
    SendAPI --> ServerReceive[Server Receives Request]
    ServerReceive --> ValidateRequest{Validate<br/>Image & Data?}
    ValidateRequest -->|Valid| ReadImage[Read Uploaded Image]
    
    ReadImage --> ConvertBase64[Convert Image to Base64]
    ConvertBase64 --> CallAI[Call AI Vision API<br/>gemma3-27b model]
    
    %% AI Processing
    CallAI --> AIExtract[AI Extracts Events:<br/>- Title<br/>- Start Time<br/>- End Time<br/>- Date]
    AIExtract --> ParseJSON[Parse AI JSON Response]
    ParseJSON --> FormatEvents[Format Extracted Events<br/>to ISO DateTime]
    
    %% Free Slots Calculation
    FormatEvents --> MergeEvents[Merge My Events +<br/>Extracted Events]
    MergeEvents --> SortEvents[Sort All Events by Start Time]
    SortEvents --> SetWorkHours[Define Work Day Boundaries<br/>workStart to workEnd]
    
    SetWorkHours --> CalcFreeSlots[Calculate Free Time Slots]
    CalcFreeSlots --> IterateEvents{For Each Event}
    IterateEvents --> CheckGap{Gap Before<br/>Event?}
    CheckGap -->|Yes| AddFreeSlot[Add Free Slot]
    CheckGap -->|No| UpdateTime[Update Current Time]
    AddFreeSlot --> UpdateTime
    UpdateTime --> MoreEvents{More Events?}
    MoreEvents -->|Yes| IterateEvents
    MoreEvents -->|No| CheckFinalGap{Time After<br/>Last Event?}
    
    CheckFinalGap -->|Yes| AddFinalSlot[Add Final Free Slot]
    CheckFinalGap -->|No| CalcTotal[Calculate Total Free Hours]
    AddFinalSlot --> CalcTotal
    
    CalcTotal --> CleanupFile[Delete Uploaded Image File]
    CleanupFile --> SendResponse[Send Response:<br/>- Extracted Events<br/>- Free Slots<br/>- Total Free Hours]
    
    %% Client-Side Display
    SendResponse --> ClientReceive[Client Receives Response]
    ClientReceive --> DisplayExtracted[Display Extracted Events Editor]
    
    DisplayExtracted --> UserReview{User Reviews<br/>Events}
    UserReview -->|Edit Event| EditEvent[Modify Event:<br/>- Title<br/>- Start/End Time]
    EditEvent --> UserReview
    UserReview -->|Remove Event| RemoveEvent[Delete Event from List]
    RemoveEvent --> UserReview
    UserReview -->|Add Event| AddEvent[Add New Event Manually]
    AddEvent --> UserReview
    
    UserReview -->|Confirm| ValidateEdited{All Events<br/>Valid?}
    
    ValidateEdited -->|Valid| FilterEvents[Filter Events:<br/>- Exclude All-Day if Selected<br/>- Match Selected Date]
    FilterEvents --> RecalcFreeSlots[Recalculate Free Slots<br/>with Edited Events]
    
    RecalcFreeSlots --> DisplayResults[Display Results:<br/>- Common Free Time Slots<br/>- Duration for Each Slot<br/>- Visual Timeline]
    
    DisplayResults --> RecordAction[Record Action in Context:<br/>'schedules_compared']
    RecordAction --> ShowSuccess[Show Success Message]
    
    ShowSuccess --> UserDecision{User Decision}
    UserDecision -->|Clear & Restart| ClearAll[Reset All State:<br/>- Clear Image<br/>- Clear Events<br/>- Clear Results]
    ClearAll --> AIMode
    UserDecision -->|Change Date| SelectDate
    UserDecision -->|Done| End([End])
    
    style Start fill:#e1f5e1
    style End fill:#ffe1e1
    style CallAI fill:#e1f0ff
    style AIExtract fill:#e1f0ff
    style DisplayResults fill:#fff4e1
    style SendResponse fill:#f0e1ff
```

## Key Components

### Frontend Components
- **ScheduleCompare.tsx**: Main page component orchestrating the workflow
- **useAiScheduleCompare.ts**: Custom hook managing state and API calls
- **scheduleCompare.ts (API)**: Client-side API interface

### Backend Components
- **scheduleCompare.ts (Endpoint)**: Express router handling requests
- **scheduleExtraction.ts (Service)**: AI vision integration for event extraction

### Data Flow
1. **User Input**: Date selection, event filters, image upload
2. **AI Analysis**: Vision model extracts structured event data
3. **Event Processing**: Merge, sort, and validate events
4. **Free Slot Calculation**: Identify gaps between events within work hours
5. **User Review**: Edit/confirm extracted events
6. **Results Display**: Show common free time with visual timeline

## Features
- **Dual Mode**: Manual entry or AI-powered image analysis
- **Event Editing**: Full CRUD operations on extracted events
- **Smart Filtering**: Option to exclude all-day events
- **Work Hours**: Configurable work day boundaries
- **Action Logging**: Integration with agentic action context for tracking

---

## Network Architecture & Communication Flow

```mermaid
sequenceDiagram
    participant User as 👤 User Browser
    participant UI as React UI<br/>(ScheduleCompare.tsx)
    participant Hook as Custom Hook<br/>(useAiScheduleCompare.ts)
    participant API as API Client<br/>(scheduleCompare.ts)
    participant Axios as Axios HTTP Client
    participant Server as Express Server<br/>(Port 3000)
    participant Router as Schedule Router<br/>(/api/schedule/compare)
    participant Multer as Multer Middleware<br/>(File Upload)
    participant Service as AI Service<br/>(scheduleExtraction.ts)
    participant AI as External AI API<br/>(gemma3-27b)
    participant FS as File System<br/>(uploads/)

    User->>UI: 1. Upload Image & Click Analyze
    UI->>Hook: 2. handleAnalyzeSchedule()
    
    Note over Hook: Validate image exists<br/>Prepare event data
    
    Hook->>API: 3. compareScheduleWithImage(file, date, events, workHours)
    
    Note over API: Build FormData:<br/>- image: File<br/>- data: JSON string
    
    API->>Axios: 4. POST /api/schedule/compare<br/>Content-Type: multipart/form-data
    
    rect rgb(200, 220, 250)
        Note over Axios,Server: HTTP Request Over Network
        Axios-->>Server: FormData with image + metadata
    end
    
    Server->>Router: 5. Route to /schedule/compare
    Router->>Multer: 6. Process multipart upload
    
    Multer->>FS: 7. Save image to uploads/
    FS-->>Multer: File path
    Multer-->>Router: 8. req.file populated
    
    Router->>Router: 9. Validate request<br/>(image, date, myEvents)
    
    Router->>FS: 10. Read uploaded image
    FS-->>Router: Image buffer
    
    Router->>Router: 11. Convert to base64<br/>Create data URL
    
    Router->>Service: 12. extractEventsFromScheduleImage(imageDataUrl)
    
    rect rgb(255, 240, 200)
        Note over Service,AI: External AI API Call
        Service->>AI: 13. POST /api/chat/completions<br/>{<br/>  model: "gemma3-27b",<br/>  messages: [vision prompt + image]<br/>}
        AI->>AI: 14. Process image with vision model
        AI-->>Service: 15. JSON response with events
    end
    
    Service->>Service: 16. Parse & clean JSON response
    Service-->>Router: 17. Array of extracted events
    
    Router->>Router: 18. Format events to ISO DateTime
    Router->>Router: 19. Merge myEvents + extractedEvents
    Router->>Router: 20. Sort events by start time
    Router->>Router: 21. Calculate free slots algorithm
    Router->>Router: 22. Calculate total free hours
    
    Router->>FS: 23. Delete uploaded image file
    FS-->>Router: Cleanup complete
    
    rect rgb(240, 200, 250)
        Note over Router,Axios: HTTP Response Over Network
        Router-->>Axios: 24. JSON Response:<br/>{<br/>  success: true,<br/>  extractedEvents: [...],<br/>  freeSlots: [...],<br/>  totalFreeHours: X<br/>}
    end
    
    Axios-->>API: 25. Response data
    API-->>Hook: 26. CompareScheduleResponse
    
    Hook->>Hook: 27. Update state:<br/>- extractedEvents<br/>- editableExtractedEvents<br/>- commonFreeSlots
    
    Hook->>Hook: 28. Record action to context
    Hook-->>UI: 29. State updated (triggers re-render)
    UI-->>User: 30. Display extracted events & free slots
```

## Network Layer Details

### Client Side (Frontend)

#### API Client Configuration
- **Base URL**: Configured via Axios instance in `client.ts`
- **Headers**: Automatically set `Content-Type: multipart/form-data`
- **Error Handling**: Try-catch with console logging and error propagation

#### Request Payload Structure
```typescript
FormData {
  image: File,                    // Binary image file
  data: JSON.stringify({          // Stringified JSON
    date: "2025-12-05",
    myEvents: [
      {
        title: "Meeting",
        start_time: "2025-12-05T09:00:00",
        end_time: "2025-12-05T10:00:00"
      }
    ],
    workStartHour: 9,
    workEndHour: 17
  })
}
```

### Server Side (Backend)

#### Endpoint Configuration
- **Route**: `POST /api/schedule/compare`
- **Middleware**: 
  - `uploadScheduleImage.single('image')` - Multer file upload
  - File saved to `uploads/` directory with unique filename
- **File Handling**: Automatic cleanup after processing

#### Response Structure
```typescript
{
  success: boolean,
  extractedEvents: [
    {
      title: string,
      start_time: string,        // ISO 8601 format
      end_time: string          // ISO 8601 format
    }
  ],
  freeSlots: [
    {
      start: string,            // ISO 8601 format
      end: string              // ISO 8601 format
    }
  ],
  totalFreeHours: number
}
```

### External AI Integration

#### AI API Configuration
- **Base URL**: `process.env.AI_BASE_URL` (default: `https://ai-snow.reindeer-pinecone.ts.net`)
- **Authentication**: `Bearer ${process.env.OPENWEBUI_API_KEY}`
- **Model**: `gemma3-27b` (vision-capable model)
- **Temperature**: `0.1` (low for consistent extraction)

#### AI Request Format
```typescript
{
  model: "gemma3-27b",
  messages: [
    {
      role: "user",
      content: [
        { 
          type: "text", 
          text: "Extract events from calendar image..." 
        },
        { 
          type: "image_url", 
          image_url: { 
            url: "data:image/png;base64,..." 
          }
        }
      ]
    }
  ],
  temperature: 0.1
}
```

#### AI Response Format
```json
[
  {
    "title": "Team Meeting",
    "startTime": "09:00",
    "endTime": "10:00",
    "date": "2025-12-05"
  }
]
```

## Error Handling & Network Resilience

### Client Side
- **Upload Validation**: Check file exists before API call
- **Toast Notifications**: User-friendly error messages
- **Loading States**: `isAnalyzing` flag during network operations
- **Error Propagation**: Catch and log errors with context

### Server Side
- **Request Validation**: Check for required fields (image, date, myEvents)
- **File Cleanup**: Always delete uploaded files (success or failure)
- **AI Fallback**: Return empty array `[]` if AI call fails
- **Error Responses**: Structured error objects with details

### Network Considerations
- **File Size**: Large images increase upload time
- **Timeouts**: AI vision processing can take several seconds
- **CORS**: Must be configured for cross-origin requests
- **Content-Type**: Proper multipart/form-data boundary handling
