export type RequestOtpRequest = {
  mobileNumber: string;
};

export type RequestOtpResponse = {
  message: string;
  expiresInSeconds: number;
  demoOtp: string | null;
};

export type VerifyOtpRequest = {
  mobileNumber: string;
  otp: string;
};

export type FirebaseLoginRequest = {
  idToken: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  userId: number;
  mobileNumber: string;
};

export type MeResponse = {
  id: number;
  mobileNumber: string;
  profileCompleted: boolean;
};
