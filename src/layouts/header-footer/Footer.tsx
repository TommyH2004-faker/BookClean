import React from "react";
import { Link } from "react-router-dom";
import { isToken } from "../utils/JwtService";

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-light border-top mt-5">
            <div className="container py-5">
                <div className="row g-4">
                    <div className="col-12 col-lg-3">
                        <Link to="/" className="d-inline-flex align-items-center text-decoration-none">
                            <img
                                src="/images/books/logo.png"
                                alt="MH Book"
                                className="img-fluid"
                                style={{ maxWidth: 140, height: "auto", objectFit: "contain" }}
                            />
                        </Link>
                        <p className="text-body-secondary mt-3 mb-2">
                            Nền tảng mua sách trực tuyến: nhanh gọn, tiện lợi, minh bạch.
                        </p>
                        <ul className="list-unstyled text-body-secondary small mb-0">
                            <li className="mb-1">
                                <i className="fas fa-phone-alt me-2" aria-hidden="true"></i>
                                Hotline: 1900 636 467
                            </li>
                            <li className="mb-1">
                                <i className="fas fa-envelope me-2" aria-hidden="true"></i>
                                Email: support@mhbook.local
                            </li>
                            <li className="mb-1">
                                <i className="fas fa-map-marker-alt me-2" aria-hidden="true"></i>
                                Giờ làm việc: 8:00 - 21:00 (T2 - CN)
                            </li>
                        </ul>
                    </div>

                    <div className="col-6 col-md-4 col-lg-2">
                        <h6 className="text-uppercase fw-semibold">Hỗ trợ</h6>
                        <ul className="nav flex-column">
                            <li className="nav-item mb-2">
                                <Link to="/policy" className="nav-link p-0 text-body-secondary">
                                    Chính sách đổi / trả
                                </Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/cart" className="nav-link p-0 text-body-secondary">
                                    Giỏ hàng
                                </Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/search" className="nav-link p-0 text-body-secondary">
                                    Tìm sách
                                </Link>
                            </li>
                            {isToken() && (
                                <li className="nav-item mb-2">
                                    <Link to="/feedback" className="nav-link p-0 text-body-secondary">
                                        Gửi feedback
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="col-6 col-md-4 col-lg-2">
                        <h6 className="text-uppercase fw-semibold">Về MH Book</h6>
                        <ul className="nav flex-column">
                            <li className="nav-item mb-2">
                                <Link to="/about" className="nav-link p-0 text-body-secondary">
                                    Giới thiệu
                                </Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/policy" className="nav-link p-0 text-body-secondary">
                                    Chính sách
                                </Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/my-favorite-books" className="nav-link p-0 text-body-secondary">
                                    Sách yêu thích
                                </Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/" className="nav-link p-0 text-body-secondary">
                                    Trang chủ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-6 col-md-4 col-lg-2">
                        <h6 className="text-uppercase fw-semibold">Tài khoản</h6>
                        <ul className="nav flex-column">
                            <li className="nav-item mb-2">
                                <Link to="/profile" className="nav-link p-0 text-body-secondary">
                                    Hồ sơ
                                </Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/cart" className="nav-link p-0 text-body-secondary">
                                    Thanh toán
                                </Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/dangnhap" className="nav-link p-0 text-body-secondary">
                                    Đăng nhập
                                </Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/dangky" className="nav-link p-0 text-body-secondary">
                                    Đăng ký
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-12 col-md-8 col-lg-3">
                        <h6 className="text-uppercase fw-semibold">Nhận bản tin</h6>
                        <p className="text-body-secondary mb-2">
                            Nhận thông báo sách mới & ưu đãi mỗi tháng.
                        </p>
                        <form className="mb-3" onSubmit={(e) => e.preventDefault()}>
                            <div className="d-flex flex-column flex-sm-row w-100 gap-2">
                                <label className="visually-hidden" htmlFor="newsletter1">
                                    Email
                                </label>
                                <input
                                    id="newsletter1"
                                    type="email"
                                    className="form-control"
                                    placeholder="Email của bạn"
                                />
                                <button className="btn btn-primary" type="button">
                                    Đăng ký
                                </button>
                            </div>
                        </form>

                        <h6 className="text-uppercase fw-semibold">Kết nối</h6>
                        <ul className="list-unstyled d-flex gap-3 m-0">
                            <li>
                                <a
                                    className="link-body-emphasis"
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Facebook"
                                >
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                            </li>
                            <li>
                                <a
                                    className="link-body-emphasis"
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Instagram"
                                >
                                    <i className="fab fa-instagram"></i>
                                </a>
                            </li>
                            <li>
                                <a
                                    className="link-body-emphasis"
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Twitter"
                                >
                                    <i className="fab fa-twitter"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="my-4" />

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                    <p className="mb-0 text-body-secondary small">
                        &copy; {year} MH Book. All rights reserved.
                    </p>
                    <div className="d-flex flex-wrap gap-3 small">
                        <Link to="/policy" className="text-body-secondary text-decoration-none">
                            Chính sách
                        </Link>
                        <Link to="/about" className="text-body-secondary text-decoration-none">
                            Giới thiệu
                        </Link>
                        <Link to="/" className="text-body-secondary text-decoration-none">
                            Trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;