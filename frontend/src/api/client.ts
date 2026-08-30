import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';

// --- MOCK DATA FOR VISUAL PREVIEW ---
const mockUser = { id: '1', email: 'preview@dresync.com', username: 'preview_user', full_name: 'Alex Styles', created_at: new Date().toISOString() };

const mockItems = [
  { id: '1', name: 'Navy Oxford Shirt', category: 'top', primary_color: 'Navy', secondary_colors: [], pattern: 'solid', styles: ['smart_casual'], seasons: ['all'], occasions: ['work', 'date'], usage_status: 'active', wear_count: 12 },
  { id: '2', name: 'Classic Blue Jeans', category: 'bottom', primary_color: 'Blue', secondary_colors: [], pattern: 'solid', styles: ['casual'], seasons: ['all'], occasions: ['casual', 'weekend'], usage_status: 'active', wear_count: 24 },
  { id: '3', name: 'White Leather Sneakers', category: 'shoes', primary_color: 'White', secondary_colors: [], pattern: 'solid', styles: ['casual', 'sporty'], seasons: ['all'], occasions: ['casual'], usage_status: 'active', wear_count: 45 },
  { id: '4', name: 'Beige Trench Coat', category: 'outerwear', primary_color: 'Beige', secondary_colors: [], pattern: 'solid', styles: ['smart_casual', 'formal'], seasons: ['fall', 'spring'], occasions: ['work', 'evening'], usage_status: 'active', wear_count: 8 },
];

const mockOutfits = [
  {
    id: 'o1', name: 'Casual Friday', compatibility_score: 0.92,
    top: mockItems[0], bottom: mockItems[1], shoes: mockItems[2], outerwear: mockItems[3],
    recommendation_reasons: [{ type: 'color', description: 'Navy and beige are a classic complementary pair' }, { type: 'style', description: 'Smart casual pieces match perfectly' }],
    occasion: 'work', season: 'all', is_favorite: true, created_at: new Date().toISOString()
  },
  {
    id: 'o2', name: 'Weekend Walk', compatibility_score: 0.78,
    top: mockItems[0], bottom: mockItems[1], shoes: mockItems[2],
    recommendation_reasons: [{ type: 'color', description: 'Blue tones blend well together' }],
    occasion: 'casual', season: 'all', is_favorite: false, created_at: new Date().toISOString()
  }
];

// Custom Axios adapter to return fake data instantly without needing a backend
const mockAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  const { url, method } = config;
  
  // Simulate a tiny network delay for realism
  await new Promise(r => setTimeout(r, 300));

  let data: any = {};
  let status = 200;

  if (url?.includes('/auth/login') || url?.includes('/auth/register')) {
    data = { access_token: 'mock-token', token_type: 'bearer', user: mockUser };
  } 
  else if (url?.includes('/auth/me')) data = mockUser;
  else if (url?.includes('/wardrobe/stats')) {
    data = { total_items: 24, by_category: { top: 10, bottom: 8, outerwear: 2, shoes: 4 }, total_outfits: 12, total_worn: 145 };
  }
  else if (url?.match(/\/wardrobe\/items\/\d+/)) {
    const id = url.split('/').pop();
    data = mockItems.find(i => i.id === id) || mockItems[0];
  }
  else if (url?.includes('/wardrobe/items')) data = mockItems;
  else if (url?.includes('/outfits/generate')) data = [mockOutfits[0]];
  else if (url?.includes('/outfits/history/all')) {
    data = [{ id: 'h1', outfit: mockOutfits[0], worn_date: new Date().toISOString() }];
  }
  else if (url?.includes('/outfits/')) data = mockOutfits;
  else if (url?.includes('/planner/week')) {
    data = { id: 'p1', week_start: new Date().toISOString(), monday: mockOutfits[0], wednesday: mockOutfits[1], friday: mockOutfits[0] };
  }

  return { data, status, statusText: 'OK', headers: {}, config, request: {} } as AxiosResponse;
};

const api = axios.create({
  baseURL: '/api/v1',
  adapter: mockAdapter, // Intercepts all requests and returns the mock data above!
});

export default api;
