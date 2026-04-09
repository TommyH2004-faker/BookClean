import React, { useMemo, useState } from "react";
import {
    Box,
    Button,
    Container,
    Divider,
    Grid,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import { Link as RouterLink } from "react-router-dom";

type FooterLink = { label: string; to: string };

function Footer() {
    const [email, setEmail] = useState("");

    const columns = useMemo(
        () =>
            [
                {
                    title: "Liên kết",
                    links: [
                        { label: "Trang chủ", to: "/" },
                        { label: "Giới thiệu", to: "/about" },
                        { label: "Chính sách", to: "/policy" },
                        { label: "Giỏ hàng", to: "/cart" },
                    ] satisfies FooterLink[],
                },
                {
                    title: "Tài khoản",
                    links: [
                        { label: "Đăng nhập", to: "/dangnhap" },
                        { label: "Đăng ký", to: "/dangky" },
                        { label: "Sách yêu thích", to: "/my-favorite-books" },
                        { label: "Feedback", to: "/feedback" },
                    ] satisfies FooterLink[],
                },
                {
                    title: "Hỗ trợ",
                    links: [
                        { label: "Tìm sách", to: "/search" },
                        { label: "Kích hoạt tài khoản", to: "/activate" },
                        { label: "Gửi lại mã kích hoạt", to: "/resend-active-code" },
                        { label: "Quên mật khẩu", to: "/forgot-password" },
                    ] satisfies FooterLink[],
                },
            ] as const,
        []
    );

    const year = new Date().getFullYear();

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setEmail("");
    };

    return (
        <Box component='footer' sx={{ borderTop: 1, borderColor: "divider" }}>
            <Container maxWidth='lg' sx={{ py: { xs: 4, md: 6 } }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={3}>
                        <Stack spacing={1.25}>
                            <Typography variant='h6' fontWeight={700}>
                                Minh Hiệp Book
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                Xã Yên Bình, Huyện Vĩnh Tường, Tỉnh Vĩnh Phúc
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                Hotline: 0813535314
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                Email: hiept81331@gmail.com
                            </Typography>

                            <Stack direction='row' spacing={1} sx={{ pt: 1 }}>
                                <IconButton aria-label='Facebook' size='small'>
                                    <FacebookIcon fontSize='inherit' />
                                </IconButton>
                                <IconButton aria-label='Instagram' size='small'>
                                    <InstagramIcon fontSize='inherit' />
                                </IconButton>
                                <IconButton aria-label='Twitter' size='small'>
                                    <TwitterIcon fontSize='inherit' />
                                </IconButton>
                            </Stack>
                        </Stack>
                    </Grid>

                    {columns.map((col) => (
                        <Grid key={col.title} item xs={12} sm={4} md={2}>
                            <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 1 }}>
                                {col.title}
                            </Typography>
                            <Stack spacing={0.75}>
                                {col.links.map((link) => (
                                    <Typography
                                        key={link.to}
                                        component={RouterLink}
                                        to={link.to}
                                        color='text.secondary'
                                        variant='body2'
                                        sx={{ width: "fit-content", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                                    >
                                        {link.label}
                                    </Typography>
                                ))}
                            </Stack>
                        </Grid>
                    ))}

                    <Grid item xs={12} md={3}>
                        <Box component='form' onSubmit={onSubmit} noValidate>
                            <Typography variant='subtitle1' fontWeight={700}>
                                Nhận tin mới
                            </Typography>
                            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5, mb: 1.5 }}>
                                Nhập email để nhận thông báo sách mới và ưu đãi.
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                                <TextField
                                    size='small'
                                    fullWidth
                                    type='email'
                                    label='Email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete='email'
                                />
                                <Button type='submit' variant='contained' sx={{ whiteSpace: "nowrap" }}>
                                    Đăng ký
                                </Button>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    justifyContent='space-between'
                    alignItems={{ xs: "flex-start", sm: "center" }}
                >
                    <Typography variant='body2' color='text.secondary'>
                        © {year} Minh Hiệp Book. All rights reserved.
                    </Typography>
                    <Stack direction='row' spacing={2}>
                        <Typography
                            component={RouterLink}
                            to='/policy'
                            color='text.secondary'
                            variant='body2'
                            sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                        >
                            Điều khoản
                        </Typography>
                        <Typography
                            component={RouterLink}
                            to='/policy'
                            color='text.secondary'
                            variant='body2'
                            sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                        >
                            Bảo mật
                        </Typography>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}

export default Footer;