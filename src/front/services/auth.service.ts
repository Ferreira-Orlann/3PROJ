// src/services/auth.service.ts
import axios from "axios";
import { Session } from "../types/auth";

export const SESSION_LOCALSTORE_NAME = "xxxx";

class AuthService {
  private session: Session | null = null;

  public async login(email: string, password: string): Promise<Session> {
    const res = await axios.post<Session>("http://localhost:3000/auth/login", {
      email,
      password,
    });

    if (res.status !== 201) {
      throw new Error("Échec de la connexion");
    }

    this.session = res.data;
    localStorage.setItem(SESSION_LOCALSTORE_NAME, JSON.stringify(this.session));
    return this.session;
  }

  public async loginWithGoogle(googleToken: string): Promise<Session> {
    const res = await axios.post<Session>("http://localhost:3000/auth/google", {
      token: googleToken,
    });

    if (res.status !== 200 && res.status !== 201) {
      throw new Error("Échec de la connexion Google");
    }

    this.session = res.data;
    localStorage.setItem(SESSION_LOCALSTORE_NAME, JSON.stringify(this.session));
    return this.session;
  }

  public getSession(): Session | null {
    if (this.session) return this.session;

    const raw = localStorage.getItem(SESSION_LOCALSTORE_NAME);
    if (!raw) return null;

    try {
      this.session = JSON.parse(raw) as Session;
      return this.session;
    } catch {
      return null;
    }
  }

  public clearSession(): void {
    this.session = null;
    localStorage.removeItem(SESSION_LOCALSTORE_NAME);
  }
}

export default new AuthService();
