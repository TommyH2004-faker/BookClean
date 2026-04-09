import { VisibilityOutlined } from "@mui/icons-material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
	Box,
	Chip,
	CircularProgress,
	IconButton,
	Tooltip,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import {getAllOrders, getMyOrders} from "../../../../api/OrderApi";
import OrderModel from "../../../../models/OrderModel";
import {DataTable} from "../../../utils/DataTable";
import { getRoleByToken } from "../../../utils/JwtService";


interface OrderTableProps {
	setId: any;
	setOption: any;
	handleOpenModal: any;
	setKeyCountReload?: any;
	keyCountReload?: any;
}

export const OrderTable: React.FC<OrderTableProps> = (props) => {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<OrderModel[]>([]);
	useEffect(() => {
	const fetchData = async () => {
		try {
			setLoading(true);

			const role = getRoleByToken() || [];

			let ordersData: OrderModel[] = [];

			if (role.includes("ADMIN")) {
				ordersData = await getAllOrders();
			} else {
				ordersData = await getMyOrders();
			}

			const orders = ordersData
				.map((order: OrderModel) => ({
					...order,
					id: order.idOrder,
					nameCustomer: order.fullName,
				}))
				.sort((a, b) => b.idOrder - a.idOrder);

			setData(orders);
		} catch (error) {
			console.error("Lỗi lấy đơn hàng:", error);
		} finally {
			setLoading(false);
		}
	};

	fetchData();
}, [props.keyCountReload]);

	const columns: GridColDef[] = [
		{ field: "id", headerName: "ID", width: 80 },
		{ field: "nameCustomer", headerName: "TÊN KHÁCH HÀNG", width: 200 },
		{ field: "dateCreated", headerName: "NGÀY TẠO", width: 100 },
		{
			field: "totalPriceProduct",
			headerName: "TỔNG TIỀN",
			width: 120,
			renderCell: (params) => {
				return (
					<>{Number.parseInt(params.value).toLocaleString("vi-vn")} đ</>
				);
			},
		},
		{
			field: "status",
			headerName: "TRẠNG THÁI",
			width: 150,
			renderCell: (params) => {
				return (
					<Chip
						label={params.value}
						color={
							params.value === "Thành công"
								? "success"
								: params.value === "Đang xử lý"
								? "info"
								: params.value === "Đang giao hàng"
								? "warning"
								: "error"
						}
						variant='outlined'
					/>
				);
			},
		},
		{ field: "payment", headerName: "THANH TOÁN", width: 150 },
		{
			field: "action",
			headerName: "HÀNH ĐỘNG",
			width: 200,
			type: "actions",
			renderCell: (item) => {
				return (
					<div>
						<Tooltip title={"Xem chi tiết"}>
							<IconButton
								color='secondary'
								onClick={() => {
									props.setOption("view");
									props.setId(item.id);
									props.handleOpenModal();
								}}
							>
								<VisibilityOutlined />
							</IconButton>
						</Tooltip>
						<Tooltip title={"Chỉnh sửa"}>
							<IconButton
								color='primary'
								onClick={() => {
									props.setOption("update");
									props.setId(item.id);
									props.handleOpenModal();
								}}
							>
								<EditOutlinedIcon />
							</IconButton>
						</Tooltip>
					</div>
				);
			},
		},
	];

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}
	return <DataTable columns={columns} rows={data} />;
};
