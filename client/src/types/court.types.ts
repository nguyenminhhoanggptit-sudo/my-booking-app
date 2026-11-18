export type CourtType = '5' | '7' | '11';
export type CourtStatus = 'AVAILABLE' | 'MAINTENANCE';

export interface Court {
  _id: string;
  name: string;
  type: CourtType;
  pricePerHour: number;
  status: CourtStatus;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourtFormData {
  name: string;
  type: CourtType;
  pricePerHour: number | string;
  status: CourtStatus;
  description: string;
  imageUrl: string;
}