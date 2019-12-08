export interface Locale {
  locale: string;
  setLocale: (locale: string) => void;
}

export interface Fixture {
  data: {};
  loading: boolean;
  error: {};
}

export interface Review {
  id: string;
  name: string;
  date: string;
  stars: number;
  body: string;
}
