// src/types/auth.ts
export type User = {
  uuid: string;
  username: string;
  email: string;
};

export type Session = {
  uuid: string;
  revoked: boolean;
  created_time: Date;
  second_duraction: number;
  token: string; 
  owner: User;
};
