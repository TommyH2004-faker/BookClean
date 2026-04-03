import React, { useState } from "react";
import Navbar from "./layouts/header-footer/Navbar";
import Footer from "./layouts/header-footer/Footer";
import HomePage from "./layouts/homepage/HomePage";
import About from "./layouts/About/About";
import { Route, Routes, BrowserRouter, useLocation } from "react-router-dom";
import ChiTietSach from "./layouts/product/ChiTietSach";
import DangKyNguoiDung from "./layouts/User/DangKyNguoiDung";
import KichHoatTaiKhoan from "./layouts/User/KichHoatTaiKhoan";

import PolicyPage from "./page/PolicyPage";
import { AuthProvider } from "./layouts/utils/AuthContext";
import { ConfirmProvider } from "material-ui-confirm";
import { ToastContainer } from "react-toastify";
import DashboardPage from "./layouts/Admin/Dashboard";
import BookManagementPage from "./layouts/Admin/BookManagement";
import UserManagementPage from "./layouts/Admin/UserManagement";
import GenreManagementPage from "./layouts/Admin/GenreManagement";
import OrderManagementPage from "./layouts/Admin/OrderManagement";
import FeedbackPage from "./layouts/Admin/FeedbackManagement";
import { Error404Page } from "./page/components/404Page";
import { Error403Page } from "./page/components/403Page";
import ProfilePage from "./layouts/Admin/component/user/ProfilePage";
import CartPage from "./page/CartPage";
import { CartItemProvider } from "./layouts/utils/CartItemContext";
import { FeedbackCustomerPage } from "./page/components/FeedbackCustomerPage";
import { ForgotPassword } from "./layouts/User/components/ForgotPassword";
import MyFavoriteBooksPage from "./page/MyFavoriteBooksPage";
import FilterPage from "./page/FilterPage";
import {Slidebar} from "./layouts/Admin/component/Slidebar";
import {CheckoutSuccess} from "./page/components/CheckoutSuccess";
import { ResendActiveCode } from "./layouts/User/ResendActiveCode";
import DangNhap from "./layouts/User/DangNhap";

const MyRoutes = () => {
    const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
    const [reloadAvatar, setReloadAvatar] = useState(0);

    const location = useLocation();
    const isAdminPath = location.pathname.startsWith("/admin");

    return (
        <AuthProvider>
            <CartItemProvider>
                <ConfirmProvider>
                    {/* Hiển thị Navbar và Footer cho trang khách hàng */}
                    {!isAdminPath && (
                        <>
                            <Navbar
                                key={reloadAvatar}
                                tuKhoaTimKiem={tuKhoaTimKiem}
                                setTuKhoaTimKiem={setTuKhoaTimKiem}
                            />
                        </>
                    )}

                    {/* Customer Routes */}
                    {!isAdminPath && (
                        <Routes>
                            <Route path='/' element={<HomePage tuKhoaTimKiem={tuKhoaTimKiem} />} />
                            <Route path='/:idGenre' element={<HomePage tuKhoaTimKiem={tuKhoaTimKiem} />} />
                            <Route path='/about' element={<About/>} />
                            <Route path='/books/:idBook' element={<ChiTietSach />} />
                            <Route path='/dangky' element={<DangKyNguoiDung />} />
                            <Route path='/dangnhap' element={<DangNhap />} />
                            <Route path='/activate' element={<KichHoatTaiKhoan />} />
                            <Route path='/search/:idGenreParam' element={<FilterPage />} />
                            <Route path='/search' element={<FilterPage />} />
                            <Route path='/my-favorite-books' element={<MyFavoriteBooksPage />} />
                             <Route path='/resend-active-code' element={<ResendActiveCode />} />
                            <Route path='/dangnhap' element={<DangNhap />} />
                            <Route path='/bao-loi-403' element={<Error403Page />} />
                            <Route path='/policy' element={<PolicyPage />} />
                            <Route path='/cart' element={<CartPage />} />
                            <Route path='/feedback' element={<FeedbackCustomerPage />} />
                            <Route path='/forgot-password' element={<ForgotPassword />} />
                            <Route path='/profile' element={<ProfilePage setReloadAvatar={setReloadAvatar} />} />
                            <Route path='/check-out/status' element={<CheckoutSuccess />} />
                            {/* Nếu không tìm thấy trang */}
                            <Route path='*' element={<Error403Page />} />
                        </Routes>
                    )}

                    {/* Hiển thị Footer cho trang khách hàng */}
                    {!isAdminPath && <Footer />}

                    {/* Admin Routes */}
                    {isAdminPath && (
                        <div className='row w-100 m-0'>
                            <div className='d-none d-md-block col-md-3 col-lg-2 px-0'>
                                <Slidebar />
                            </div>
                            <div className='col-12 col-md-9 col-lg-10'>
                                <Routes>
                                    <Route path='/admin/dashboard' element={<DashboardPage/>}/>
                                    <Route path='/admin/book' element={<BookManagementPage/>}/>
                                    <Route path='/admin/user' element={<UserManagementPage/>}/>
                                    <Route path='/admin/genre' element={<GenreManagementPage/>}/>
                                    <Route path='/admin/order' element={<OrderManagementPage/>}/>
                                    <Route path='/admin/feedback' element={<FeedbackPage/>}/>

                                    {/* Bắt lỗi 404 cho trang Admin */}
                                    <Route path='/admin/*' element={<Error404Page/>}/>
                                </Routes>
                            </div>
                        </div>
                    )}

                    {/* Toast thông báo */}
                    <ToastContainer position='bottom-center' autoClose={3000} pauseOnFocusLoss={false} />
                </ConfirmProvider>
            </CartItemProvider>
        </AuthProvider>
    );
};

function App() {
    return (
        <BrowserRouter>
            <MyRoutes />
        </BrowserRouter>
    );
}

export default App;