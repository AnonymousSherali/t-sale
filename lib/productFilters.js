/**
 * Product filtering and sorting shared by the products page and the Excel
 * export route. Keeping one implementation is what makes "export what I see"
 * true — two copies would drift and the file would quietly stop matching the
 * table it was exported from.
 */

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Yangilar' },
  { value: 'oldest', label: 'Eskilar' },
  { value: 'price-low', label: "Narx: Kamdan ko'pga" },
  { value: 'price-high', label: "Narx: Ko'pdan kamga" },
  { value: 'name-az', label: 'Nom: A-Z' },
  { value: 'name-za', label: 'Nom: Z-A' },
];

export function filterAndSortProducts(products, { search = '', category = '', sortBy = 'newest' } = {}) {
  const query = search.trim().toLowerCase();

  return products
    .filter((product) => {
      const matchesSearch =
        !query || (product.title || '').toLowerCase().includes(query);
      const matchesCategory = !category || product.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'name-az':
          return (a.title || '').localeCompare(b.title || '');
        case 'name-za':
          return (b.title || '').localeCompare(a.title || '');
        default:
          return 0;
      }
    });
}
