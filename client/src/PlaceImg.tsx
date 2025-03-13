import { Place } from './pages/PlacesPage';

export default function PlaceImg({
  place,
  index = 0,
  className = 'object-cover',
}: {
  place: Place;
  index?: number;
  className?: string;
}) {
  if (!place.photos?.length) return '';
  return (
    <img className={className} src={`/uploads/` + place.photos[index]} alt="" />
  );
}
