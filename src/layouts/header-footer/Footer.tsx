import React, { useState } from "react";
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

function Footer() {
    const year = new Date().getFullYear();
    const [email, setEmail] = useState("");

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setEmail("");
    };

    return (
        <Box
            component='footer'
            sx={{
                borderTop: 1,
                borderColor: "divider",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "stretch",
            }}
        >
            <Container
                maxWidth='lg'
                sx={{
                    py: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                <Grid container spacing={1.5}>
                    <Grid item xs={12} md={4}>
                        <Typography variant='subtitle2' fontWeight={700}>
                            Minh Hiệp Book
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                            Xã Yên Bình, Huyện Vĩnh Tường, Tỉnh Vĩnh Phúc
                        </Typography>
                        <Typography variant='caption' color='text.secondary' display='block'>
                            Hotline: 0813535314
                        </Typography>
                        <Stack direction='row' spacing={0.5} sx={{ mt: 0.5 }}>
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
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 0.5 }}>
                            Liên kết nhanh
                        </Typography>
                        <Stack direction='row' spacing={2}>
                            <Stack spacing={0.25}>
                                <Typography
                                    component={RouterLink}
                                    to='/'
                                    color='text.secondary'
                                    variant='caption'
                                    sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                                >
                                    Trang chủ
                                </Typography>
                                <Typography
                                    component={RouterLink}
                                    to='/about'
                                    color='text.secondary'
                                    variant='caption'
                                    sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                                >
                                    Giới thiệu
                                </Typography>
                                <Typography
                                    component={RouterLink}
                                    to='/policy'
                                    color='text.secondary'
                                    variant='caption'
                                    sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                                >
                                    Chính sách
                                </Typography>
                            </Stack>

                            <Stack spacing={0.25}>
                                <Typography
                                    component={RouterLink}
                                    to='/cart'
                                    color='text.secondary'
                                    variant='caption'
                                    sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                                >
                                    Giỏ hàng
                                </Typography>
                                <Typography
                                    component={RouterLink}
                                    to='/my-favorite-books'
                                    color='text.secondary'
                                    variant='caption'
                                    sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                                >
                                    Yêu thích
                                </Typography>
                                <Typography
                                    component={RouterLink}
                                    to='/feedback'
                                    color='text.secondary'
                                    variant='caption'
                                    sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                                >
                                    Feedback
                                </Typography>
                            </Stack>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Box component='form' onSubmit={onSubmit} noValidate>
                            <Typography variant='subtitle2' fontWeight={700}>
                                Nhận tin mới
                            </Typography>
                            <Typography variant='caption' color='text.secondary' sx={{ display: "block", mb: 0.5 }}>
                                Nhập email để nhận ưu đãi.
                            </Typography>
                            <Stack direction='row' spacing={1}>
                                <TextField
                                    size='small'
                                    fullWidth
                                    type='email'
                                    label='Email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete='email'
                                />
                                <Button size='small' type='submit' variant='contained' sx={{ whiteSpace: "nowrap" }}>
                                    Đăng ký
                                </Button>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 0.75 }} />

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={0.5}
                    justifyContent='space-between'
                    alignItems={{ xs: "flex-start", sm: "center" }}
                >
                    <Typography variant='caption' color='text.secondary'>
                        © {year} Minh Hiệp Book. All rights reserved.
                    </Typography>
                    <Typography
                        component={RouterLink}
                        to='/policy'
                        color='text.secondary'
                        variant='caption'
                        sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                    >
                        Điều khoản & Bảo mật
                    </Typography>
                </Stack>
            </Container>
        </Box>
    );
}

export default Footer;