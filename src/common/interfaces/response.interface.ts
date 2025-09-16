export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  code: number;
  data: T | T[];
}
