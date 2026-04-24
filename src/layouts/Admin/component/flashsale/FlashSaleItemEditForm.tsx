import React, { useState } from "react";
import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";

import type { FlashSaleItemModel } from "../../../../models/FlashSaleItemModel";
import { updateFlashSaleItem } from "../../../../api/FlashSaleApi";

interface FlashSaleItemEditFormProps {
	item: FlashSaleItemModel;
	onClose: () => void;
	onSaved?: () => void;
}

export const FlashSaleItemEditForm: React.FC<FlashSaleItemEditFormProps> = (props) => {
	const [submitting, setSubmitting] = useState(false);

	const flashSaleId = Number(props.item.flashSaleId);
	const itemId = Number(props.item.id);

	const [originalPrice, setOriginalPrice] = useState<number>(Number(props.item.originalPrice ?? 0));
	const [salePrice, setSalePrice] = useState<number>(Number(props.item.salePrice ?? 0));
	const [quantity, setQuantity] = useState<number>(Number(props.item.quantity ?? 0));
	const [maxPerUser, setMaxPerUser] = useState<number | "">(
		props.item.maxPerUser === null || props.item.maxPerUser === undefined
			? ""
			: Number(props.item.maxPerUser)
	);

	const title = props.item.bookName
		? `Sửa sản phẩm Flash Sale • ${props.item.bookName}`
		: "Sửa sản phẩm Flash Sale";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setSubmitting(true);

			if (!Number.isFinite(flashSaleId) || flashSaleId <= 0) throw new Error("FlashSaleId không hợp lệ");
			if (!Number.isFinite(itemId) || itemId <= 0) throw new Error("ItemId không hợp lệ");
			if (originalPrice <= 0 || salePrice <= 0) throw new Error("Giá phải > 0");
			if (quantity <= 0) throw new Error("Số lượng phải > 0");

			await updateFlashSaleItem({
				flashSaleId,
				itemId,
				originalPrice,
				salePrice,
				quantity,
				maxPerUser: maxPerUser === "" ? null : maxPerUser,
				rowVersion: props.item.rowVersion,
			});

			toast.success("Cập nhật FlashSaleItem thành công");
			props.onSaved?.();
			props.onClose();
		} catch (err: any) {
			toast.error(err?.message || "Cập nhật FlashSaleItem thất bại");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Box>
			<Typography variant="h6" fontWeight={700}>
				{title}
			</Typography>
			<Divider sx={{ my: 2 }} />

			<form onSubmit={handleSubmit}>
				<TextField
					label="Giá gốc"
					type="number"
					fullWidth
					value={originalPrice}
					onChange={(e) => setOriginalPrice(Number(e.target.value))}
					disabled={submitting}
					sx={{ mb: 2 }}
				/>

				<TextField
					label="Giá khuyến mãi"
					type="number"
					fullWidth
					value={salePrice}
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
					Lưu
				</Button>
			</form>
		</Box>
	);
};
