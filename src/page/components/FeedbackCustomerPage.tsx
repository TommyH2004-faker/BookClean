import { Box, Button, TextField } from "@mui/material";
import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import useScrollToTop from "../../hooks/ScrollToTop";
import { useAuth } from "../../layouts/utils/AuthContext";
import { endpointBE } from "../../layouts/utils/Constant";

// ✅ Request model đúng với BE
interface CreateFeedbackRequest {
    title: string;
    comment: string;
}
interface ApiResponse {
    message?: string;
}
export const FeedbackCustomerPage: React.FC = () => {
    useScrollToTop();

    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // ✅ State chỉ giữ dữ liệu cần gửi
    const [feedback, setFeedback] = useState<CreateFeedbackRequest>({
        title: "",
        comment: "",
    });

    // ✅ Check login
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/dangnhap");
        }
    }, [isLoggedIn, navigate]);

    // ✅ Submit form
    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Bạn chưa đăng nhập");
            return;
        }

        // validate đơn giản
        if (!feedback.title.trim() || !feedback.comment.trim()) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        toast.promise(
            fetch(endpointBE + "/feedback/add-feedback", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: feedback.title,
                    comment: feedback.comment,
                }),
            })
                .then(async (response) => {
                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || "Gửi phản hồi thất bại");
                    }

                    // reset form
                    setFeedback({
                        title: "",
                        comment: "",
                    });

                    return data.message;
                }),
            {
                pending: "Đang gửi phản hồi...",
                success: {
                    render({ data }) {
                        return data || "Gửi phản hồi thành công";
                    },
                },
                error: {
				render({ data }) {
				return (data as ApiResponse)?.message || "Có lỗi xảy ra";
				},
			}
		}
	);
}

    //  nếu chưa login thì không render
    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className='container-book container bg-light my-3 py-3 px-5'>
            <h3 className='text-center m-3'>NHẬN XÉT VỀ CHÚNG TÔI</h3>

            <div className='d-flex align-items-center justify-content-center'>
                <div className='w-50'>
                    <form className='form' onSubmit={handleSubmit}>
                        <Box sx={{ "& .MuiTextField-root": { mb: 3 } }}>
                            
                            <TextField
                                required
                                label='Tiêu đề'
                                fullWidth
                                value={feedback.title}
                                onChange={(e) =>
                                    setFeedback({
                                        ...feedback,
                                        title: e.target.value,
                                    })
                                }
                                size='small'
                            />

                            <TextField
                                required
                                label='Nội dung'
                                fullWidth
                                multiline
                                maxRows={4}
                                value={feedback.comment}
                                onChange={(e) =>
                                    setFeedback({
                                        ...feedback,
                                        comment: e.target.value,
                                    })
                                }
                                size='small'
                            />

                            <Button
                                className='w-100 my-3'
                                type='submit'
                                variant='outlined'
                                sx={{ padding: "10px" }}
                            >
                                Gửi
                            </Button>
                        </Box>
                    </form>
                </div>
            </div>
        </div>
    );
};