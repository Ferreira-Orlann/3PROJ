// src/services/reactions.service.ts
import axios from "axios";

const BASE_URL = "http://localhost:3000"; 

const addReaction = async ({
  messageUuid,
  emoji,
  userUuid,
}: {
  messageUuid: string;
  emoji: string;
  userUuid: string;
}) => {
  const res = await axios.post(
    `${BASE_URL}/users/${userUuid}/channels/1/messages/${messageUuid}/reactions`, 
    {
      emoji,
    },
  );
  return res.data;
};

const getAllReactions = async () => {
  const res = await axios.get(`${BASE_URL}/reactions`);
  return res.data; // assure-toi que c'est bien un tableau de réactions
};

export default {
  addReaction,
  getAllReactions, // N'oublie pas d'exporter la fonction
};
