export type TipoAlojamiento = "Habitación" | "Apartaestudio";

export interface Listing {
  id: string;
  tipo: TipoAlojamiento;
  title: string;
  description: string;
  price: number;
  neighborhood: string;
  features: string[];
  image_urls: string[];
  contact_phone: string;
  is_published: boolean;
  created_at: string;
}
