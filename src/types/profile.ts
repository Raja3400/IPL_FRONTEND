export type ProfileResponse = {
  id: number;
  mobileNumber: string;
  name: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  profileCompleted: boolean;
};

export type UpsertProfileRequest = {
  name: string;
  city: string;
  state: string;
  country: string;
};
