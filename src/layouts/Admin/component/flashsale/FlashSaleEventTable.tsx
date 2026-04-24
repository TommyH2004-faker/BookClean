import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Box, CircularProgress, IconButton, Tooltip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { getFlashSales } from "../../../../api/FlashSaleApi";
import { flashSaleStatusLabel, type FlashSaleModel } from "../../../../models/FlashSaleModel";
import { DataTable } from "../../../utils/DataTable";

interface FlashSaleEventTableProps {
	keyCountReload?: any;
	selectedFlashSaleId?: number | null;
	onSelectFlashSaleId?: (flashSaleId: number) => void;
	onEditFlashSale?: (flashSale: FlashSaleModel) => void;
	onDeleteFlashSale?: (flashSale: FlashSaleModel) => void;
}

function formatDateTime(value: any): string {
	if (!value) return "";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return String(value);
	return d.toLocaleString();
}

export const FlashSaleEventTable: React.FC<FlashSaleEventTableProps> = (props) => {
	const [loading, setLoading] = useState(true);
	const [events, setEvents] = useState<FlashSaleModel[]>([]);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);

		getFlashSales()
			.then((data) => {
				if (cancelled) return;
				setEvents(Array.isArray(data) ? data : []);
				setLoading(false);
			})
			.catch((err: any) => {
				if (cancelled) return;
				toast.error(err?.message || "Không tải được danh sách Flash Sale");
				setEvents([]);
				setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [props.keyCountReload]);

	const rows = useMemo(() => {
		return events.map((fs, index) => ({
			...fs,
			flashSaleId: fs.id,
			id: fs.id ?? `fs-${index}`,
		}));
	}, [events]);

	const columns: GridColDef[] = [
		{
			field: "image",
			headerName: "ẢNH",
			width: 130, // Tăng độ rộng cột để chứa ảnh to
			sortable: false,
			filterable: false,
			renderCell: (params) => {
				const url = String(params.value ?? "").trim();
				if (!url) return <span>-</span>;
				
				return (
					<div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", padding: "8px 0" }}>
						<img
							src={url}
							alt="Ảnh sách"
							style={{ 
								width: "100px",    // Cho chiều rộng to ra (tùy chỉnh theo ý bạn)
								height: "100px",   // Cho chiều cao to ra
								objectFit: "contain", // Dùng contain để hiển thị trọn vẹn cuốn sách không bị cắt viền
								borderRadius: "6px",
								boxShadow: "0 2px 4px rgba(0,0,0,0.1)" // Thêm đổ bóng nhẹ cho đẹp
							}}
							loading="lazy"
						/>
					</div>
				);
			},
		},
		{ field: "name", headerName: "TÊN SỰ KIỆN", flex: 1, minWidth: 200 },
		{
			field: "startTime",
			headerName: "BẮT ĐẦU",
			minWidth: 180,
			flex: 1,
			renderCell: (params) => <span>{formatDateTime(params.value)}</span>,
		},
		{
			field: "endTime",
			headerName: "KẾT THÚC",
			minWidth: 180,
			flex: 1,
			renderCell: (params) => <span>{formatDateTime(params.value)}</span>,
		},
		{
			field: "status",
			headerName: "TRẠNG THÁI",
			width: 160,
			renderCell: (params) => <span>{flashSaleStatusLabel(params.value)}</span>,
		},
		{
			field: "action",
			headerName: "HÀNH ĐỘNG",
			width: 140,
			sortable: false,
			filterable: false,
			renderCell: (params) => {
				const flashSale = params.row as FlashSaleModel;
				return (
					<div>
						<Tooltip title={"Sửa"}>
							<IconButton
								size="small"
								color="primary"
								onClick={(e) => {
									e.stopPropagation();
									props.onEditFlashSale?.(flashSale);
								}}
							>
								<EditOutlinedIcon fontSize="small" />
							</IconButton>
						</Tooltip>

						<Tooltip title={"Xoá"}>
							<span>
								<IconButton
									size="small"
									color="error"
									disabled={!props.onDeleteFlashSale}
									onClick={(e) => {
										e.stopPropagation();
										props.onDeleteFlashSale?.(flashSale);
									}}
								>
									<DeleteOutlineOutlinedIcon fontSize="small" />
								</IconButton>
							</span>
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
		<DataTable
			columns={columns}
			rows={rows}
			onRowClick={(params: any) => {
				const id = Number(params?.row?.flashSaleId ?? params?.row?.id);
				if (Number.isFinite(id) && id > 0) {
					props.onSelectFlashSaleId?.(id);
				}
			}}
		/>
	);
};
