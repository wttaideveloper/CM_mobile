import { EmptyState } from '@/components/EmptyState';
import { SearchSectionHeading } from '@/components/search/SearchSectionHeading';
import { SearchResultsSkeleton } from '@/components/ui/Skeleton.screens';
import type { Course } from '@/constants/courses';
import type { Event } from '@/constants/events';
import { CourseCard } from '@/screens/events/courses/CoursesScreen';
import { EventCard } from '@/screens/events/EventsScreen';
import { EnterpriseRow } from '@/screens/enterprise/EnterprisesScreen';
import { ProductGridCard } from '@/screens/shop/products/ProductsScreen';
import { ServiceCard } from '@/screens/shop/services/ServicesScreen';
import { PREVIEW_LIMIT, styles } from '@/screens/search/SearchDataScreen.styles';
import type { EnterpriseListItem } from '@/types/enterprise.types';
import type { ProductListItem } from '@/types/product.types';
import type { ServiceListItem } from '@/types/service.types';
import { SEARCH_LIST_ROUTES, searchListHref } from '@/utils/searchNavigation';
import { View } from 'react-native';

type SearchDataResultsProps = {
  showLoading: boolean;
  hasApiResults: boolean;
  debouncedSearch: string;
  enterprises: EnterpriseListItem[];
  services: ServiceListItem[];
  products: ProductListItem[];
  filteredEvents: Event[];
  filteredCourses: Course[];
  enterpriseNameById: Record<string, string>;
  onViewAll: (route: string) => void;
};

export function SearchDataResults({
  showLoading,
  hasApiResults,
  debouncedSearch,
  enterprises,
  services,
  products,
  filteredEvents,
  filteredCourses,
  enterpriseNameById,
  onViewAll,
}: SearchDataResultsProps) {
  if (showLoading) {
    return <SearchResultsSkeleton />;
  }

  if (!hasApiResults && filteredEvents.length === 0 && filteredCourses.length === 0) {
    return <EmptyState entity="results" />;
  }

  return (
    <>
      {enterprises.length > 0 ? (
        <View style={styles.section}>
          <SearchSectionHeading
            title="Enterprises"
            count={enterprises.length}
            onViewAll={() => onViewAll(searchListHref(SEARCH_LIST_ROUTES.enterprises, debouncedSearch))}
          />
          <View style={styles.enterpriseList}>
            {enterprises.slice(0, PREVIEW_LIMIT).map((item) => (
              <EnterpriseRow key={item.id} enterprise={item} fromSearch />
            ))}
          </View>
        </View>
      ) : null}

      {services.length > 0 ? (
        <View style={styles.section}>
          <SearchSectionHeading
            title="Services"
            count={services.length}
            onViewAll={() => onViewAll(searchListHref(SEARCH_LIST_ROUTES.services, debouncedSearch))}
          />
          <View style={styles.serviceList}>
            {services.slice(0, PREVIEW_LIMIT).map((item) => (
              <ServiceCard
                key={item.id}
                service={item}
                enterpriseNameById={enterpriseNameById}
                fromSearch
              />
            ))}
          </View>
        </View>
      ) : null}

      {products.length > 0 ? (
        <View style={styles.section}>
          <SearchSectionHeading
            title="Products"
            count={products.length}
            onViewAll={() => onViewAll(searchListHref(SEARCH_LIST_ROUTES.products, debouncedSearch))}
          />
          <View style={styles.productGrid}>
            {products.slice(0, PREVIEW_LIMIT).map((item) => (
              <ProductGridCard key={item.id} product={item} fromSearch />
            ))}
          </View>
        </View>
      ) : null}

      {filteredEvents.length > 0 ? (
        <View style={styles.section}>
          <SearchSectionHeading
            title="Events"
            count={filteredEvents.length}
            onViewAll={() => onViewAll(searchListHref(SEARCH_LIST_ROUTES.events, debouncedSearch))}
          />
          <View style={styles.eventList}>
            {filteredEvents.slice(0, PREVIEW_LIMIT).map((item) => (
              <EventCard key={item.id} event={item} fromSearch />
            ))}
          </View>
        </View>
      ) : null}

      {filteredCourses.length > 0 ? (
        <View style={styles.section}>
          <SearchSectionHeading
            title="Courses"
            count={filteredCourses.length}
            onViewAll={() => onViewAll(searchListHref(SEARCH_LIST_ROUTES.courses, debouncedSearch))}
          />
          <View style={styles.courseList}>
            {filteredCourses.slice(0, PREVIEW_LIMIT).map((item) => (
              <CourseCard key={item.id} course={item} fromSearch />
            ))}
          </View>
        </View>
      ) : null}
    </>
  );
}
