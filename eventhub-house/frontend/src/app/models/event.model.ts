export interface EventItem {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  location: string;
  date: string;
  price: number;
  capacity: number;
  booked_count: number;
  available_places: number;
  average_rating: number | null;
  image_filename: string | null;
  image_url: string | null;
  organizer_id: number;
}

export interface Ticket {
  id: number;
  qr_code: string;
  created_at: string;
  event: {
    id: number;
    title: string;
    date: string;
    city: string;
    location: string;
    price: number;
  };
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  is_reported: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}
