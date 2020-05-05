import { AxiosResponse, AxiosError, Canceler } from "axios";

export interface Locale {
  locale: string;
  setLocale: (locale: string) => void;
}

export type Method = "get" | "put" | "post" | "patch" | "delete";
export type Headers = { [key: string]: string } | undefined;
export type Data = object | undefined;

export interface UseApiOption {
  method?: Method;
  headers?: Headers;
  data?: Data;
  hotReload?: boolean;
  validateStatus?: (status: number) => boolean;
}

export interface UseApiReturn<T, E> {
  callApi: (freshData?: Data) => Promise<void>;
  loading: boolean;
  res: AxiosResponse<T>;
  resData: T;
  error: AxiosError<E>;
  setUrl: (url: string) => void;
  setMethod: (method: Method) => void;
  setHeaders: (headers: Headers) => void;
  setData: (data: Data) => void;
  cancelAllRequests: Canceler;
}

export interface ApiAuthResponse {
  validToken: boolean;
  error?: string;
}

export interface AuthInfo {
  username: string;
  password: string;
  [key: string]: string;
}

export interface Comment {
  movieName: string;
  date: number;
  name: string;
  body: string;
  stars: number;
  _id: number;
}

export interface Review {
  id: string;
  name: string;
  date: number;
  stars: number;
  body: string;
}

export interface Filters {
  query: string;
  collections: string[];
  year: number;
  minRating: number;
}

export interface Movie {
  id: string;
  title: string;
  cover: string;
  year: number;
  summary: string;
  genres: string[];
  rating: number;
  runtime: number;
}

export interface ApiSearchReponse {
  movies: Movie[];
  nextPage: boolean;
}

export type CustomSnackbarVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default";
