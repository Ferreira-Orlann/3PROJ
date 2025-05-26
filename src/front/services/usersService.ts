// src/front/services/user.service.ts
import axios from "axios";

const API_URL = "http://localhost:3000/users";

const getAll = async (token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${API_URL}/all`, { headers });
  return res.data;
};

const getByUuid = async (uuid: string, token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${API_URL}/${uuid}`, { headers });
  return res.data;
};

export default {
  getAll,
  getByUuid,
};
