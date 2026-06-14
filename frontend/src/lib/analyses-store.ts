// Supabase 연동 레이어 (분석 이력 저장 및 불러오기)
import { createClient } from '@supabase/supabase-js';
import type { UWInputs } from './underwriting';

// 환경 변수에서 Supabase 설정 로드 (사용자가 나중에 설정할 수 있도록 안내 필요)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SavedAnalysis {
  id: string;
  created_at: string;
  project_name: string;
  asset_name: string;
  irr: number;
  equity_multiple: number;
  dscr: number;
  noi: number;
  inputs: UWInputs;
}

export const analysesTable = {
  // 전체 목록 불러오기
  async list(): Promise<SavedAnalysis[]> {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('불러오기 실패:', error);
      return [];
    }
    return data as SavedAnalysis[];
  },

  // 새 분석 결과 저장하기
  async insert(
    row: Omit<SavedAnalysis, 'id' | 'created_at'>
  ): Promise<SavedAnalysis> {
    const { data, error } = await supabase
      .from('analyses')
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error('저장 실패:', error);
      throw error;
    }
    return data as SavedAnalysis;
  },

  // 특정 ID 삭제하기 (선택 사항)
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('analyses').delete().eq('id', id);
    if (error) {
      console.error('삭제 실패:', error);
      throw error;
    }
  }
};
