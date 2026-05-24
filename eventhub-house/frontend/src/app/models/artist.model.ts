export interface ArtistEvent {
  id: number;
  title: string;
  category: string;
  city: string;
  location: string;
  date: string;
  price: number;
  image_url: string | null;
}

export interface Artist {
  id: number;
  name: string;
  bio: string;
  image_filename: string | null;
  image_url: string | null;
  events?: ArtistEvent[];
}
