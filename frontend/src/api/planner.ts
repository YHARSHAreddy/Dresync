import api from './client';
import { WeeklyPlan } from '../types';

export const plannerApi = {
  getCurrentWeek: async (): Promise<WeeklyPlan | null> => {
    const res = await api.get('/planner/week');
    return res.data;
  },
  generate: async (req: { occasion?: string; season?: string }): Promise<WeeklyPlan> => {
    const res = await api.post('/planner/generate', req);
    return res.data;
  },
  regenerateDay: async (day: string, req: { occasion?: string; season?: string }): Promise<WeeklyPlan> => {
    const res = await api.post(`/planner/regenerate/${day}`, req);
    return res.data;
  },
};
