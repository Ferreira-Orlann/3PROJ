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
        if (res.status != 201) {
            return false;
        }
        this.session = res.data;
        return true;
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
