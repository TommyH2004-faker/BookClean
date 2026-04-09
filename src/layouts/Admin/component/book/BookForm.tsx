import React, { FormEvent, useEffect, useState } from "react";

import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Box, Button } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { toast } from "react-toastify";

import { LoadingButton } from "@mui/lab";
import BookModel from "../../../../models/BookModel";
import GenreModel from "../../../../models/GenreModel";
import {endpointBE} from "../../../utils/Constant";
import {getAllGenres} from "../../../../api/GenreApi";
import {getBookByIdAllInformation} from "../../../../api/SachAPI";
import {SelectMultiple} from "../../../utils/SelectMultiple";


interface BookFormProps {
	id: number;
	option: string;
	setKeyCountReload?: any;
	handleCloseModal: any;
}
export const BookForm: React.FC<BookFormProps> = (props) => {
	const [book, setBook] = useState<BookModel>({
		idBook: 0,
		nameBook: "",
		author: "",
		description: "",
		listPrice: NaN,
		sellPrice: NaN,
		quantity: NaN,
		avgRating: NaN,
		soldQuantity: NaN,
		discountPercent: 0,
		thumbnail: "",
		relatedImg: [],
		idGenres: [],
	});
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [relatedFiles, setRelatedFiles] = useState<File[]>([]);
	const [isRemoveAllImages, setIsRemoveAllImages] = useState(false);
	const [genresList, setGenresList] = useState<GenreModel[]>([]);
	const [genresListSelected, setGenresListSelected] = useState<number[]>([]);
	const [previewThumbnail, setPreviewThumbnail] = useState("");
	const [previewRelatedImages, setPreviewRelatedImages] = useState<string[]>(
		[]
	);
	// Giá trị khi đã chọn ở trong select multiple
	const [SelectedListName, setSelectedListName] = useState<any[]>([]);
	// Khi submit thì btn loading ...
	const [statusBtn, setStatusBtn] = useState(false);

	// Lấy dữ liệu khi update
	useEffect(() => {
		if (props.option === "update") {
			getBookByIdAllInformation(props.id).then((response) => {
				setBook(response as BookModel);
				setPreviewThumbnail(response?.thumbnail as string);
				setPreviewRelatedImages(response?.relatedImg as string[]);
				response?.genresList?.forEach((data) => {
					setSelectedListName((prev) => [...prev, data.nameGenre]);
					setBook((prevBook) => {
						return {
							...prevBook,
							idGenres: [...(prevBook.idGenres || []), data.idGenre],
						};
					});
				});
			});
		}
	}, [props.option, props.id]);

	// Khúc này lấy ra tất cả thể loại để cho vào select
	useEffect(() => {
		getAllGenres().then((response) => {
			setGenresList(response.genreList);
		});
	}, [props.option]);

	// Khúc này để lưu danh sách thể loại của sách
	useEffect(() => {
		setBook((prevBook) => ({ ...prevBook, idGenres: genresListSelected }));
	}, [genresListSelected]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    setStatusBtn(true);

    const formData = new FormData();

	
	formData.append("Id", book.idBook.toString());
    formData.append("NameBook", book.nameBook || "");
    formData.append("Author", book.author || "");
    formData.append("Description", book.description || "");
    formData.append("ListPrice", book.listPrice?.toString() || "0");
    formData.append("SellPrice", book.sellPrice?.toString() || "0");
    formData.append("Quantity", book.quantity?.toString() || "0");
    formData.append("DiscountPercent", book.discountPercent?.toString() || "0");
	formData.append("IsRemoveAllImages", isRemoveAllImages ? "true" : "false");
		// ✅ Thumbnail
	if (thumbnailFile) {
	formData.append("Thumbnail", thumbnailFile);
	}

	// ✅ RelatedImages
	relatedFiles.forEach((file) => {
	formData.append("RelatedImages", file);
	});


    // Genres
    book.idGenres?.forEach((id) => formData.append("IdGenres", id.toString()));

    const endpoint =
        props.option === "add"
            ? endpointBE + "/book/add-book"
            : endpointBE + `/book/update-book/${book.idBook}`;

    const method = props.option === "add" ? "POST" : "PUT";
    toast.promise(
        fetch(endpoint, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                // Không set content-type, browser tự set multipart/form-data
            },
            body: formData,
        })	
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                toast.success(
                    props.option === "add" ? "Thêm sách thành công" : "Cập nhật sách thành công"
                );
				 //  Trigger reload BookTable
                if (props.setKeyCountReload) {
                    props.setKeyCountReload(Math.random());
                }

                //  Đóng modal
                props.handleCloseModal();
                return data;
            })
            .catch((err) => {
                console.error(err);
                toast.error("Gặp lỗi trong quá trình xử lý sách");
            }),
        { pending: "Đang xử lý..." }
    );
}

	function handleThumnailImageUpload(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];
  if (!file) return;

  setThumbnailFile(file);

  setPreviewThumbnail(URL.createObjectURL(file));

  
}
function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
  const files = event.target.files;
  if (!files) return;

  const fileArr = Array.from(files);

  if (previewRelatedImages.length + fileArr.length > 5) {
    toast.warning("Chỉ được tải lên tối đa 5 ảnh");
    return;
  }

  setIsRemoveAllImages(false); // 🔥 QUAN TRỌNG

  setRelatedFiles((prev) => [...prev, ...fileArr]);

  setPreviewRelatedImages((prev) => [
    ...prev,
    ...fileArr.map((f) => URL.createObjectURL(f)),
  ]);
}


	return (
		<div>
			<Typography className='text-center' variant='h4' component='h2'>
				{props.option === "add" ? "TẠO SÁCH" : "SỬA SÁCH"}
			</Typography>
			<hr />
			<div className='container px-5'>
				<form onSubmit={handleSubmit} className='form'>
					<input type='hidden' id='idBook' value={book?.idBook} hidden />
					<div className='row'>
						<div
							className={props.option === "update" ? "col-4" : "col-6"}
						>
							<Box
								sx={{
									"& .MuiTextField-root": { mb: 3 },
								}}
							>
								<TextField
									required
									id='filled-required'
									label='Tên sách'
									style={{ width: "100%" }}
									value={book.nameBook}
									onChange={(e: any) =>
										setBook({ ...book, nameBook: e.target.value })
									}
									size='small'
								/>

								<TextField
									required
									id='filled-required'
									label='Tên tác giả'
									style={{ width: "100%" }}
									value={book.author}
									onChange={(e: any) =>
										setBook({ ...book, author: e.target.value })
									}
									size='small'
								/>

								<TextField
									required
									id='filled-required'
									label='Giá niêm yết'
									style={{ width: "100%" }}
									type='number'
									value={
										Number.isNaN(book.listPrice) ? "" : book.listPrice
									}
									onChange={(e: any) =>
										setBook({
											...book,
											listPrice: parseInt(e.target.value),
										})
									}
									size='small'
								/>
							</Box>
						</div>
						<div
							className={props.option === "update" ? "col-4" : "col-6"}
						>
							<Box
								sx={{
									"& .MuiTextField-root": { mb: 3 },
								}}
							>
								<TextField
									required
									id='filled-required'
									label='Số lượng'
									style={{ width: "100%" }}
									type='number'
									value={
										Number.isNaN(book.quantity) ? "" : book.quantity
									}
									onChange={(e: any) =>
										setBook({
											...book,
											quantity: parseInt(e.target.value),
										})
									}
									size='small'
								/>
								<SelectMultiple
									selectedList={genresListSelected}
									setSelectedList={setGenresListSelected}
									selectedListName={SelectedListName}
									setSelectedListName={setSelectedListName}
									values={genresList}
									setValue={setBook}
									key={reloadCount}
									required={true}
								/>

								<TextField
									id='filled-required'
									label='Giảm giá (%)'
									style={{ width: "100%" }}
									type='number'
									value={
										Number.isNaN(book.discountPercent)
											? ""
											: book.discountPercent
									}
									onChange={(e: any) => {
										setBook({
											...book,
											discountPercent: parseInt(e.target.value),
											sellPrice:
												book.listPrice -
												Math.round(
													(book.listPrice *
														Number.parseInt(e.target.value)) /
														100
												),
										});
									}}
									size='small'
								/>

							</Box>
						</div>
						{props.option === "update" && (
							<div className='col-4'>
								<Box
									sx={{
										"& .MuiTextField-root": { mb: 3 },
									}}
								>
									<TextField
										id='filled-required'
										label='Giá bán'
										style={{ width: "100%" }}
										value={book.sellPrice.toLocaleString("vi-vn")}
										type='number'
										InputProps={{
											disabled: true,
										}}
										size='small'
									/>

									<TextField
										id='filled-required'
										label='Đã bán'
										style={{ width: "100%" }}
										value={book.soldQuantity}
										InputProps={{
											disabled: true,
										}}
										size='small'
									/>

							
								</Box>
							</div>
						)}
						<div className='col-12'>
							<Box>
								<TextField
									id='outlined-multiline-flexible'
									label='Mô tả sách'
									style={{ width: "100%" }}
									multiline
									maxRows={5}
									value={book.description}
									onChange={(e: any) =>
										setBook({ ...book, description: e.target.value })
									}
									required
								/>
							</Box>
						</div>
						<div className='d-flex align-items-center mt-3'>
							<Button
								size='small'
								component='label'
								variant='outlined'
								startIcon={<CloudUpload />}
							>
								Tải ảnh thumbnail
								<input
									style={{ opacity: "0", width: "10px" }}
									required={props.option === "update" ? false : true}
									type='file'
									accept='image/*'
									onChange={handleThumnailImageUpload}
									alt=''
								/>
							</Button>
							<img src={previewThumbnail} alt='' width={100} />
						</div>
						<div className='d-flex align-items-center mt-3'>
							<Button
								size='small'
								component='label'
								variant='outlined'
								startIcon={<CloudUpload />}
							>
								Tải ảnh liên quan
								<input
									style={{ opacity: "0", width: "10px" }}
									// required
									type='file'
									accept='image/*'
									onChange={handleImageUpload}
									multiple
									alt=''
								/>
							</Button>
							{previewRelatedImages.map((imgURL) => (
								<img src={imgURL} alt='' width={100} />
							))}
							{previewRelatedImages.length > 0 && (
								<Button
									// onClick={() => {
									// 	setPreviewRelatedImages([]);
									// 	setBook({ ...book, relatedImg: [] });
									// }}
									onClick={() => {
								setPreviewRelatedImages([]);
								setRelatedFiles([]);
								setIsRemoveAllImages(true); // ✅ cực quan trọng
								}}
								>
									Xoá tất cả
								</Button>
							)}
						</div>
					</div>
					{props.option !== "view" && (
						<LoadingButton
							className='my-3'
							type='submit'
							loading={statusBtn}
							variant='outlined'
							sx={{ width: { xs: "100%", md: "25%" }, padding: "10px" }}
						>
							{props.option === "add" ? "Tạo sách" : "Lưu sách"}
						</LoadingButton>
					)}
				</form>
			</div>
		</div>
	);
};
