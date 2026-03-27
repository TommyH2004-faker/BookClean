import { Box, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";

import { toast } from "react-toastify";

import CheckIcon from "@mui/icons-material/Check";
import { VisibilityOutlined } from "@mui/icons-material";
import FeedbackModel from "../../../../models/FeedbackModel";
import {endpointBE} from "../../../utils/Constant";

import {DataTable} from "../../../utils/DataTable";
import {getAllFeedback} from "../../../../api/FeedBackAPI";


export const FeedbackTable: React.FC = (props) => {
	const [loading, setLoading] = useState(true);

	// Tạo biến để lấy tất cả data
	const [data, setData] = useState<FeedbackModel[]>([]);
	const [reload, setReload] = useState(false);

	useEffect(() => {
		getAllFeedback().then((response) => {
			console.log("Feedback data from API:", response);
			const feedbacks = response.map((feedback: any) => ({
				...feedback,
				id: feedback.idFeedback,
				readed: feedback.isReaded,
			}));
			setData(feedbacks);
			setLoading(false);
		});
	}, [reload]);

	const handleChangeIsReaded = (idFeedback: any) => {
		const token = localStorage.getItem("token");

		const tmp = data.filter((feedback) => feedback.idFeedback === idFeedback);
		if (tmp.length > 0 && tmp[0].readed === true) {
			toast.warning("Feedback này đã duyệt rồi");
			return;
		}

		toast.promise(
			fetch(endpointBE + `/feedback/update-feedback/${idFeedback}`, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
				.then((response) => {
					if (response.ok) {
						toast.success("Duyệt thành công");
						setReload(!reload);
					} else {
						toast.error("Lỗi khi duyệt");
					}
				})
				.catch((error) => {
					toast.error("Lỗi khi duyệt");
					console.log(error);
				}),
			{ pending: "Đang trong quá trình xử lý ..." }
		);
	};

	const columns: GridColDef[] = [
		{ field: "id", headerName: "ID", width: 50 },
		{ field: "title", headerName: "TIÊU ĐỀ", width: 150 },
		{ field: "comment", headerName: "NHẬN XÉT", width: 300 },
		{ field: "dateCreated", headerName: "NGÀY TẠO", width: 100 },
		{ field: "username", headerName: "NGƯỜI DÙNG", width: 100 },
		{
			field: "readed",
			headerName: "ĐÃ ĐỌC",
			width: 100,
			renderCell: (params) => {
				return params.value === true ? (
					<Tooltip title='Đã đọc'>
						<CheckIcon color='success' />
					</Tooltip>
				) : (
					""
				);
			}
		// 	renderCell: (params) => {
		// 	return Boolean(params.value) ? (
		// 		<Tooltip title='Đã đọc'>
		// 			<CheckIcon color='success' />
		// 		</Tooltip>
		// 	) : null;
		// }
		,
		},
		{
			field: "action",
			headerName: "HÀNH ĐỘNG",
			width: 120,
			type: "actions",
			renderCell: (item) => {
				return (
					<div>
						<Tooltip title={"Duyệt"}>
							<IconButton
								color='secondary'
								onClick={

									() => handleChangeIsReaded(item.id)}
							>
								<VisibilityOutlined />
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
