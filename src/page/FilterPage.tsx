/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import ToolFilter from "./components/ToolFilter";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useScrollToTop from "../hooks/ScrollToTop";
import BookList from "../layouts/product/BookList";


interface FilterPageProps {
	keySearchNav?: string; // key search từ navbar
}

const FilterPage: React.FC<FilterPageProps> = (props) => {
	useScrollToTop(); // Mỗi lần vào component này thì sẽ ở trên cùng

	const [size, setSize] = useState(12); // Hiển thị bao nhiêu sản phẩm
	const [keySearch, setKeySearch] = useState(""); // Từ khoá của sách
	const [idGenre, setIdGenre] = useState(0); // Thể loại muốn hiển thị
	const [filter, setFilter] = useState(0); // Lọc theo chế độ gì (tên từ A - Z, Z - A, ...)

	// Cập nhật keySearch khi keySearchNav thay đổi
	useEffect(() => {
		if (props.keySearchNav) {
			setKeySearch(props.keySearchNav);
		}
	}, [props.keySearchNav]);

	// Lấy id genre từ URL và ép kiểu an toàn
	const { idGenreParam } = useParams();
	const idGenreNumber = idGenreParam ? parseInt(idGenreParam) || 0 : 0;

	// Cập nhật idGenre khi idGenreNumber thay đổi
	useEffect(() => {
		if (idGenreNumber !== 0) {
			setIdGenre(idGenreNumber);
		}
	}, [idGenreNumber]);

	return (
		<>
			<div className="container-book container bg-light my-3 py-3 px-5">
				<ToolFilter
					size={size}
					setSize={setSize}
					keySearch={keySearch}
					setKeySearch={setKeySearch}
					idGenre={idGenre}
					setIdGenre={setIdGenre}
					filter={filter}
					setFilter={setFilter}
				/>
			</div>
			<BookList paginable={true} size={size} keySearch={keySearch} idGenre={idGenre} filter={filter} />
		</>
	);
};

export default FilterPage;
