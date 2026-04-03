import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookModel from "../../../models/BookModel";
import ImageModel from "../../../models/ImageModel";
import { lay1AnhCuaMotSach } from "../../../api/HinhAnhAPI";
import dinhDangSo from "../../utils/dinhDangSo";
import renderRating from "../../utils/SaoXepHang";
import { useCartItem } from "../../utils/CartItemContext";
import { getIdUserByToken, isToken } from "../../utils/JwtService";
import { endpointBE } from "../../utils/Constant";
import { toast } from "react-toastify";

interface SachPropsInterface {
    sach: BookModel;
}

const SachProps: React.FC<SachPropsInterface> = ({ sach }) => {
    const maSach: number = sach.idBook;
    const [danhSachAnh, setDanhSachAnh] = useState<ImageModel[]>([]);
    const [dangTaiDuLieu, setDangTaiDuLieu] = useState(true);
    const [baoLoi, setBaoLoi] = useState<string | null>(null);
    const { setTotalCart, cartList, setCartList } = useCartItem();
    const [isFavoriteBook, setIsFavoriteBook] = useState(false);
    const navigation = useNavigate();

    useEffect(() => {
        lay1AnhCuaMotSach(maSach)
            .then(hinhAnhData => {
                setDanhSachAnh(hinhAnhData);
                setDangTaiDuLieu(false);
            })
            .catch(error => {
                setDangTaiDuLieu(false);
                setBaoLoi(error.message);
            });

        if (isToken()) {
            fetch(endpointBE + `/favorite-book/get-favorite-book/${getIdUserByToken()}`)
                .then(response => response.json())
                .then(data => {
                    if (data.includes(maSach)) {
                        setIsFavoriteBook(true);
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }, [maSach]);
    const handleAddProduct = async (newBook: BookModel) => {
        const existingCartItem = cartList.find(
            (item) => item.book.idBook === newBook.idBook
        );

        // Tính tổng số lượng sau khi add
        const currentQuantityInCart = existingCartItem ? existingCartItem.quantity : 0;
        // Nếu newBook.quantity undefined, mặc định là 0
        const availableQuantity = newBook.quantity ?? 0;

        if (currentQuantityInCart + 1 > availableQuantity) {
            toast.error("Không thể thêm, đã vượt quá số lượng tồn kho!");
            return;
        }

        if (existingCartItem) {
            existingCartItem.quantity += 1;

            if (isToken()) {
                await fetch(`${endpointBE}/cart-items/update-item`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({
                        idCart: existingCartItem.idCart,
                        quantity: existingCartItem.quantity,
                    }),
                });
            }
        } else {
            if (isToken()) {
                try {
                    const request = {
                        bookId: newBook.idBook,
                        quantity: 1,
                    };

                    const response = await fetch(`${endpointBE}/cart-items/add-item`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "content-type": "application/json",
                        },
                        body: JSON.stringify(request),
                    });

                    if (response.ok) {
                        const idCart = await response.json();
                        cartList.push({
                            idCart,
                            quantity: 1,
                            book: newBook,
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            } else {
                cartList.push({
                    quantity: 1,
                    book: newBook,
                });
            }
        }

        localStorage.setItem("cart", JSON.stringify(cartList));
        setCartList([...cartList]); // cập nhật state để component re-render
        toast.success("Thêm vào giỏ hàng thành công");
        setTotalCart(cartList.length);
    };
    // const handleFavoriteBook = async () => {
    //     if (!isToken()) {
    //         toast.info("Bạn phải đăng nhập để sử dụng chức năng này");
    //         navigation("/dangnhap");
    //         return;
    //     }

    //     const token = localStorage.getItem("token");
    //     const url = isFavoriteBook
    //         ? endpointBE + `/favorite-book/delete-book`
    //         : endpointBE + `/favorite-book/add-book`;

    //     fetch(url, {
    //         method: isFavoriteBook ? "DELETE" : "POST",
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //             "content-type": "application/json",
    //         },
    //         body: JSON.stringify({
    //             // idBook: maSach
    //             bookId: maSach 
    //         }),
    //     }).catch(err => console.log(err));

    //     setIsFavoriteBook(!isFavoriteBook);
    // };
    const handleFavoriteBook = async () => {
        if (!isToken()) {
            toast.info("Bạn phải đăng nhập để sử dụng chức năng này");
            navigation("/dangnhap");
            return;
        }

        const token = localStorage.getItem("token");
        const isRemoving = isFavoriteBook;

        const url = isRemoving
            ? `${endpointBE}/favorite-book/delete-book`
            : `${endpointBE}/favorite-book/add-book`;

        try {
            const response = await fetch(url, {
                method: isRemoving ? "DELETE" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bookId: maSach
                }),
            });

            if (!response.ok) throw new Error("Lỗi khi xử lý favorite");

            //  Update UI sau khi BE OK
            setIsFavoriteBook(!isFavoriteBook);

            //  Toast đúng trạng thái
            if (isRemoving) {
                toast.success("Đã xóa khỏi danh sách yêu thích");
            } else {
                toast.success("Thêm vào yêu thích thành công");
            }

        } catch (err) {
            console.log(err);
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
        }
    };
    if (dangTaiDuLieu) {
        return <h1>Đang tải dữ liệu...</h1>;
    }

    if (baoLoi) {
        return <h1>Gặp lỗi: {baoLoi}</h1>;
    }

    const duLieuAnh = danhSachAnh.length > 0 ? danhSachAnh[0].url : "";

    const listPrice = sach.listPrice ?? 0;
    const sellPrice = sach.sellPrice ?? 0;
    const discountPercent =
        listPrice > 0 && sellPrice > 0 && sellPrice < listPrice
            ? Math.round(((listPrice - sellPrice) / listPrice) * 100)
            : 0;

    return (
        <div className="col-md-3 mt-2">
            <div
                className="card border-0 shadow-4 rounded h-100 bg-white"
                style={{ position: "relative", overflow: "hidden" }}
            >
                {discountPercent > 0 && (
                    <div
                        className="badge bg-danger"
                        style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            padding: "8px 10px",
                            fontSize: "0.85rem",
                            zIndex: 2,
                        }}
                    >
                        -{discountPercent}%
                    </div>
                )}
                <Link to={`/books/${sach.idBook}`} className="d-block text-decoration-none">
                    <div style={{ height: "290px", background: "#f8f9fa" }}>
                        <img
                            src={duLieuAnh}
                            alt={sach.nameBook}
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                </Link>

                <div className="card-body p-3 d-flex flex-column">
                    <Link to={`/books/${sach.idBook}`} className="text-decoration-none text-dark">
                        <div
                            className="fw-semibold"
                            style={{
                                minHeight: "44px",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {sach.nameBook}
                        </div>
                    </Link>

                    <div className="mt-2">
                        <span className="discounted-price text-danger me-2">
                            <strong style={{ fontSize: "18px" }}>
                                {dinhDangSo(sach.sellPrice)}đ
                            </strong>
                        </span>
                        <span className="original-price small text-muted">
                            <del>{dinhDangSo(sach.listPrice)}đ</del>
                        </span>
                    </div>

                    <div className="mt-2 d-flex align-items-center justify-content-between">
                        <div>{renderRating(sach.avgRating || 0)}</div>
                        <div className="d-flex gap-2" role="group" aria-label="Product actions">
                            <button
                                type="button"
                                className={`btn btn-sm ${isFavoriteBook ? "btn-danger" : "btn-outline-danger"}`}
                                onClick={handleFavoriteBook}
                                title="Yêu thích"
                            >
                                <i className="fas fa-heart"></i>
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleAddProduct(sach)}
                                title="Thêm vào giỏ"
                            >
                                <i className="fas fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SachProps;
