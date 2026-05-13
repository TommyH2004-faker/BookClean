import { Button } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import useScrollToTop from "../../hooks/ScrollToTop";

export const CheckoutFail = () => {
	useScrollToTop();

	return (
		<div className='container-fluid container bg-light my-3 rounded-3 p-3 p-md-5'>
			<div className='d-flex align-items-center justify-content-center flex-column p-3 p-md-5 text-center'>
				<img
					src='https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png'
					alt='fail'
					style={{ width: "150px", maxWidth: "100%", height: "auto" }}
				/>
				<h2 className='my-3 text-danger'>
					Đơn hàng của bạn xử lý thất bại
				</h2>
				<Link to={"/search"}>
					<Button variant='contained' className='my-3'>
						Tiếp tục mua sắm
					</Button>
				</Link>
			</div>
		</div>
	);
};
export default CheckoutFail;