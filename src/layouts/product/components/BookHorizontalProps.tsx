
import React, { useEffect, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import TextEllipsis from "./text-ellipsis/TextEllipsis";
import { Button, Chip } from "@mui/material";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import DoneIcon from "@mui/icons-material/Done";
import { FadeModal } from "../../utils/FadeModal";

import { Link } from "react-router-dom";
import { ReviewForm } from "./review/ReviewForm";
import CartItemModel from "../../../models/CartItemModel";
import ImageModel from "../../../models/ImageModel";
import { layToanBoHinhAnhMotSach } from "../../../api/HinhAnhAPI";

interface BookHorizontalProps {
	cartItem: CartItemModel;
	type?: any;
	idOrder?: number;
	handleCloseModalOrderDetail?: any;
	statusOrder?: string;
}

export const BookHorizontal: React.FC<BookHorizontalProps> = (props) => {
	// ================= MODAL =================
	const [openModal, setOpenModal] = useState(false);
	const [mode, setMode] = useState<"create" | "view">("create");

	const handleOpenModal = (type: "create" | "view") => {
		setMode(type);
		setOpenModal(true);
	};

	const handleCloseModal = () => setOpenModal(false);

	// ================= STATE =================
	const [cartItem, setCartItem] = useState<CartItemModel>(props.cartItem);
	const [imageList, setImageList] = useState<ImageModel[]>([]);
	const bookId = props.cartItem?.book?.idBook;

	// ================= LOAD IMAGE =================
	useEffect(() => {
		if (!bookId) return;

		layToanBoHinhAnhMotSach(bookId)
			.then((response) => setImageList(response))
			.catch((error) => console.log(error));
	}, [bookId]);

	// ================= IMAGE =================
	let dataImage = "";

	const displayPrice =
    props.type === "order"
        ? (props.cartItem.price ?? 0)
        : props.cartItem.book.sellPrice;

	if (imageList.length > 0) {
		const thumbnail = imageList.find((i) => i.isThumbnail);
		dataImage = thumbnail?.url || thumbnail?.data || "";
	}

	return (
		<div className='row'>
			{/* ================= BOOK INFO ================= */}
			<div className='col'>
				<div className='d-flex'>
					<img
						src={dataImage}
						className='card-img-top'
						alt={props.cartItem.book.nameBook}
						style={{ width: "100px" }}
					/>

					<div className='d-flex flex-column pb-2'>
						<Tooltip title={props.cartItem.book.nameBook} arrow>
							<Link
								to={`/book/${props.cartItem.book.idBook}`}
								className='d-inline text-black'
							>
								<TextEllipsis
									text={props.cartItem.book.nameBook + " "}
									limit={100}
								/>
							</Link>
						</Tooltip>

						<div className='mt-auto'>
							<span className='discounted-price text-danger'>
								<strong style={{ fontSize: "22px" }}>
									{displayPrice.toLocaleString()}đ
								</strong>
							</span>

							<span
								className='original-price ms-3 small'
								style={{ color: "#000" }}
							>
								<del>
									{props.cartItem.book.listPrice.toLocaleString()}đ
								</del>
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* ================= QUANTITY ================= */}
			<div className='col-2 text-center'>
				<strong>{props.cartItem.quantity}</strong>
			</div>

			{/* ================= TOTAL ================= */}
			<div className='col-2 text-center'>
				<span className='text-danger'>
					<strong>
						{
			(props.cartItem.quantity * displayPrice).toLocaleString()
						}
						đ
					</strong>
				</span>
			</div>

			{/* ================= REVIEW ================= */}
			{props.type === "view-customer" &&
				props.statusOrder === "Thành công" && (
					<div className='d-flex flex-row-reverse mt-2'>
						{cartItem.review === false ? (
							<Button
								variant='outlined'
								size='small'
								startIcon={<RateReviewRoundedIcon />}
								style={{ width: "150px" }}
								onClick={() => handleOpenModal("create")}
							>
								Viết đánh giá
							</Button>
						) : (
							<>
								<Button
									className='mx-3'
									variant='outlined'
									size='small'
									startIcon={<RateReviewRoundedIcon />}
									style={{ width: "150px" }}
									onClick={() => handleOpenModal("view")}
								>
									Xem đánh giá
								</Button>

								<Chip
									color='primary'
									label='Bạn đã đánh giá sản phẩm này rồi'
									icon={<DoneIcon />}
								/>
							</>
						)}

						{/* ================= MODAL ================= */}
						<FadeModal
							open={openModal}
							handleOpen={() => {}}
							handleClose={handleCloseModal}
						>
							<ReviewForm
								mode={mode} // 🔥 quan trọng
								idOrder={props.idOrder || 0}
								idBook={props.cartItem.book.idBook}
								handleCloseModal={handleCloseModal}
								handleCloseModalOrderDetail={
									props.handleCloseModalOrderDetail
								}
								cartItem={cartItem}
								setCartItem={setCartItem}
							/>
						</FadeModal>
					</div>
				)}

			<hr className='mt-3' />
		</div>
	);
};
