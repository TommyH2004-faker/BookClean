import { Box, Button, Link as MuiLink, TextField } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import React, { FormEvent, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { endpointBE } from "../utils/Constant";
import { useAuth } from "../utils/AuthContext";

import useScrollToTop from "../../hooks/ScrollToTop";
import { JwtPayload } from "../Admin/RequireAdmin";
import CartItemModel from "../../models/CartItemModel";

import { toast } from "react-toastify";
import { getCartAllByIdUser } from "../../api/CartApi";
import { useCartItem } from "../utils/CartItemContext";

    const DangNhap: React.FC = () => {
    useScrollToTop();

    const { setTotalCart, setCartList } = useCartItem();
    const navigation = useNavigate();
    const { isLoggedIn, setLoggedIn } = useAuth();

    useEffect(() => {
        if (isLoggedIn) {
            navigation("/");
        }
    }, [isLoggedIn, navigation]);

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            const loginRequest = {
                name: name.trim(),
                password: password.trim(),
            };

            const response = await fetch(endpointBE + "/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginRequest),
            });

            //  lỗi từ BE
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const result = await response.json();

            //  check structure API
            if (!result.success || !result.data?.token) {
                throw new Error("API trả về không hợp lệ");
            }

            const { token } = result.data;

            // decode token
            const decodedToken = jwtDecode<JwtPayload>(token);

            //  lưu token
            localStorage.setItem("token", token);
            // localStorage.setItem("refreshToken", refreshToken);

            setLoggedIn(true);
            toast.success("Đăng nhập thành công!");

            //  xử lý cart local → server
            let cart: CartItemModel[] = JSON.parse(localStorage.getItem("cart") || "[]");

            if (cart.length > 0) {
                const cartTo = cart.map((c) => ({
                    idUser: decodedToken.sub,
                    book:c.book.idBook,
                    quantity: c.quantity,
                }));

                await fetch(endpointBE + "/cart-item/add-item", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(cartTo),
                });
            }

            //  load lại cart từ server
            const cartFromServer = await getCartAllByIdUser();

            localStorage.setItem("cart", JSON.stringify(cartFromServer));
            setTotalCart(cartFromServer.length);
            setCartList(cartFromServer);

            //  redirect theo role
            if (decodedToken.role === "ADMIN") {
                navigation("/admin/dashboard");
            } else {
                navigation("/");
            }

        } catch (error: any) {
            const message = error.message || "Đăng nhập thất bại";
            toast.warning(message);
        }
    }

    return (
        <div
            className='container my-5 py-4 rounded-5 shadow-5 bg-light'
            style={{ width: "450px" }}
        >
            <h1 className='text-center'>ĐĂNG NHẬP</h1>

            {error && <p className='text-danger text-center'>{error}</p>}

            <form onSubmit={handleSubmit} style={{ padding: "0 20px" }}>
                <TextField
                    fullWidth
                    required
                    label='Tên đăng nhập'
                    placeholder='Nhập tên đăng nhập'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='mb-3'
                />

                <TextField
                    fullWidth
                    required
                    type='password'
                    label='Mật khẩu'
                    placeholder='Nhập mật khẩu'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='mb-3'
                />

                <div className='d-flex justify-content-end mb-2'>
                    <span>
                        Bạn chưa có tài khoản?{" "}
                        <MuiLink
                            component={RouterLink}
                            to='/dangKy'
                            underline='hover'
                        >
                            Đăng ký
                        </MuiLink>
                    </span>
                </div>

                <Button
                    fullWidth
                    variant='outlined'
                    type='submit'
                    sx={{ padding: "10px" }}
                >
                    Đăng nhập
                </Button>
            </form>

            <Box
                sx={{
                    px: "20px",
                    mt: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <MuiLink
                    component={RouterLink}
                    to='/resend-active-code'
                    underline='hover'
                    sx={{ fontWeight: 400 }}
                >
                    Gửi lại mã kích hoạt
                </MuiLink>

                <MuiLink
                    component={RouterLink}
                    to='/forgot-password'
                    underline='hover'
                >
                    Quên mật khẩu
                </MuiLink>
            </Box>
        </div>
    );
    };

export default DangNhap;