import React, { useState } from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { Box, FormControl, InputLabel, MenuItem, Select, Tab, Tabs } from "@mui/material";
import { useConfirm } from "material-ui-confirm";

import RequireAdmin from "./RequireAdmin";
import { FadeModal } from "../utils/FadeModal";
import {
	FlashSaleForm,
	type FlashSaleFormOption,
} from "./component/flashsale/FlashSaleForm";
import { FlashSaleTable } from "./component/flashsale/FlashSaleTable";
import { FlashSaleEventTable } from "./component/flashsale/FlashSaleEventTable";
import { toast } from "react-toastify";
import {
	deleteFlashSale,
	getFlashSales,
} from "../../api/FlashSaleApi";
import type { FlashSaleModel } from "../../models/FlashSaleModel";
import { FlashSaleStatus } from "../../models/FlashSaleModel";

const FlashSaleManagement: React.FC = () => {
	const [tabIndex, setTabIndex] = useState(0);
	const [eventsReloadKey, setEventsReloadKey] = useState(0);
	const [itemsReloadKey, setItemsReloadKey] = useState(0);
	const [option, setOption] = useState<FlashSaleFormOption>("create");
	const [openModal, setOpenModal] = React.useState(false);
	const [selectedFlashSaleId, setSelectedFlashSaleId] = useState<number | null>(null);
	const [itemFilterFlashSaleId, setItemFilterFlashSaleId] = useState<number | null>(null);
	const [activeFlashSales, setActiveFlashSales] = useState<FlashSaleModel[]>([]);
	const [editingFlashSale, setEditingFlashSale] = useState<FlashSaleModel | null>(null);
	const confirm = useConfirm();

	const handleOpenModal = () => setOpenModal(true);
	const handleCloseModal = () => setOpenModal(false);

	const bumpReloadAll = () => {
		setEventsReloadKey(Math.random());
		setItemsReloadKey(Math.random());
	};

	React.useEffect(() => {
		let cancelled = false;
		getFlashSales()
			.then((data) => {
				if (cancelled) return;
				const list = Array.isArray(data) ? data : [];
				setActiveFlashSales(
					list.filter((fs) => Number(fs?.status) === FlashSaleStatus.Active)
				);
			})
			.catch(() => {
				if (cancelled) return;
				setActiveFlashSales([]);
			});

		return () => {
			cancelled = true;
		};
	}, [eventsReloadKey]);

	return (
		<div className="conatiner p-5">
			<div className="shadow-4-strong rounded p-5">
				<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
					<Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
						<Tab label="Sự kiện" />
						<Tab label="Sản phẩm sale" />
					</Tabs>
				</Box>

				{tabIndex === 0 && (
					<div className="mt-3">
						<div className="d-flex flex-wrap gap-2 mb-3">
							<Button
								variant="contained"
								color="success"
								onClick={() => {
									setOption("create");
									setEditingFlashSale(null);
									handleOpenModal();
								}}
								startIcon={<AddIcon />}
							>
								Tạo sự kiện
							</Button>
						</div>

						<FlashSaleEventTable
							keyCountReload={eventsReloadKey}
							selectedFlashSaleId={selectedFlashSaleId}
							onSelectFlashSaleId={(id) => {
								setSelectedFlashSaleId(id);
							}}
							onEditFlashSale={(fs) => {
								const id = Number(fs?.id);
								if (Number.isFinite(id) && id > 0) {
									setSelectedFlashSaleId(id);
								}
								setEditingFlashSale(fs);
								setOption("edit");
								handleOpenModal();
							}}
							onDeleteFlashSale={(fs) => {
								const id = Number(fs?.id);
								if (!Number.isFinite(id) || id <= 0) {
									toast.error("Không xác định được FlashSaleId");
									return;
								}

								confirm({
									title: "Xoá Flash Sale",
									description: `Bạn chắc chắn muốn xoá sự kiện “${fs?.name ?? ""}” chứ?`,
									confirmationText: ["Xoá"],
									cancellationText: ["Huỷ"],
								})
									.then(async () => {
										try {
											await deleteFlashSale(id);
											toast.success("Xoá Flash Sale thành công");
											if (selectedFlashSaleId === id) {
												setSelectedFlashSaleId(null);
											}
											bumpReloadAll();
										} catch (err: any) {
											toast.error(err?.message || "Xoá Flash Sale thất bại");
										}
									})
									.catch(() => {});
							}}
						/>
					</div>
				)}

				{tabIndex === 1 && (
					<div className="mt-3">
						<div className="d-flex flex-wrap gap-2 mb-3">
							<Button
								variant="contained"
								color="primary"
								onClick={() => {
									setOption("addItem");
									setEditingFlashSale(null);
									handleOpenModal();
								}}
								startIcon={<AddShoppingCartIcon />}
							>
								Thêm sản phẩm sale
							</Button>
						</div>

						<div className="d-flex flex-wrap align-items-center gap-2 mb-3">
							<FormControl size="small" sx={{ minWidth: 260 }}>
								<InputLabel id="flash-sale-filter-label">Lọc theo sự kiện</InputLabel>
								<Select
									labelId="flash-sale-filter-label"
									value={itemFilterFlashSaleId === null ? "all" : String(itemFilterFlashSaleId)}
									label="Lọc theo sự kiện"
									onChange={(e) => {
										const value = e.target.value;
										setItemFilterFlashSaleId(value === "all" ? null : Number(value));
										setSelectedFlashSaleId(value === "all" ? null : Number(value));
									}}
								>
									<MenuItem value="all">None</MenuItem>
									{activeFlashSales.map((fs) => (
										<MenuItem key={fs.id} value={String(fs.id)}>
											{fs.name || `(Sự kiện #${fs.id})`}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</div>

						{!selectedFlashSaleId ? (
							<div className="text-body-secondary">
								Bấm “Thêm sản phẩm sale” để chọn chương trình Flash Sale trong form, hoặc dùng bộ lọc bên trên.
							</div>
						) : null}

						<FlashSaleTable
							keyCountReload={itemsReloadKey}
							flashSaleId={itemFilterFlashSaleId}
							onChanged={() => setItemsReloadKey(Math.random())}
						/>
					</div>
				)}
			</div>

			<FadeModal open={openModal} handleOpen={handleOpenModal} handleClose={handleCloseModal}>
				<FlashSaleForm
					option={option}
					flashSaleId={selectedFlashSaleId ?? undefined}
					flashSale={editingFlashSale}
					onCreatedFlashSale={(id) => setSelectedFlashSaleId(id)}
					onSelectedFlashSaleId={(id) => setSelectedFlashSaleId(id)}
					handleCloseModal={handleCloseModal}
					onChanged={bumpReloadAll}
				/>
			</FadeModal>
		</div>
	);
};

const FlashSaleManagementPage = RequireAdmin(FlashSaleManagement);
export default FlashSaleManagementPage;
