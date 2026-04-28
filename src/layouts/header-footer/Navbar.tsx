import React, {useEffect, useMemo} from "react";
import { useState } from "react";
import {Link, NavLink, useLocation, useNavigate} from "react-router-dom";
import {Search} from "@mui/icons-material";
import {useCartItem} from "../utils/CartItemContext";
import {useAuth} from "../utils/AuthContext";
import {getIdUserByToken, getLastNameByToken, hasRole, isToken, logout} from "../utils/JwtService";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import GenreModel from "../../models/GenreModel";
import {getAllGenres} from "../../api/GenreApi";
import { get1User } from "../../api/UserApi";
import { getFlashSales } from "../../api/FlashSaleApi";
import { FlashSaleStatus, type FlashSaleModel } from "../../models/FlashSaleModel";
interface NavbarProps {
    tuKhoaTimKiem: string;
    setTuKhoaTimKiem: (tuKhoa: string) => void;
}
function Navbar({tuKhoaTimKiem,setTuKhoaTimKiem}:NavbarProps) {
    const [tuKhoaTamThoi, setTuKhoaTamThoi] = useState('');
    const {totalCart , setTotalCart , setCartList} = useCartItem();
    const {setLoggedIn} = useAuth();
    const [genreList, setGenreList] = useState<GenreModel[]>([]);
    const [flashSales, setFlashSales] = useState<FlashSaleModel[]>([]);
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState("");
    useEffect(() => {
        getAllGenres().then((response) => {
            setGenreList(response.genreList);
        }).catch((error) => {
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
    
    const onsearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       setTuKhoaTamThoi(event.target.value);
    }
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
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
        handleSearch();
        }
    };
    const handleSearch = () => {
        setTuKhoaTimKiem(tuKhoaTamThoi);
    }
    const location = useLocation();
    const selectedFlashSaleId = useMemo(() => {
        if (!location.pathname.startsWith("/flash-sale")) return null;
        const params = new URLSearchParams(location.search);
        const raw = params.get("saleId") ?? params.get("flashSaleId");
        const parsed = Number(raw);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }, [location.pathname, location.search]);

    const flashSaleDropdownItems = useMemo(() => {
        const list = [...flashSales];
        list.sort((a, b) => {
            const statusA = Number(a?.status ?? 0);
            const statusB = Number(b?.status ?? 0);
            if (statusA === FlashSaleStatus.Active && statusB !== FlashSaleStatus.Active) return -1;
            if (statusB === FlashSaleStatus.Active && statusA !== FlashSaleStatus.Active) return 1;

            const startA = a?.startTime ? new Date(a.startTime).getTime() : 0;
            const startB = b?.startTime ? new Date(b.startTime).getTime() : 0;
            return startB - startA;
        });
        return list;
    }, [flashSales]);
    if (location.pathname.startsWith("/admin")) {
        return null;
    }
    return(
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to={"/"}>
                    <img
                        src={"./../../../images/books/logo.png"}
                        alt="Logo"
                        className="img-fluid"
                        style={{
                            width: "100%",
                            maxWidth: "150px",
                            height: "auto",
                            maxHeight: "90px",
                            objectFit: "contain",
                        }}
                    />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Bật/tắt điều hướng">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {/* Desktop tabs */}
                        <li className='nav-item d-none d-lg-block'>
                            <NavLink className='nav-link' aria-current='page' to='/'>
                                Trang chủ
                            </NavLink>
                        </li>
                        <li className='nav-item d-none d-lg-block'>
                            <NavLink className='nav-link' to='/about'>
                                Giới thiệu
                            </NavLink>
                        </li>
                        <li className='nav-item d-none d-lg-block'>
                            <NavLink className='nav-link' to='/policy'>
                                Chính sách
                            </NavLink>
                        </li>
                        <li className='nav-item dropdown dropdown-hover d-none d-lg-block'>
                            <button
                                type='button'
                                className='nav-link dropdown-toggle bg-transparent border-0'
                                data-bs-toggle='dropdown'
                                aria-expanded='false'
                            >
                                Flash Sale
                            </button>
                            <ul
                                className='dropdown-menu'
                                style={{ maxHeight: "300px", overflowY: "auto" }}
                            >
                                {flashSaleDropdownItems
                                    .filter((sale) => sale?.id != null)
                                    .map((sale, index) => (
                                        <li key={String(sale.id ?? index)}>
                                            <Link
                                                className={
                                                    'dropdown-item' +
                                                    (Number(sale.id) === Number(selectedFlashSaleId) ? ' active' : '')
                                                }
                                                to={`/flash-sale?saleId=${sale.id}`}
                                            >
											{sale.name || `Flash Sale #${sale.id}`}
                                            </Link>
                                        </li>
                                    ))}
                            </ul>
                        </li>
                        {isToken() && (
                            <li className='nav-item d-none d-lg-block'>
                                <NavLink className='nav-link' to='/feedback'>
                                    FeedBack
                                </NavLink>
                            </li>
                        )}

                        {/* Mobile dropdown */}
                        <li className='nav-item dropdown d-lg-none'>
    <button
        type='button'
        className='nav-link dropdown-toggle bg-transparent border-0'
        data-bs-toggle='dropdown'
        aria-expanded='false'
    >
        Trang
    </button>
    <ul className='dropdown-menu w-100'>
        <li>
            <NavLink className='dropdown-item' to='/'>
                Trang chủ
            </NavLink>
        </li>
        <li>
            <NavLink className='dropdown-item' to='/about'>
                Giới thiệu
            </NavLink>
        </li>
        <li>
            <NavLink className='dropdown-item' to='/policy'>
                Chính sách
            </NavLink>
        </li>
        <li>
            <NavLink className='dropdown-item' to='/flash-sale'>
                Flash Sale
            </NavLink>
        </li>
        
        {flashSaleDropdownItems
            .filter((sale) => sale?.id != null)
            .map((sale, index) => (
                <li key={String(sale.id ?? index)}>
                    <NavLink className='dropdown-item' to={`/flash-sale?saleId=${sale.id}`}> 
                        {sale.name || `Flash Sale #${sale.id}`}
                    </NavLink>
                </li>
            ))}
        {isToken() && (
            <li>
                <NavLink className='dropdown-item' to='/feedback'>
                    Phản hồi
                </NavLink>
            </li>
        )}
    </ul>
</li>
                        <li className='nav-item dropdown dropdown-hover'>
                        <button
                            type='button'
                            className='nav-link dropdown-toggle bg-transparent border-0'
                            data-bs-toggle='dropdown'
                            aria-expanded='false'
                        >
                            Thể loại
                            </button>
                            <ul 
                                className='dropdown-menu' 
                                style={{
                                    maxHeight: "300px",
                                    overflowY: "auto"
                                }}
                                >
                                {genreList.map((genre, index) => {
                                    return (
                                        <li key={index}>
                                            <Link
                                                className='dropdown-item'
                                                to={`/search/${genre.idGenre}`}
                                            >
                                                {genre.nameGenre}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>
                    </ul>
                </div>

                {/* Tìm kiếm */}
                <div className="d-flex">
                    <input className="form-control me-2" type="search" placeholder="Tìm kiếm" aria-label="Tìm kiếm"
                           onChange={onsearchInputChange} value={tuKhoaTamThoi} onKeyDown={handleKeyDown}/>
                    <button className="btn btn-outline-success" type="submit" onClick={handleSearch}>Tìm
                        <Search/>
                    </button>
                </div>

                {/* Biểu tượng giỏ hàng */}
                <ul className="navbar-nav me-1">
                <li className="nav-item">
                        <Link className="nav-link" to="/cart">
                            <i className="fas fa-shopping-cart"></i>
                            <span className="badge bg-danger">{totalCart ? totalCart : ""}</span>
                        </Link>
                    </li>
                </ul>

                {/* Biểu tượng đăng nhập */}
                {!isToken() && (
                    <div>
                        <Link to={"/dangnhap"}>
                            <Button>Đăng nhập</Button>
                        </Link>
                        <Link to={"/dangKy"}>
                            <Button>Đăng ký</Button>
                        </Link>
                    </div>
                )}
                {isToken() && (
                    <>
                        {/* <!-- Notifications --> */}
                        <div className='dropdown'>
                            <button
                                type='button'
                                className='text-reset me-3 dropdown-toggle hidden-arrow bg-transparent border-0'
                                id='navbarDropdownMenuLink'
                                data-mdb-toggle='dropdown'
                                aria-expanded='false'
                            >
                                <i className='fas fa-bell'></i>
                                <span className='badge rounded-pill badge-notification bg-danger'>
										1
									</span>
                            </button>
                            <ul
                                className='dropdown-menu dropdown-menu-end'
                                aria-labelledby='navbarDropdownMenuLink'
                            >
                                <li>
                                    <button type='button' className='dropdown-item'>
                                        Tin tức
                                    </button>
                                </li>
                                <li>
                                    <button type='button' className='dropdown-item'>
                                        Thông báo mới
                                    </button>
                                </li>
                                <li>
                                    <button type='button' className='dropdown-item'>
                                        Tất cả thông báo
                                    </button>
                                </li>
                            </ul>
                        </div>
                    {/* <!-- Avatar --> */}
                        {/* <div className='dropdown'>
                            <button
                                type='button'
                                className='dropdown-toggle d-flex align-items-center hidden-arrow bg-transparent border-0'
                                id='navbarDropdownMenuAvatar'
                                data-mdb-toggle='dropdown'
                                aria-expanded='false'
                            >
                                <Avatar
                                style={{ fontSize: "14px" }}
                                alt={getLastNameByToken()?.toUpperCase()}
                                src={avatar}
                                sx={{ width: 30, height: 30 }}
                            />
                            </button>
                            <ul
                                className='dropdown-menu dropdown-menu-end'
                                aria-labelledby='navbarDropdownMenuAvatar'
                            > */}
                            <div className='dropdown'>
    <button
        type='button'
        className='dropdown-toggle d-flex align-items-center hidden-arrow bg-transparent border-0'
        id='navbarDropdownMenuAvatar'
        data-bs-toggle='dropdown'
        aria-expanded='false'
    >
        <Avatar
            style={{ fontSize: "14px" }}
            alt={getLastNameByToken()?.toUpperCase()}
            src={avatar}
            sx={{ width: 30, height: 30 }}
        />
    </button>
    <ul
        className='dropdown-menu dropdown-menu-end'
        aria-labelledby='navbarDropdownMenuAvatar'
    >
                                <li>
                                    <Link to={"/profile"} className='dropdown-item'>
                                        Thông tin cá nhân
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className='dropdown-item'
                                        to='/my-favorite-books'
                                    >
                                        Sách yêu thích của tôi
                                    </Link>
                                </li>
                                {hasRole("ADMIN") && (
                                    <li>
                                        <Link
                                            className='dropdown-item'
                                            to='/admin/dashboard'
                                        >
                                            Quản lý
                                        </Link>
                                    </li>
                                )}
                                <li>
                                    <button
                                        type='button'
                                        className='dropdown-item'
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
                    </>
                )}
            </div>
</nav>
);
}

export default Navbar;