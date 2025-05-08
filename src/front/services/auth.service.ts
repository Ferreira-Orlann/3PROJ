import axios from "axios";
import { Session } from "../types/auth";
import { SESSION_LOCALSTORE_NAME } from "../consts";

class AuthService {
    private session: Session;

    constructor() {
        this.session = null
    }

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

    public setSession(session: Session) {
        localStorage.setItem(SESSION_LOCALSTORE_NAME, JSON.stringify(session))
    }

    public getSession(): Session {
        if (this.session != undefined) {
            return this.session
        } else {
            this.session = JSON.parse(localStorage.getItem(SESSION_LOCALSTORE_NAME))
            return this.session
        }
    }

    public getSession(): Session {
        if (!this.session) {
            const sessionString = localStorage.getItem(SESSION_LOCALSTORE_NAME);
            if (sessionString) {
                this.session = JSON.parse(sessionString);
            }
        }
        return this.session;
    }
}

export default new AuthService();
