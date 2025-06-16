import axios from "axios";
import { Session } from "../types/auth";

export const SESSION_LOCALSTORE_NAME = "xxxx"

class AuthService {
    private session: Session;

    public async login(email: string, password: string): Promise<boolean> {
        const res = await axios.post<Session>(
            "http://localhost:3000/auth/login",
            { email, password },
        );
        console.log("Response:", res);
        if (res.status !== 201) {
            return false;
        }
        this.session = res.data;
        return true;
    }

public async loginWithGoogle(googleToken: string): Promise<boolean> {
    try {
        const res = await axios.post<Session>(
            "http://localhost:3000/auth/google",
            { token: googleToken }, // <-- ici dans le body, pas dans les headers
        );

        if (res.status !== 201 && res.status !== 200) {
            return false;
        }

        this.session = res.data;
        localStorage.setItem(SESSION_LOCALSTORE_NAME, JSON.stringify(this.session));
        return true;
    } catch (err) {
        console.error("Erreur login Google", err);
        return false;
    }
}

    public getSession(): Session | null {
        if (!this.session) {
            const sessionString = localStorage.getItem(SESSION_LOCALSTORE_NAME);
            if (sessionString) {
                this.session = JSON.parse(sessionString);
            } else {
                return null;
            }
        }
        return this.session;
    }
    
}

export default new AuthService();
