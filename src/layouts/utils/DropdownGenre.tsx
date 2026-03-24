import React, { useState, useEffect } from "react";
import { endpointBE } from "./Constant";

interface Genre {
    idGenre: number;
    nameGenre: string;
}

const DropdownGenre: React.FC = () => {
    const [genres, setGenres] = useState<Genre[]>([]); // ✅ Định nghĩa kiểu dữ liệu
    const [selectedGenre, setSelectedGenre] = useState<string>("");

    useEffect(() => {
        fetch(`${endpointBE}/genres`)
            .then((response) => response.json())
            .then((data) => setGenres(data._embedded.genres)) // ✅ TypeScript sẽ hiểu genres là mảng Genre[]
            .catch((error) => console.error("Lỗi khi tải thể loại:", error));
    }, []);

    const handleGenreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const genreId = event.target.value;
        setSelectedGenre(genreId);
        if (genreId) {
            window.location.href = `${endpointBE}/genres/${genreId}`;
        }
    };

    return (
        <div>
            <label htmlFor="genreDropdown">Chọn thể loại:</label>
            <select id="genreDropdown" value={selectedGenre} onChange={handleGenreChange}>
                <option value="">-- Chọn thể loại --</option>
                {genres.map((genre) => (
                    <option key={genre.idGenre} value={genre.idGenre}>
                        {genre.nameGenre}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default DropdownGenre;
