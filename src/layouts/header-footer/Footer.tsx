import React from "react";
import {
    Box,
    Container,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import { Link as RouterLink } from "react-router-dom";

function Footer() {
    const year = new Date().getFullYear();

    return (
        <Box component='footer' sx={{ borderTop: 1, borderColor: "divider" }}>
            <Container maxWidth='lg' sx={{ py: 0.75 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    justifyContent='space-between'
                    alignItems={{ xs: "flex-start", sm: "center" }}
                >
                    <Typography variant='caption' color='text.secondary'>
                        © {year} Minh Hiệp Book
                    </Typography>

                    <Stack direction='row' spacing={1.5} alignItems='center' sx={{ flexWrap: "wrap" }}>
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

                    <Stack direction='row' spacing={0.5}>
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
            </Container>
        </Box>
    );
}

export default Footer;