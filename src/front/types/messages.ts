export interface Message {
    uuid: string;
    message: string;
    source_uuid: string;
    destination_uuid: string;
    is_public: boolean;
    date: string;
    file_url?: string;
    reply_to_uuid?: string;
    edited?: boolean;
  }
  