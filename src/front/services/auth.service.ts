import axios from "axios";
import { Session } from "../types/auth";

class AuthService {
    private session: Session;

    public async login(email: string, password: string): Promise<boolean> {
        const res = await axios.post<Session>(
            "http://localhost:3000/auth/login",
            { email, password },
        );
        if (res.status != 201) {
            return false;
        }
        this.session = res.data;
        return true;
    }

    public getSession(): Session {
        return this.session;
    }
}

export default new AuthService();
