import api from '../services/api';

export interface ExtractedEvent {
  title: string;
  start_time: string;
  end_time: string;
}

export interface FreeSlot {
  start: string;
  end: string;
}

export interface CompareScheduleResponse {
  success: boolean;
  extractedEvents: ExtractedEvent[];
  freeSlots: FreeSlot[];
  totalFreeHours: number;
}

/**
 * Upload a calendar image and compare it with the user's calendar
 */
export const compareScheduleWithImage = async (
  imageFile: File,
  date: string,
  myEvents: Array<{ title: string; start_time: string; end_time: string }>
): Promise<CompareScheduleResponse> => {
  console.log('📡 API: compareScheduleWithImage called');
  console.log('📡 API: Image file:', imageFile.name, imageFile.size, 'bytes');
  console.log('📡 API: Date:', date);
  console.log('📡 API: Events count:', myEvents.length);

  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('data', JSON.stringify({ date, myEvents }));

  console.log('📡 API: Sending POST request to /api/schedule/compare');

  try {
    const response = await api.post<CompareScheduleResponse>(
      '/api/schedule/compare',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('📡 API: Response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('📡 API: Request failed:', error);
    throw error;
  }
};
