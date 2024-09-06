export interface ServerD {
  id: number;
  description: string;
  name: string;
  category: string;
  icon: string;
  category: string;
  channel_server: {
    id: number;
    name: string;
    server: number;
    topic: string;
    owner: number;
  }[];
}
