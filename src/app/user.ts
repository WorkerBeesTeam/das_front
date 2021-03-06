export interface PaginatorApi<T> {
  results: T[];     // Массив данных
  count: number;    // Общее кол-во элементов в базе
  next: string;
  previous: string;
}

export class Named_Object {
  id: number;
  name: string;
}

export class Scheme_Group extends Named_Object {}
export class Scheme_Group_Member extends Named_Object {}

export class User {
    id: number;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    token: string;        // Ключ сессии
    permissions: string[];// Разрешения доступные пользователю
    phone_number: string;
}

export enum Connection_State {
  CS_SERVER_DOWN,
  CS_DISCONNECTED,
  CS_DISCONNECTED_JUST_NOW,
  CS_CONNECTED_JUST_NOW,
  CS_CONNECTED_SYNC_TIMEOUT,
  CS_CONNECTED,

  CS_CONNECTED_WITH_LOSSES = 0x40,
  CS_CONNECTED_MODIFIED = 0x80
}

export class Scheme {
  id: number;
  name: string;       // Имя прокта латиницей и без спец. символов, используется как имя базы данных
  device: string;     // UUID проекта
  last_usage: string;
  title: string;      // Отображаемое имя проекта
  city: number | null;
  company: number | null;
  description: string;
  version: string;
  messages: any[];
  parent: number;
  connection: number;
  mod_state: boolean;
  loses_state: boolean;
  status_checked: boolean;
  connect_state: Connection_State;
}

