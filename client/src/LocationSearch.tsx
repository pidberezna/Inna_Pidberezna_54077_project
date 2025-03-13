import React, { useState } from 'react';
import axios from 'axios';

const LocationSearch: React.FC<{ onSelect: (address: string) => void }> = ({
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSearch = async (input: string) => {
    setQuery(input);
    if (input.length < 3) return;

    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          input
        )}&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`,
        { withCredentials: false }
      );
      const results = response.data.features.map(
        (feature: any) => feature.properties.formatted
      );
      setSuggestions(results);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Address"
        className="w-full border p-2"
      />
      {suggestions.length > 0 && (
        <ul className="absolute bg-white border w-full mt-1">
          {suggestions.map((address, index) => (
            <li
              key={index}
              onClick={() => {
                onSelect(address);
                setQuery(address);
                setSuggestions([]);
              }}
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;
