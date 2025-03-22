import api from "@/api";
import React, { useState, useCallback } from "react";
import debounce from "lodash.debounce"; // using ok
interface AddressInputProps {
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}
const AddressInput: React.FC<AddressInputProps> = ({ setFormData }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const fetchSuggestions = useCallback(
    debounce(async (value: string) => {
      if (value.length >= 3) {
        const result = await api.geolocation.getSuggestions(value);
        setSuggestions(result);
      } else {
        setSuggestions([]);
      }
    }, 500), // Delay 500ms
    []
  );
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };
  const handleSelectSuggestion = (address: string) => {
    setSelectedAddress(address);
    setQuery(address); // Tự động điền vào ô input
    setSuggestions([]); // Ẩn gợi ý sau khi chọn
    setFormData((prevData: any) => ({
      ...prevData,
      address: address,
    }));
  };
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Nhập địa chỉ"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
      />
      {suggestions.length > 0 && (
        <ul className="w-full mt-2 bg-white text-primary border p-3 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-all duration-300 animate-fadeIn">
          {suggestions.map((suggestion, index) => (
            <li
              className="hover:bg-primary hover:text-white cursor-pointer"
              key={index}
              onClick={() =>
                handleSelectSuggestion(suggestion.formatted_address)
              }
            >
              {suggestion.formatted_address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default AddressInput;
