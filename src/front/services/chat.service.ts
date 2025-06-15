// src/services/chat.service.ts
import axios from "axios";

const getAll = async () => {
  const res = await axios.get("/api/chats"); 
  return res.data;
};

export default {
  getAll,
};
