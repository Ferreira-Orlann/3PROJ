import axios from "axios";
import authService from "./auth.service";
import { Workspace } from "../types/workspace";
import { UUID } from "crypto";
import { PartialRequired } from "../types/utils";

class WorkspacesService {
    public async create(
        name: string,
        description: string,
        is_public: boolean,
    ): Promise<Workspace> {
        console.log("Payload envoyé à l'API:", {
  name,
  description,
  is_public,
});

        const response = await axios.post<Workspace>(
            
            "http://localhost:3000/workspaces",
            JSON.stringify({
                name,
                description,
                is_public,
            }),
            
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authService.getSession().token}`,
                },
            },
        );
        return new Promise((resolve, reject) => {
            if (response.status != 201) {
                reject(response.data);
            }
            resolve(response.data);
        });
    }

    public async update(workspace: Partial<Workspace>) {
        const response = await axios.put<Workspace>(
            "http://localhost:3000/workspaces",
            JSON.stringify(workspace),
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authService.getSession().token}`,
                },
            },
        );
        return new Promise((resolve, reject) => {
            if (response.status != 204) {
                reject(response.data);
            }
            resolve(response.data);
        });
    }

    public async getByUUID(uuid: UUID): Promise<Workspace> {
        const response = await axios.get<Workspace>(
            `http://localhost:3000/workspaces/${uuid}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authService.getSession().token}`,
                },
            },
        );
        return new Promise((resolve, reject) => {
            if (response.status != 200) {
                reject(response.data);
            }
            resolve(response.data);
        });
    }

    public async delete(workspace: PartialRequired<Workspace, "uuid">) {
        const response = await axios.delete<Workspace>(
            `http://localhost:3000/workspaces/${workspace.uuid}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authService.getSession().token}`,
                },
            },
        );
        return new Promise((resolve, reject) => {
            if (response.status != 200) {
                reject(response.data);
            }
            resolve(response.data);
        });
    } 
    public async getAll(): Promise<Workspace[]> {
        const session = authService.getSession();
        console.log("Session actuelle:", session); // ← ajoute ça
      
        const response = await axios.get<Workspace[]>(
          "http://localhost:3000/workspaces",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.token}`,
            },
          }
        );
      
        if (response.status !== 200) {
          throw new Error("Impossible de récupérer les workspaces");
        }
        return response.data;
      }
      
      
    
}

export default new WorkspacesService();
