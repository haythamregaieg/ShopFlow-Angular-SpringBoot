export type CouponType = 'PERCENT' | 'FIXED';

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  valeur: number;
  dateExpiration?: string | null;
  usagesMax?: number | null;
  usagesActuels?: number | null;
  actif: boolean;
}

export interface CouponRequest {
  code: string;
  type: CouponType;
  valeur: number;
  dateExpiration?: string | null;
  usagesMax?: number | null;
  actif: boolean;
}
