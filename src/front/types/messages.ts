export interface Message {
    [x: string]: any;
    uuid: string;
    message: string;
    source_uuid: string;
    destination_uuid: string;
    date: string;
    is_public: boolean;
    file_url?: string;
    reply_to_uuid?: string;
    edited?: boolean;
  }
  