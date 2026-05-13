import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search } from "@mui/icons-material";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";

import { useCartItem } from "../utils/CartItemContext";
import { useAuth } from "../utils/AuthContext";

import {
    getIdUserByToken,
    getLastNameByToken,
    hasRole,
    isToken,
    logout,
} from "../utils/JwtService";

import GenreModel from "../../models/GenreModel";

import { getAllGenres } from "../../api/GenreApi";
import { get1User } from "../../api/UserApi";
import { getFlashSales } from "../../api/FlashSaleApi";

import {
    FlashSaleStatus,
    type FlashSaleModel,
} from "../../models/FlashSaleModel";

interface NavbarProps {
    tuKhoaTimKiem: string;
    setTuKhoaTimKiem: (tuKhoa: string) => void;
}

function Navbar({
    tuKhoaTimKiem,
    setTuKhoaTimKiem,
}: NavbarProps) {
    const [tuKhoaTamThoi, setTuKhoaTamThoi] = useState("");
    const [genreList, setGenreList] = useState<GenreModel[]>([]);
    const [flashSales, setFlashSales] = useState<FlashSaleModel[]>([]);
    const [avatar, setAvatar] = useState("");

    const { totalCart, setTotalCart, setCartList } = useCartItem();
    const { setLoggedIn } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        getAllGenres()
            .then((response) => {
                setGenreList(response.genreList);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    useEffect(() => {
        let cancelled = false;

        getFlashSales()
            .then((data) => {
                if (cancelled) return;

                const list = Array.isArray(data) ? data : [];
                setFlashSales(list);
            })
            .catch(() => {
                if (cancelled) return;
                setFlashSales([]);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        setTuKhoaTamThoi(tuKhoaTimKiem || "");
    }, [tuKhoaTimKiem]);

    useEffect(() => {
        if (isToken()) {
            const id = getIdUserByToken();

            get1User(id)
                .then((res) => {
                    setAvatar(res.avatar || "");
                })
                .catch((err) => console.log(err));
        }
    }, []);

    const onsearchInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTuKhoaTamThoi(event.target.value);
    };

    const handleSearch = () => {
        setTuKhoaTimKiem(tuKhoaTamThoi);

        if (location.pathname.startsWith("/search")) {
            navigate(
                `/search?keyword=${encodeURIComponent(
                    tuKhoaTamThoi
                )}`
            );
            return;
        }

        if (location.pathname !== "/") {
            navigate("/");
        }
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    const selectedFlashSaleId = useMemo(() => {
        if (!location.pathname.startsWith("/flash-sale")) {
            return null;
        }

        const params = new URLSearchParams(location.search);

        const raw =
            params.get("saleId") ??
            params.get("flashSaleId");

        const parsed = Number(raw);

        return Number.isFinite(parsed) && parsed > 0
            ? parsed
            : null;
    }, [location.pathname, location.search]);

    const flashSaleDropdownItems = useMemo(() => {
        const list = [...flashSales];

        list.sort((a, b) => {
            const statusA = Number(a?.status ?? 0);
            const statusB = Number(b?.status ?? 0);

            if (
                statusA === FlashSaleStatus.Active &&
                statusB !== FlashSaleStatus.Active
            ) {
                return -1;
            }

            if (
                statusB === FlashSaleStatus.Active &&
                statusA !== FlashSaleStatus.Active
            ) {
                return 1;
            }

            const startA = a?.startTime
                ? new Date(a.startTime).getTime()
                : 0;

            const startB = b?.startTime
                ? new Date(b.startTime).getTime()
                : 0;

            return startB - startA;
        });

        return list;
    }, [flashSales]);

    if (location.pathname.startsWith("/admin")) {
        return null;
    }

    return (
        <nav
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "12px 20px",
                background: "#fff",
                borderBottom: "1px solid #ddd",
                flexWrap: "wrap",
            }}
        >
            {/* Logo */}
            <Link to="/">
                <img
                    src="./../../../images/books/logo.png"
                    alt="Logo"
                    style={{
                        width: "120px",
                        objectFit: "contain",
                    }}
                />
            </Link>

            {/* Menu */}
            <ul
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    flexWrap: "wrap",
                }}
            >
                <li>
                    <NavLink to="/">
                        Trang chủ
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/about">
                        Giới thiệu
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/policy">
                        Chính sách
                    </NavLink>
                </li>

                {/* Flash Sale */}
                <li className="dropdown">
                    <button
                        type="button"
                        className="btn btn-light dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Flash Sale
                    </button>

                    <ul
                        className="dropdown-menu"
                        style={{
                            maxHeight: "300px",
                            overflowY: "auto",
                        }}
                    >
                        {flashSaleDropdownItems
                            .filter(
                                (sale) => sale?.id != null
                            )
                            .map((sale, index) => (
                                <li
                                    key={String(
                                        sale.id ?? index
                                    )}
                                >
                                    <Link
                                        className={
                                            "dropdown-item " +
                                            (Number(sale.id) ===
                                                Number(
                                                    selectedFlashSaleId
                                                )
                                                ? "active"
                                                : "")
                                        }
                                        to={`/flash-sale?saleId=${sale.id}`}
                                    >
                                        {sale.name ||
                                            `Flash Sale #${sale.id}`}
                                    </Link>
                                </li>
                            ))}
                    </ul>
                </li>

                {/* Thể loại */}
                <li className="dropdown">
                    <button
                        type="button"
                        className="btn btn-light dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Thể loại
                    </button>

                    <ul
                        className="dropdown-menu"
                        style={{
                            maxHeight: "300px",
                            overflowY: "auto",
                        }}
                    >
                        {genreList.map((genre, index) => (
                            <li key={index}>
                                <Link
                                    className="dropdown-item"
                                    to={`/search/${genre.idGenre}`}
                                >
                                    {genre.nameGenre}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </li>

                {isToken() && (
                    <li>
                        <NavLink to="/feedback">
                            Feedback
                        </NavLink>
                    </li>
                )}
            </ul>

            {/* Search */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                <input
                    type="search"
                    placeholder="Tìm kiếm"
                    value={tuKhoaTamThoi}
                    onChange={onsearchInputChange}
                    onKeyDown={handleKeyDown}
                    style={{
                        padding: "8px 12px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        minWidth: "220px",
                        outline: "none",
                    }}
                />

                <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSearch}
                >
                    <Search />
                </button>
            </div>

            {/* Right */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                }}
            >
                {/* Cart */}
                <Link
                    to="/cart"
                    style={{
                        position: "relative",
                        color: "#000",
                    }}
                >
                    <i
                        className="fas fa-shopping-cart"
                        style={{
                            fontSize: "22px",
                        }}
                    ></i>

                    <span
                        className="badge bg-danger"
                        style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-12px",
                        }}
                    >
                        {totalCart ? totalCart : ""}
                    </span>
                </Link>

                {/* Auth */}
                {!isToken() && (
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                        }}
                    >
                        <Link to="/dangnhap">
                            <Button>
                                Đăng nhập
                            </Button>
                        </Link>

                        <Link to="/dangKy">
                            <Button>
                                Đăng ký
                            </Button>
                        </Link>
                    </div>
                )}

                {/* User */}
                {isToken() && (
                    <div className="dropdown">
                        <button
                            type="button"
                            className="bg-transparent border-0"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <Avatar
                                alt={getLastNameByToken()?.toUpperCase()}
                                src={avatar}
                                sx={{
                                    width: 35,
                                    height: 35,
                                }}
                            />
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                <Link
                                    to="/profile"
                                    className="dropdown-item"
                                >
                                    Thông tin cá nhân
                                </Link>
                            </li>

                            <li>
                                <Link
                                    className="dropdown-item"
                                    to="/my-favorite-books"
                                >
                                    Sách yêu thích
                                </Link>
                            </li>

                            {hasRole("ADMIN") && (
                                <li>
                                    <Link
                                        className="dropdown-item"
                                        to="/admin/dashboard"
                                    >
                                        Quản lý
                                    </Link>
                                </li>
                            )}

                            <li>
                                <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() => {
                                        setTotalCart(0);

                                        logout(navigate);

                                        setLoggedIn(false);

                                        setCartList([]);
                                    }}
                                >
                                    Đăng xuất
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
}
export default Navbar;