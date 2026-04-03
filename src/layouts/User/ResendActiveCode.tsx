import React, { FormEvent, useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useScrollToTop from "../../hooks/ScrollToTop";
import { endpointBE } from "../utils/Constant";
import { useAuth } from "../utils/AuthContext";

export const ResendActiveCode: React.FC = () => {
	useScrollToTop();

	const { isLoggedIn } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");

	useEffect(() => {
		if (isLoggedIn) {
			navigate("/");
		}
	}, [isLoggedIn, navigate]);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const promise = fetch(endpointBE + "/user/resend-activation-code", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email: email.trim() }),
		});

		toast.promise(
			promise.then(async (response) => {
				const data = await response.json();
				if (!response.ok) {
					throw new Error(data.message);
				}

				setEmail("");
				navigate("/dangnhap");
				return data.message || "Đã gửi lại mã kích hoạt";
			}),
			{
				pending: "Đang gửi lại mã kích hoạt...",
				success: "Đã gửi lại mã kích hoạt. Vui lòng kiểm tra email!",
				error: {
					render({ data }) {
						return (data as Error).message;
					},
				},
			}
		);
	};

	return (
		<div
			className='container my-5 py-4 rounded-5 shadow-5 bg-light w-100'
			style={{ maxWidth: "450px" }}
		>
			<h1 className='text-center'>GỬI LẠI MÃ KÍCH HOẠT</h1>
			<form
				onSubmit={handleSubmit}
				className='form'
				style={{ width: "100%" }}
			>
				<TextField
					fullWidth
					required={true}
					id='outlined-required'
					type='email'
					label='Email'
					placeholder='Nhập email đã đăng ký'
					value={email}
					onChange={(e: any) => setEmail(e.target.value)}
					className='input-field'
				/>
				<div className='text-center my-3'>
					<Button
						fullWidth
						variant='outlined'
						type='submit'
						sx={{ padding: "10px" }}
					>
						Gửi lại mã kích hoạt
					</Button>
				</div>
			</form>

			<div className='d-flex justify-content-end mt-2'>
				<Link to='/dangnhap'>Quay lại đăng nhập</Link>
			</div>
		</div>
	);
};