import { DeleteOutlineOutlined } from "@mui/icons-material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Box, CircularProgress, IconButton, Tooltip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useConfirm } from "material-ui-confirm";

import { deleteFlashSaleItem, getFlashSaleItems, getFlashSales } from "../../../../api/FlashSaleApi";
import { layThumbnailSachTheoTenSach } from "../../../../api/HinhAnhAPI";
import type { FlashSaleItemModel } from "../../../../models/FlashSaleItemModel";
import { FlashSaleStatus } from "../../../../models/FlashSaleModel";
import { DataTable } from "../../../utils/DataTable";
import dinhDangSo from "../../../utils/dinhDangSo";
import { FadeModal } from "../../../utils/FadeModal";
import { FlashSaleItemEditForm } from "./FlashSaleItemEditForm";

interface FlashSaleTableProps {
	keyCountReload?: any;
	flashSaleId?: number | null;
	onChanged?: () => void;
}

export const FlashSaleTable: React.FC<FlashSaleTableProps> = (props) => {
	const [loading, setLoading] = useState(true);
	const confirm = useConfirm();
	const [items, setItems] = useState<FlashSaleItemModel[]>([]);
	const [flashSaleNameById, setFlashSaleNameById] = useState<Record<number, string>>({});
	const [thumbnailByBookName, setThumbnailByBookName] = useState<Record<string, string>>({});

	const [openEdit, setOpenEdit] = useState(false);
	const [editingItem, setEditingItem] = useState<FlashSaleItemModel | null>(null);
	const handleOpenEdit = () => setOpenEdit(true);
	const handleCloseEdit = () => setOpenEdit(false);

	useEffect(() => {
		let cancelled = false;
		getFlashSales()
			.then((data) => {
				if (cancelled) return;
				const list = Array.isArray(data) ? data : [];
				const map: Record<number, string> = {};
				for (const fs of list) {
					const id = Number((fs as any)?.id);
					if (Number.isFinite(id) && id > 0) {
						map[id] = String((fs as any)?.name ?? "");
					}
				}
				setFlashSaleNameById(map);
			})
			.catch(() => {
				// Ignore: name column is optional (fallback to empty)
			});

		return () => {
			cancelled = true;
		};
	}, [props.keyCountReload]);

	useEffect(() => {
		let cancelled = false;
		const flashSaleId = Number(props.flashSaleId);
		setLoading(true);
		setThumbnailByBookName({});

		const loadThumbnails = async (nextItems: FlashSaleItemModel[]) => {
			const bookNames = Array.from(
				new Set(
					nextItems
						.map((item) => String(item.bookName ?? "").trim())
						.filter((name) => name.length > 0)
				)
			);

			const entries = await Promise.all(
				bookNames.map(async (bookName) => {
					try {
						const thumbnail = await layThumbnailSachTheoTenSach(bookName);
						return [bookName, thumbnail] as const;
					} catch {
						return [bookName, ""] as const;
					}
				})
			);

			return entries.reduce<Record<string, string>>((acc, [bookName, thumbnail]) => {
				if (thumbnail) {
					acc[bookName] = thumbnail;
				}
				return acc;
			}, {});
		};

		const loadAllActiveItems = async () => {
			const flashSales = await getFlashSales();
			const activeFlashSales = (Array.isArray(flashSales) ? flashSales : []).filter(
				(fs) => Number(fs?.status) === FlashSaleStatus.Active
			);
			const itemGroups = await Promise.all(
				activeFlashSales.map(async (fs) => {
					const id = Number(fs?.id);
					if (!Number.isFinite(id) || id <= 0) return [] as FlashSaleItemModel[];
					const items = await getFlashSaleItems(id);
					return (Array.isArray(items) ? items : []).map((item) => ({
						...item,
						flashSaleId: item.flashSaleId ?? id,
						flashSaleName: (fs as any)?.name ?? "",
					}));
				})
			);
			return itemGroups.flat();
		};

		const loadSingleEventItems = async () => {
			if (!Number.isFinite(flashSaleId) || flashSaleId <= 0) return [] as FlashSaleItemModel[];
			const data = await getFlashSaleItems(flashSaleId);
			return (Array.isArray(data) ? data : []).map((item) => ({
				...item,
				flashSaleId: item.flashSaleId ?? flashSaleId,
			}));
		};

		Promise.resolve(props.flashSaleId == null ? loadAllActiveItems() : loadSingleEventItems())
			.then(async (nextItems) => {
				const thumbnails = await loadThumbnails(nextItems);
				if (cancelled) return;
				setItems(nextItems);
				setThumbnailByBookName(thumbnails);
				setLoading(false);
			})
			.catch((err: any) => {
				if (cancelled) return;
				toast.error(err?.message || "Không tải được danh sách sản phẩm Flash Sale");
				setItems([]);
				setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [props.keyCountReload, props.flashSaleId]);

	const rows = useMemo(() => {
		return items.map((item, index) => {
			const rowId =
				item.id ??
				`${item.flashSaleId ?? "fs"}-${item.bookId ?? "book"}-${index}`;
			const flashSaleId = Number(item.flashSaleId);
			const flashSaleName =
				(item as any)?.flashSaleName ??
				(Number.isFinite(flashSaleId) ? flashSaleNameById[flashSaleId] : undefined) ??
				"";
			return {
				...item,
				flashSaleName,
				thumbnail:
					(item as any)?.thumbnail ||
					((item as any)?.bookName ? thumbnailByBookName[String((item as any).bookName).trim()] : "") ||
					"",
				flashSaleItemId: item.id,
				id: rowId,
			};
		});
	}, [items, flashSaleNameById, thumbnailByBookName]);

	const columns: GridColDef[] = [
		{ field: "flashSaleName", headerName: "SỰ KIỆN", flex: 1, minWidth: 200 },
		{
			field: "thumbnail",
			headerName: "ẢNH",
			width: 90,
			sortable: false,
			filterable: false,
			renderCell: (params) => {
				const src = String(params.value ?? "");
				const bookName = String(params?.row?.bookName ?? "Sách");

				return (
					<img
						src={src || "https://via.placeholder.com/48?text=No+Img"}
						alt={bookName}
						style={{
							width: 48,
							height: 48,
							borderRadius: 8,
							objectFit: "cover",
						}}
					/>
				);
			},
		},
		{
			field: "bookName",
			headerName: "TÊN SÁCH",
			flex: 1,
			minWidth: 220,
			renderCell: (params) => <span>{String(params.value ?? "")}</span>,
		},
		{
			field: "originalPrice",
			headerName: "GIÁ GỐC",
			width: 130,
			renderCell: (params) => <span>{dinhDangSo(Number(params.value))}đ</span>,
		},
		{
			field: "salePrice",
			headerName: "GIÁ FLASH",
			width: 130,
			renderCell: (params) => <span>{dinhDangSo(Number(params.value))}đ</span>,
		},
		{ field: "quantity", headerName: "SỐ LƯỢNG", width: 110 },
		{ field: "sold", headerName: "ĐÃ BÁN", width: 110 },
		{ field: "maxPerUser", headerName: "TỐI ĐA/NGƯỜI", width: 140 },
		{
			field: "action",
			headerName: "HÀNH ĐỘNG",
			width: 200,
			sortable: false,
			filterable: false,
			renderCell: (params) => {
				const flashSaleId = Number(params?.row?.flashSaleId);
				const itemId = Number(params?.row?.flashSaleItemId);

				return (
					<div>
						<Tooltip title={"Chỉnh sửa"}>
							<IconButton
								color='primary'
								onClick={() => {
									setEditingItem(params.row as FlashSaleItemModel);
									handleOpenEdit();
								}}
							>
								<EditOutlinedIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title={"Xoá"}>
							<IconButton
								color='error'
								onClick={() => {
									if (!flashSaleId || flashSaleId <= 0 || !itemId || itemId <= 0) {
										toast.error("Không xác định được FlashSaleId/ItemId");
										return;
									}

									confirm({
										title: "Xoá FlashSaleItem",
										description: "Bạn chắc chắn muốn xoá item này chứ?",
										confirmationText: ["Xoá"],
										cancellationText: ["Huỷ"],
									})
										.then(async () => {
											await deleteFlashSaleItem(
												flashSaleId,
												itemId,
												(params.row as any)?.rowVersion
											);
											toast.success("Xoá FlashSaleItem thành công");
											props.onChanged?.();
										})
										.catch(() => {});
								}}
							>
								<DeleteOutlineOutlined />
							</IconButton>
						</Tooltip>
					</div>
				);
			},
		},
	];

	if (loading) {
		return (
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<>
			<DataTable
				columns={columns}
				rows={rows}
			/>

			<FadeModal open={openEdit} handleOpen={handleOpenEdit} handleClose={handleCloseEdit}>
				{editingItem && (
					<FlashSaleItemEditForm
						item={editingItem}
						onClose={handleCloseEdit}
						onSaved={() => props.onChanged?.()}
					/>
				)}
			</FadeModal>
		</>
	);
};
