import React, { useEffect, useMemo, useState } from "react";
import { CloudUpload } from "@mui/icons-material";
import { Autocomplete, Box, Button, CircularProgress, Divider, MenuItem, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";

import {
	addFlashSaleItem,
	createFlashSale,
	getFlashSales,
	uploadFlashSaleImage,
	updateFlashSale,
	type AddFlashSaleItemPayload,
	type CreateFlashSalePayload,
	type UpdateFlashSalePayload,
} from "../../../../api/FlashSaleApi";
import { getAllBook } from "../../../../api/SachAPI";
import type BookModel from "../../../../models/BookModel";
import { FlashSaleStatus, flashSaleStatusLabel, type FlashSaleModel } from "../../../../models/FlashSaleModel";

export type FlashSaleFormOption = "create" | "addItem" | "edit";

interface FlashSaleFormProps {
	option: FlashSaleFormOption;
	flashSaleId?: number;
	flashSale?: FlashSaleModel | null;
	onCreatedFlashSale?: (flashSaleId: number) => void;
	onSelectedFlashSaleId?: (flashSaleId: number) => void;
	handleCloseModal: () => void;
	onChanged?: () => void;
}

function toIsoOrThrow(datetimeLocalValue: string): string {
  const v = datetimeLocalValue?.trim();
  if (!v) throw new Error("Thời gian không hợp lệ");

  // giữ giờ local, KHÔNG đổi sang UTC
  return v.length === 16 ? `${v}:00` : v; // "YYYY-MM-DDTHH:mm:ss"
}

function toDatetimeLocalValue(value?: string): string {
	if (!value) return "";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";

	const pad = (n: number) => String(n).padStart(2, "0");
	const yyyy = d.getFullYear();
	const mm = pad(d.getMonth() + 1);
	const dd = pad(d.getDate());
	const hh = pad(d.getHours());
	const min = pad(d.getMinutes());
	return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export const FlashSaleForm: React.FC<FlashSaleFormProps> = (props) => {
	const title = useMemo(() => {
		switch (props.option) {
			case "create":
				return "Tạo Flash Sale";
			case "addItem":
				return "Thêm sản phẩm vào Flash Sale";
			case "edit":
				return "Sửa Flash Sale";
			default:
				return "Flash Sale";
		}
	}, [props.option]);

	const [submitting, setSubmitting] = useState(false);

	// create flash sale
	const [name, setName] = useState("");
	const [image, setImage] = useState("");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [status, setStatus] = useState<number>(FlashSaleStatus.Draft);

	// add item
	const [flashSalesLoading, setFlashSalesLoading] = useState(false);
	const [flashSales, setFlashSales] = useState<FlashSaleModel[]>([]);
	const [selectedFlashSale, setSelectedFlashSale] = useState<FlashSaleModel | null>(null);

	const activeFlashSales = useMemo(() => {
		return flashSales.filter((fs) => Number(fs?.status) === FlashSaleStatus.Active);
	}, [flashSales]);

	const [booksLoading, setBooksLoading] = useState(false);
	const [books, setBooks] = useState<BookModel[]>([]);
	const [selectedBook, setSelectedBook] = useState<BookModel | null>(null);
	const [originalPrice, setOriginalPrice] = useState<number>(0);
	const [salePrice, setSalePrice] = useState<number>(0);
	const [quantity, setQuantity] = useState<number>(1);
	const [maxPerUser, setMaxPerUser] = useState<number | "">("");

	const flashSaleId = props.flashSaleId;

	useEffect(() => {
		if (props.option !== "addItem") return;

		let cancelled = false;
		setFlashSalesLoading(true);
		getFlashSales()
			.then((data) => {
				if (cancelled) return;
				const list = Array.isArray(data) ? data : [];
				setFlashSales(list);
				setFlashSalesLoading(false);
			})
			.catch((err: any) => {
				if (cancelled) return;
				toast.error(err?.message || "Không tải được danh sách Flash Sale");
				setFlashSales([]);
				setFlashSalesLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [props.option]);

	useEffect(() => {
		if (props.option !== "addItem") return;
		const preferredId = Number(props.flashSaleId);
		if (!Number.isFinite(preferredId) || preferredId <= 0) return;
		if (selectedFlashSale) return;
		const found = activeFlashSales.find((x) => Number(x?.id) === preferredId) ?? null;
		if (found) setSelectedFlashSale(found);
	}, [props.option, props.flashSaleId, activeFlashSales, selectedFlashSale]);

	useEffect(() => {
		if (props.option !== "edit") return;
		const fs = props.flashSale;
		setName(fs?.name ?? "");
		setImage(fs?.image ?? "");
		setPreviewImageUrl(fs?.image ?? "");
		setImageFile(null);
		setStartTime(toDatetimeLocalValue(fs?.startTime));
		setEndTime(toDatetimeLocalValue(fs?.endTime));
		setStatus(Number(fs?.status ?? FlashSaleStatus.Draft));
	}, [props.option, props.flashSale]);

	function handleFlashSaleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;
		setImageFile(file);
		setPreviewImageUrl(URL.createObjectURL(file));
	}

	useEffect(() => {
		if (props.option !== "addItem") return;

		let cancelled = false;
		setBooksLoading(true);
		getAllBook(1000, 0)
			.then((response) => {
				if (cancelled) return;
				setBooks(response?.ketQua ?? []);
				setBooksLoading(false);
			})
			.catch((err: any) => {
				if (cancelled) return;
				toast.error(err?.message || "Không tải được danh sách sách");
				setBooks([]);
				setBooksLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [props.option]);

	useEffect(() => {
		if (!selectedBook) return;

		const sellPrice = Number(selectedBook.sellPrice ?? 0);
		const listPrice = Number(selectedBook.listPrice ?? 0);
		const inferred = sellPrice > 0 ? sellPrice : listPrice;
		if (inferred > 0) {
			setOriginalPrice(inferred);
		}
	}, [selectedBook]);

	const handleSuccessReload = () => {
		props.onChanged?.();
		props.handleCloseModal();
	};

	const handleSubmitCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setSubmitting(true);

			if (!name.trim()) {
				throw new Error("Vui lòng nhập tên Flash Sale");
			}
			if (!startTime || !endTime) {
				throw new Error("Vui lòng chọn thời gian bắt đầu/kết thúc");
			}

			const payload: CreateFlashSalePayload = {
				name: name.trim(),
				startTime: toIsoOrThrow(startTime),
				endTime: toIsoOrThrow(endTime),
			};

			if (new Date(payload.endTime) <= new Date(payload.startTime)) {
				throw new Error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu");
			}

			const created = await createFlashSale(payload);
			const createdId = Number(created?.id);

			if (imageFile && Number.isFinite(createdId) && createdId > 0) {
				try {
					const updated = await uploadFlashSaleImage(createdId, imageFile);
					const nextUrl = String(updated?.image ?? "").trim();
					if (nextUrl) {
						setImage(nextUrl);
						setPreviewImageUrl(nextUrl);
					}
					toast.success("Upload ảnh Flash Sale thành công");
				} catch (uploadErr: any) {
					toast.error(uploadErr?.message || "Upload ảnh Flash Sale thất bại (bạn có thể vào Sửa để tải lại ảnh)");
				}
			}

			if (Number.isFinite(createdId) && createdId > 0) {
				props.onCreatedFlashSale?.(createdId);
				toast.success(`Tạo Flash Sale thành công (ID: ${createdId})`);
			} else {
				toast.success("Tạo Flash Sale thành công");
			}
			handleSuccessReload();
		} catch (err: any) {
			toast.error(err?.message || "Tạo Flash Sale thất bại");
		} finally {
			setSubmitting(false);
		}
	};

	const handleSubmitAddItem = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setSubmitting(true);

			const resolvedFlashSaleId = Number(selectedFlashSale?.id ?? flashSaleId);
			if (!resolvedFlashSaleId || resolvedFlashSaleId <= 0) throw new Error("Vui lòng chọn chương trình Flash Sale");
			const resolvedFlashSale =
				selectedFlashSale ?? flashSales.find((fs) => Number(fs?.id) === resolvedFlashSaleId) ?? null;
			if (!resolvedFlashSale) throw new Error("Không tìm thấy chương trình Flash Sale");
			if (Number(resolvedFlashSale.status) !== FlashSaleStatus.Active) {
				throw new Error("Chỉ có thể thêm sản phẩm vào Flash Sale đang hoạt động");
			}
			const bookId = Number(selectedBook?.idBook);
			if (!bookId || bookId <= 0) throw new Error("Vui lòng chọn sách");
			if (quantity <= 0) throw new Error("Số lượng phải > 0");
			if (salePrice <= 0 || originalPrice <= 0) throw new Error("Giá phải > 0");

			const payload: AddFlashSaleItemPayload = {
				flashSaleId: resolvedFlashSaleId,
				bookId,
				originalPrice,
				salePrice,
				quantity,
				maxPerUser: maxPerUser === "" ? null : maxPerUser,
			};

			await addFlashSaleItem(payload);
			toast.success("Thêm sản phẩm vào Flash Sale thành công");
			props.onSelectedFlashSaleId?.(resolvedFlashSaleId);
			handleSuccessReload();
		} catch (err: any) {
			toast.error(err?.message || "Thêm sản phẩm thất bại");
		} finally {
			setSubmitting(false);
		}
	};

	const handleSubmitEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setSubmitting(true);

			const id = Number(flashSaleId ?? props.flashSale?.id);
			if (!Number.isFinite(id) || id <= 0) throw new Error("FlashSaleId không hợp lệ");
			if (!name.trim()) throw new Error("Vui lòng nhập tên Flash Sale");
			if (!startTime || !endTime) throw new Error("Vui lòng chọn thời gian bắt đầu/kết thúc");

			let nextImage = image;
			if (imageFile) {
				const updated = await uploadFlashSaleImage(id, imageFile);
				const uploadedUrl = String(updated?.image ?? "").trim();
				if (uploadedUrl) {
					nextImage = uploadedUrl;
					setImage(uploadedUrl);
					setPreviewImageUrl(uploadedUrl);
				}
				toast.success("Upload ảnh Flash Sale thành công");
				setImageFile(null);
			}

			const payload: UpdateFlashSalePayload = {
				flashSaleId: id,
				name: name.trim(),
				...(nextImage.trim() ? { image: nextImage.trim() } : {}),
				startTime: toIsoOrThrow(startTime),
				endTime: toIsoOrThrow(endTime),
				status,
			};

			if (new Date(payload.endTime) <= new Date(payload.startTime)) {
				throw new Error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu");
			}

			await updateFlashSale(payload);
			toast.success("Cập nhật Flash Sale thành công");
			handleSuccessReload();
		} catch (err: any) {
			toast.error(err?.message || "Cập nhật Flash Sale thất bại");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Box>
			<Typography variant="h6" fontWeight={700}>
				{title}
			</Typography>
			{props.option === "edit" && flashSaleId && (
				<Typography variant="body2" sx={{ mt: 1 }}>
					Flash Sale hiện tại: <strong>{name || "(chưa có tên)"}</strong>
				</Typography>
			)}
			<Divider sx={{ my: 2 }} />

			{props.option === "create" && (
				<form onSubmit={handleSubmitCreate}>
					<TextField
						label="Tên Flash Sale"
						fullWidth
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={submitting}
						sx={{ mb: 2 }}
					/>

					<Button
						size="small"
						component="label"
						variant="outlined"
						startIcon={<CloudUpload />}
						disabled={submitting}
						sx={{ mb: 2 }}
					>
						Tải ảnh chương trình
						<input
							style={{ opacity: "0", width: "10px" }}
							type="file"
							accept="image/*"
							onChange={handleFlashSaleImageUpload}
							alt=""
						/>
					</Button>

					{previewImageUrl && (
						<Box sx={{ mb: 2 }}>
							<img src={previewImageUrl} alt="" width={100} />
						</Box>
					)}

					<TextField
						label="Thời gian bắt đầu"
						type="datetime-local"
						fullWidth
						InputLabelProps={{ shrink: true }}
						value={startTime}
						onChange={(e) => setStartTime(e.target.value)}
						disabled={submitting}
						sx={{ mb: 2 }}
					/>

					<TextField
						label="Thời gian kết thúc"
						type="datetime-local"
						fullWidth
						InputLabelProps={{ shrink: true }}
						value={endTime}
						onChange={(e) => setEndTime(e.target.value)}
						disabled={submitting}
						sx={{ mb: 2 }}
					/>

					<Button type="submit" variant="contained" color="success" disabled={submitting}>
						Tạo Flash Sale
					</Button>
				</form>
			)}

			{props.option === "addItem" && (
				<form onSubmit={handleSubmitAddItem}>
					<Autocomplete
						options={activeFlashSales}
						loading={flashSalesLoading}
						value={selectedFlashSale}
						onChange={(_, value) => setSelectedFlashSale(value)}
						getOptionLabel={(option) => {
							return option?.name?.trim() || "(Chưa đặt tên)";
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Chọn chương trình Flash Sale"
								fullWidth
								disabled={submitting}
								InputProps={{
									...params.InputProps,
									endAdornment: (
										<>
											{flashSalesLoading ? <CircularProgress color="inherit" size={16} /> : null}
											{params.InputProps.endAdornment}
										</>
									),
								}}
								sx={{ mb: 2 }}
							/>
						)}
					/>

					<Autocomplete
						options={books}
						loading={booksLoading}
						value={selectedBook}
						onChange={(_, value) => setSelectedBook(value)}
						getOptionLabel={(option) => {
							return option?.nameBook?.trim() || "(Chưa có tên sách)";
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Chọn sách"
								fullWidth
								disabled={submitting}
								InputProps={{
									...params.InputProps,
									endAdornment: (
										<>
											{booksLoading ? <CircularProgress color="inherit" size={16} /> : null}
											{params.InputProps.endAdornment}
										</>
									),
								}}
								sx={{ mb: 2 }}
							/>
						)}
					/>

					<TextField
						label="Giá gốc"
						type="number"
						fullWidth
						value={originalPrice || ""}
						onChange={(e) => setOriginalPrice(Number(e.target.value))}
						disabled={submitting}
						sx={{ mb: 2 }}
					/>

					<TextField
						label="Giá khuyến mãi"
						type="number"
						fullWidth
						value={salePrice || ""}
						onChange={(e) => setSalePrice(Number(e.target.value))}
						disabled={submitting}
						sx={{ mb: 2 }}
					/>

					<TextField
						label="Số lượng"
						type="number"
						fullWidth
						value={quantity}
						onChange={(e) => setQuantity(Number(e.target.value))}
						disabled={submitting}
						sx={{ mb: 2 }}
					/>

					<TextField
						label="Tối đa mỗi người (tuỳ chọn)"
						type="number"
						fullWidth
						value={maxPerUser}
						onChange={(e) => {
							const v = e.target.value;
							setMaxPerUser(v === "" ? "" : Number(v));
						}}
						disabled={submitting}
						sx={{ mb: 2 }}
					/>

					<Button type="submit" variant="contained" color="primary" disabled={submitting}>
						Thêm sản phẩm
					</Button>
				</form>
			)}

			{props.option === "edit" && (
				<form onSubmit={handleSubmitEdit}>
					<TextField
						label="Tên Flash Sale"
						fullWidth
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={submitting}
						sx={{ mb: 2 }}
					/>

					<Button
						size="small"
						component="label"
						variant="outlined"
						startIcon={<CloudUpload />}
						disabled={submitting}
						sx={{ mb: 2 }}
					>
						Cập nhật ảnh chương trình
						<input
							style={{ opacity: "0", width: "10px" }}
							type="file"
							accept="image/*"
							onChange={handleFlashSaleImageUpload}
							alt=""
						/>
					</Button>

					{previewImageUrl && (
						<Box sx={{ mb: 2 }}>
							<img src={previewImageUrl} alt="" width={100} />
						</Box>
					)}

					<TextField
						label="Trạng thái"
						select
						fullWidth
						value={String(status)}
						onChange={(e) => setStatus(Number(e.target.value))}
						disabled={submitting}
						sx={{ mb: 2 }}
					>
						<MenuItem value={String(FlashSaleStatus.Draft)}>
							{flashSaleStatusLabel(FlashSaleStatus.Draft)}
						</MenuItem>
						<MenuItem value={String(FlashSaleStatus.Active)}>
							{flashSaleStatusLabel(FlashSaleStatus.Active)}
						</MenuItem>
						<MenuItem value={String(FlashSaleStatus.Cancelled)}>
							{flashSaleStatusLabel(FlashSaleStatus.Cancelled)}
						</MenuItem>
						<MenuItem value={String(FlashSaleStatus.Ended)}>
							{flashSaleStatusLabel(FlashSaleStatus.Ended)}
						</MenuItem>
					</TextField>

					<TextField
						label="Thời gian bắt đầu"
						type="datetime-local"
						fullWidth
						InputLabelProps={{ shrink: true }}
						value={startTime}
						onChange={(e) => setStartTime(e.target.value)}
						disabled={submitting}
						sx={{ mb: 2 }}
					/>

					<TextField
						label="Thời gian kết thúc"
						type="datetime-local"
						fullWidth
						InputLabelProps={{ shrink: true }}
						value={endTime}
						onChange={(e) => setEndTime(e.target.value)}
						disabled={submitting}
						sx={{ mb: 2 }}
					/>

					<Button type="submit" variant="contained" color="primary" disabled={submitting}>
						Lưu thay đổi
					</Button>
				</form>
			)}
		</Box>
	);
};
