import photos from './assets/documents/sources.json';

// Vite emits the photos as versioned local assets; they load only when a document opens.
const urls = import.meta.glob('./assets/documents/*.{jpg,webp,gif}', {
  eager: true, query: '?url', import: 'default',
});
const roomPhotos = {
  vestibule: 'mausoleum', memorial: 'mausoleum', museum: 'museum',
  'president-office': 'president-office', reception: 'reception', cabinet: 'cabinet',
  credentials: 'credentials', banquet: 'banquet', office: 'office',
  'video-meeting': 'video-meeting', operations: 'operations', meeting: 'government',
  lobby: 'office', 'lotus-pavilion': 'pagoda', 'drum-overlook': 'drum',
};

export function documentPhoto(source) {
  const key = source.buildingId ? roomPhotos[source.id] : source.id;
  const photo = photos[key];
  if (!photo) return null;
  return { ...photo, src: urls[`./assets/documents/${photo.file}`] };
}
