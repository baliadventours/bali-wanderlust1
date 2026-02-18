
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          common: {
            explore: 'Explore Tours',
            dashboard: 'Dashboard',
            login: 'Login',
            signup: 'Sign Up',
            logout: 'Sign Out',
            search: 'Search tours, adventures, experiences...',
            filters: 'Filters',
            sortBy: 'Sort By',
            price_low: 'Price: Low to High',
            price_high: 'Price: High to Low',
            newest: 'Newest First',
            popularity: 'Popularity',
            destinations: 'Destinations',
            all_destinations: 'All Destinations',
            price_range: 'Price Range',
            experience_type: 'Experience Type',
            all_types: 'All Types',
            from: 'From',
            details: 'Details',
            book_now: 'Book Adventure Now',
            per_person: 'per person',
            select_date: 'Select Date',
            participants: 'Participants',
            addons: 'Optional Add-ons',
            total: 'Total',
          }
        }
      },
      es: {
        translation: {
          common: {
            explore: 'Explorar Tours',
            dashboard: 'Tablero',
            login: 'Iniciar Sesión',
            signup: 'Registrarse',
            logout: 'Cerrar Sesión',
            search: 'Buscar tours, aventuras, experiencias...',
            filters: 'Filtros',
            sortBy: 'Ordenar Por',
            price_low: 'Precio: Menor a Mayor',
            price_high: 'Precio: Mayor a Menor',
            newest: 'Más Recientes',
            popularity: 'Popularidad',
            destinations: 'Destinos',
            all_destinations: 'Todos los Destinos',
            price_range: 'Rango de Precios',
            experience_type: 'Tipo de Experiencia',
            all_types: 'Todos los Tipos',
            from: 'Desde',
            details: 'Detalles',
            book_now: 'Reservar Aventura Ahora',
            per_person: 'por persona',
            select_date: 'Seleccionar Fecha',
            participants: 'Participantes',
            addons: 'Complementos Opcionales',
            total: 'Total',
          }
        }
      }
    }
  });

export default i18n;
