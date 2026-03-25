import { Box, Button, Link as MuiLink, TextField } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import React, { FormEvent, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { endpointBE } from "../utils/Constant";
import { useAuth } from "../utils/AuthContext";

import useScrollToTop from "../../hooks/ScrollToTop";
import { JwtPayload } from "../Admin/RequireAdmin";

import { toast } from "react-toastify";

import { useCartItem } from "../utils/CartItemContext";
import { getCartAllByIdUser } from "../../api/CartApi";
import CartItemModel from "../../models/CartItemModel";


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
            const roles = Array.isArray(decodedToken.role)
                ? decodedToken.role
                : [decodedToken.role];
            const isEnabled =
                decodedToken.enabled === true || decodedToken.enabled === "true";

            if (!isEnabled) {
                throw new Error("Tài khoản chưa kích hoạt hoặc bị vô hiệu hoá");
            }

            //  lưu token
            localStorage.setItem("token", token);
            // localStorage.setItem("refreshToken", refreshToken);

            setLoggedIn(true);
            toast.success("Đăng nhập thành công!");

            //  xử lý cart local → server
            // let cart: CartItemModel[] = JSON.parse(localStorage.getItem("cart") || "[]");

            // if (cart.length > 0) {
            //     const cartTo = cart.map((c) => ({
            //         idUser: decodedToken.sub,
            //         book:c.book.id ?? c.book.idBook,
            //         quantity: c.quantity,
            //     }));

            //     await fetch(endpointBE + "/cart-items/add-item", {
            //         method: "POST",
            //         headers: {
            //             Authorization: `Bearer ${token}`,
            //             "content-type": "application/json",
            //         },
            //         body: JSON.stringify(cartTo),
            //     });
            // }
            //  Lấy giỏ hàng local (guest cart) trước khi xoá
            const localCart: CartItemModel[] = JSON.parse(localStorage.getItem("cart") || "[]");

            // Merge cart local → server (nếu có)
            if (localCart.length > 0) {
                // Gửi từng item lên server theo format BE expect: { bookId, quantity }
                const mergeRequests = localCart.map((c) =>
                    fetch(endpointBE + "/cart-items/add-item", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            bookId: c.book.idBook ?? c.book.id,
                            quantity: c.quantity,
                        }),
                    }).catch((err) => console.error("Lỗi merge cart item:", err))
                );
                await Promise.all(mergeRequests);
                localStorage.removeItem("cart");
            }

            // Load lại giỏ hàng đầy đủ từ server (bao gồm cả items vừa merge)
            const cartFromServer = await getCartAllByIdUser();
            localStorage.setItem("cart", JSON.stringify(cartFromServer));
            setCartList(cartFromServer);
            setTotalCart(cartFromServer.length);

            //  redirect theo role
            if (roles.includes("ADMIN")) {
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