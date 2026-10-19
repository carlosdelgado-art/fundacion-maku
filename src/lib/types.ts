// Tipos de datos que reflejan las tablas de Supabase definidas en supabase/schema.sql
//
// Nota: se usan "type" (no "interface") porque TypeScript solo infiere un indice
// de firma implicito `[key: string]: unknown` para "type", lo cual es requerido
// por los tipos genericos de @supabase/supabase-js (GenericTable). Si se usan
// "interface" aqui, el cliente de Supabase termina tipando todo como "never".

export type Role = "admin" | "vendedor";

export type CardStatus = "unassigned" | "assigned" | "pending_sale" | "sold";
export type ReviewStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: Role;
  created_at: string;
};

export type Settings = {
  key: string;
  value: string | null;
};

export type BingoCard = {
  number: number;
  assigned_to: string | null;
  status: CardStatus;
  created_at: string;
};

export type CardSale = {
  id: string;
  card_number: number;
  seller_id: string;
  buyer_name: string;
  buyer_phone: string | null;
  evidence_url: string;
  status: ReviewStatus;
  group_id: string | null;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reject_reason: string | null;
};

export type Donation = {
  id: string;
  donor_name: string;
  donor_phone: string | null;
  amount: number;
  evidence_url: string;
  message: string | null;
  status: ReviewStatus;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reject_reason: string | null;
};

export type PublicStats = {
  total_raised: number;
  goal_amount: number;
  cards_sold: number;
  cards_total: number;
  donations_count: number;
};

export type PublicDonation = {
  id: string;
  donor_name: string;
  amount: number;
  message: string | null;
  created_at: string;
};

// Mapa de claves usadas en la tabla "settings" (configurables desde el panel admin)
export const SETTINGS_KEYS = {
  foundationName: "foundation_name",
  teamName: "team_name",
  logoUrl: "logo_url",
  heroTitle: "hero_title",
  heroSubtitle: "hero_subtitle",
  heroDescription: "hero_description",
  videoUrl: "video_url",
  goalAmount: "goal_amount",
  brebKey: "breb_key",
  bankInfo: "bank_info",
  cardPrice: "card_price",
  bingoDate: "bingo_date",
  bingoModalidad: "bingo_modalidad",
  bingoReglas: "bingo_reglas",
  bingoPremios: "bingo_premios",
  legadoImageUrl: "legado_image_url",
  webSalesVendorId: "web_sales_vendor_id",
} as const;

// Tipado del esquema para que el cliente de Supabase infiera correctamente los
// tipos de cada tabla/funcion (en vez de "never"). Si luego cambias el esquema SQL,
// puedes regenerar esto con `npx supabase gen types typescript`.
type TableDef<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<
        Profile,
        { id: string; full_name: string; phone?: string | null; role?: Role }
      >;
      settings: TableDef<Settings, { key: string; value?: string | null }>;
      bingo_cards: TableDef<
        BingoCard,
        {
          number: number;
          assigned_to?: string | null;
          status?: CardStatus;
        }
      >;
      card_sales: TableDef<
        CardSale,
        {
          card_number: number;
          seller_id: string;
          buyer_name: string;
          buyer_phone?: string | null;
          evidence_url: string;
          status?: ReviewStatus;
          group_id?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          reject_reason?: string | null;
        }
      >;
      donations: TableDef<
        Donation,
        {
          donor_name: string;
          donor_phone?: string | null;
          amount: number;
          evidence_url: string;
          message?: string | null;
          status?: ReviewStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          reject_reason?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      get_public_stats: {
        Args: Record<string, never>;
        Returns: PublicStats[];
      };
      get_public_donations: {
        Args: { donations_limit?: number };
        Returns: PublicDonation[];
      };
      get_available_card_numbers: {
        Args: Record<string, never>;
        Returns: number[];
      };
      request_card_purchase: {
        Args: {
          p_card_numbers: number[];
          p_buyer_name: string;
          p_buyer_phone: string | null;
          p_evidence_url: string;
        };
        Returns: string;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
