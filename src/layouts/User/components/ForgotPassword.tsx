import React, {FormEvent, useEffect, useState} from "react";
import useScrollToTop from "../../../hooks/ScrollToTop";
import {useAuth} from "../../utils/AuthContext";
import {Link, useNavigate} from "react-router-dom";
import Button from "@mui/material/Button";
import {toast} from "react-toastify";
import {endpointBE} from "../../utils/Constant";
import {TextField} from "@mui/material";


export const ForgotPassword: React.FC = () => {
    useScrollToTop();

    const {isLoggedIn} = useAuth();
    const navigation = useNavigate();
    useEffect(() => {
        if (isLoggedIn) {
            navigation("/");
        }
    }, [isLoggedIn, navigation]);

    const [email, setEmail] = useState("");
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const promise = fetch(endpointBE + "/user/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        toast.promise(
            promise.then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message);
                }
                setEmail("");
                navigation("/dangnhap");
                return data.message;
            }),
            {
                pending: "Đang xử lý...",
                success: "Gửi thành công! Hãy kiểm tra email",
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
            className='container my-5 py-4 rounded-5 shadow-5 bg-light'
            style={{ width: "450px" }}
        >
            <h1 className='text-center'>QUÊN MẬT KHẨU</h1>
            <form
                onSubmit={handleSubmit}
                className='form'
                style={{ padding: "0 20px" }}
            >
                <TextField
                    fullWidth
                    required={true}
                    id='outlined-required'
                    label='Email'
                    placeholder='Nhập email'
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
                        Lấy lại mật khẩu
                    </Button>
                </div>
            </form>
            <div className='d-flex justify-content-end mt-2' style={{ padding: "0 20px" }}>
                <Link to='/dangnhap'>Quay lại đăng nhập</Link>
            </div>
        </div>
    );
}
