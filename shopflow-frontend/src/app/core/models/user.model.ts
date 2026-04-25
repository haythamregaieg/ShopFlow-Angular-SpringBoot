export interface User {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: string;
  actif: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  nomBoutique?: string;
  logoBoutique?: string;
  descriptionBoutique?: string;
}