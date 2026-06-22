export type ServiceAvailabilityDay = {
  day: string;
  date: string;
  slots: string[];
};

export type ServiceAvailabilityScheduleItem = {
  day: string;
  is_available: boolean;
  start_time: string;
  end_time: string;
  slot_length: string;
};

export type ServiceApiResponse = {
  id: string;
  enterprise_id: string;
  service_name: string;
  service_description: string | null;
  service_category: string | null;
  service_type?: string | null;
  banner_image?: string | null;
  service_price: number;
  duration: number;
  availability_status: boolean;
  service_status: boolean;
  max_participants?: number | null;
  provider_name?: string | null;
  instructor_name?: string | null;
  delivery_format?: string | null;
  package_price?: number | null;
  currency?: string | null;
  cancellation_policy?: string | null;
  availability_schedule?: ServiceAvailabilityScheduleItem[] | null;
  created_at?: string | null;
  enterprise_name?: string | null;
  type?: string | null;
  trainer_name?: string | null;
  format?: string | null;
  availability?: ServiceAvailabilityDay[] | null;
};

export type ServiceListItem = {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  provider: string;
  unit: string;
  isAvailable: boolean;
  isActive: boolean;
};

export type ServiceDetailSlot = {
  id: string;
  dayShort: string;
  date: number;
  slots: number;
};

export type ServiceDetailItem = ServiceListItem & {
  enterpriseName: string;
  sessionType: string;
  format: string;
  bannerImage: string;
  availabilitySlots: ServiceDetailSlot[];
};
