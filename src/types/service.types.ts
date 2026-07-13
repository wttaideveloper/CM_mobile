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
  tenant_id?: string | null;
  enterprise_id?: string;
  enterpriseId?: string;
  location_id?: string | null;
  service_name?: string;
  name?: string;
  description?: string | null;
  category?: string | null;
  duration_minutes?: number | null;
  duration?: number | string | null;
  price?: number | null;
  currency?: string | null;
  service_description?: string | null;
  service_category?: string | null;
  service_type?: string | null;
  type?: string | null;
  sessionType?: string | null;
  banner_image?: string | null;
  bannerImage?: string | null;
  image?: string | null;
  service_price?: number | null;
  availability_status?: boolean | null;
  isAvailable?: boolean | null;
  service_status?: boolean | null;
  isActive?: boolean | null;
  status?: string | null;
  max_participants?: number | null;
  maxParticipants?: number | null;
  provider_name?: string | null;
  provider?: string | null;
  instructor_name?: string | null;
  unit?: string | null;
  delivery_format?: string | null;
  format?: string | null;
  package_price?: number | null;
  cancellation_policy?: string | null;
  cancellationPolicy?: string | null;
  availability_schedule?: ServiceAvailabilityScheduleItem[] | null;
  created_at?: string | null;
  enterprise_name?: string | null;
  enterpriseName?: string | null;
  trainer_name?: string | null;
  availability?: ServiceAvailabilityDay[] | null;
  availabilitySlots?: Omit<ServiceDetailSlot, 'isPast'>[] | null;
};

export type ServicePagination = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type ServicesPaginatedApiResponse = {
  items: ServiceApiResponse[];
  pagination: ServicePagination;
};

export type ServiceListQuery = {
  search?: string;
  tenant_id?: string;
  enterprise_id?: string;
  category?: string;
  location_id?: string;
  status?: string;
  page?: number;
  page_size?: number;
};

export type ServicesPaginatedResult = {
  items: ServiceListItem[];
  pagination: ServicePagination;
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
  provider: string | null;
  unit: string;
  image: string;
  maxParticipants: number | null;
  isAvailable: boolean;
  isActive: boolean;
};

export type ServiceDetailSlot = {
  id: string;
  dayShort: string;
  dayLabel: string;
  date: number;
  slots: number;
  slotTimes: string[];
  isPast: boolean;
};

export type ServiceDetailItem = ServiceListItem & {
  enterpriseName: string;
  sessionType: string;
  format: string;
  bannerImage: string;
  availabilitySlots: ServiceDetailSlot[];
  cancellationPolicy: string;
  maxParticipants: number | null;
  currency: string;
};
