// src/types/auth.ts
import { UUID } from "crypto";
export type User = {
  uuid: UUID;
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
