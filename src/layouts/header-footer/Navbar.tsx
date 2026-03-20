import React, {useEffect} from "react";
import { useState } from "react";
import {Link, NavLink, useLocation, useNavigate} from "react-router-dom";
import {Search} from "@mui/icons-material";
import {useCartItem} from "../utils/CartItemContext";
import {useAuth} from "../utils/AuthContext";
import {getAvatarByToken, getLastNameByToken, getRoleByToken, isToken, logout} from "../utils/JwtService";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import GenreModel from "../../models/GenreModel";
import {getAllGenres} from "../../api/GenreApi";
interface NavbarProps {
    tuKhoaTimKiem: string;
    setTuKhoaTimKiem: (tuKhoa: string) => void;
}
function Navbar({tuKhoaTimKiem,setTuKhoaTimKiem}:NavbarProps) {
    const [tuKhoaTamThoi, setTuKhoaTamThoi] = useState('');
    const {totalCart , setTotalCart , setCartList} = useCartItem();
    const {setLoggedIn} = useAuth();
    const [genreList, setGenreList] = useState<GenreModel[]>([]);
    const navigate = useNavigate();
    const [erroring, setErroring] = useState(null);
    useEffect(() => {
        getAllGenres().then((response) => {
            setGenreList(response.genreList);
        }).catch((error) => {
            setErroring(error.message);
        });
    }, []);
    const onsearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       setTuKhoaTamThoi(event.target.value);
    }
    const handleSearch = () => {
        setTuKhoaTimKiem(tuKhoaTamThoi);
    }
    const location = useLocation();
    const adminEndpoint = ["/admin"]; // Thêm các path bạn muốn ẩn Navbar vào đây
    if(adminEndpoint.includes(location.pathname)){
        return null;
    }

    return(
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">Bookstore</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <NavLink className="nav-link active" aria-current="page" to="/">Trang chủ</NavLink>
                        </li>
                        <li className='nav-item'>
                            <NavLink className='nav-link' to='/about'>
                                Giới thiệu
                            </NavLink>
                        </li>
                        {/* <li className="nav-item dropdown">
                            <NavLink className="nav-link dropdown-toggle" to="#" id="navbarDropdown1" role="button"
                                     data-bs-toggle="dropdown" aria-expanded="false">
                                Thể loại sách
                            </NavLink>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown1">
                                <li><NavLink className="dropdown-item" to="/30">Thể loại 1</NavLink></li>
                                <li><NavLink className="dropdown-item" to="/32">Thể loại 2</NavLink></li>
                                <li><NavLink className="dropdown-item" to="/36">Thể loại 3</NavLink></li>
                            </ul>
                        </li>*/}
                        <li className='nav-item dropdown dropdown-hover'>
                            <a
                                className='nav-link dropdown-toggle'
                                href='#'
                                role='button'
                                data-bs-toggle='dropdown'
                                aria-expanded='false'
                            >
                                Thể loại
                            </a>
                            <ul className='dropdown-menu'>
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
                        <li className='nav-item'>
                            <Link className='nav-link' to={"/policy"}>
                                Chính sách
                            </Link>
                        </li>
                        {isToken() && (
                            <li className='nav-item'>
                                <NavLink className='nav-link' to={"/feedback"}>
                                    Feedback
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Tìm kiếm */}
                <div className="d-flex">
                    <input className="form-control me-2" type="search" placeholder="Tìm kiếm" aria-label="Search"
                           onChange={onsearchInputChange} value={tuKhoaTamThoi}/>
                    <button className="btn btn-outline-success" type="submit" onClick={handleSearch}>Search
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
                            <a
                                className='text-reset me-3 dropdown-toggle hidden-arrow'
                                href='#'
                                id='navbarDropdownMenuLink'
                                role='button'
                                data-mdb-toggle='dropdown'
                                aria-expanded='false'
                            >
                                <i className='fas fa-bell'></i>
                                <span className='badge rounded-pill badge-notification bg-danger'>
										1
									</span>
                            </a>
                            <ul
                                className='dropdown-menu dropdown-menu-end'
                                aria-labelledby='navbarDropdownMenuLink'
                            >
                                <li>
                                    <a className='dropdown-item' href='#'>
                                        Tin tức
                                    </a>
                                </li>
                                <li>
                                    <a className='dropdown-item' href='#'>
                                        Thông báo mới
                                    </a>
                                </li>
                                <li>
                                    <a className='dropdown-item' href='#'>
                                        Tất cả thông báo
                                    </a>
                                </li>
                            </ul>
                        </div>
                    {/* <!-- Avatar --> */}
                        <div className='dropdown'>
                            <a
                                className='dropdown-toggle d-flex align-items-center hidden-arrow'
                                href='#'
                                id='navbarDropdownMenuAvatar'
                                role='button'
                                data-mdb-toggle='dropdown'
                                aria-expanded='false'
                            >
                                <Avatar
                                    style={{fontSize: "14px"}}
                                    alt={getLastNameByToken()?.toUpperCase()}
                                    src={getAvatarByToken()}
                                    sx={{width: 30, height: 30}}
                                />
                            </a>
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
                                {getRoleByToken() === "ADMIN" && (
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
                                    <a
                                        className='dropdown-item'
                                        style={{cursor: "pointer"}}
                                        onClick={() => {
                                            setTotalCart(0);
                                            logout(navigate);
                                            setLoggedIn(false);
                                            setCartList([]);
                                        }}
                                    >
                                        Đăng xuất
                                    </a>
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