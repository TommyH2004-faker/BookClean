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
    const { setTotalCart, cartList } = useCartItem();
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
        let isExistBook = cartList.find(cartItem => cartItem.book.idBook === newBook.idBook);

        if (isExistBook) {
            isExistBook.quantity += 1;

            if (isToken()) {
                const request = {
                    idCart: isExistBook.idCart,
                    quantity: isExistBook.quantity,
                };
                const token = localStorage.getItem("token");
                fetch(endpointBE + `/cart-item/update-item`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(request),
                }).catch(err => console.log(err));
            }
        } else {
            if (isToken()) {
                try {
                    const request = [
                        {
                            quantity: 1,
                            book: newBook,
                            idUser: getIdUserByToken(),
                        },
                    ];
                    const token = localStorage.getItem("token");
                    const response = await fetch(endpointBE + "/cart-item/add-item", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "content-type": "application/json",
                        },
                        body: JSON.stringify(request),
                    });

                    if (response.ok) {
                        const idCart = await response.json();
                        cartList.push({
                            idCart: idCart,
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
        toast.success("Thêm vào giỏ hàng thành công");
        setTotalCart(cartList.length);
    };

    const handleFavoriteBook = async () => {
        if (!isToken()) {
            toast.info("Bạn phải đăng nhập để sử dụng chức năng này");
            navigation("/dangnhap");
            return;
        }

        const token = localStorage.getItem("token");
        const url = isFavoriteBook
            ? endpointBE + `/favorite-book/delete-book`
            : endpointBE + `/favorite-book/add-book`;

        fetch(url, {
            method: isFavoriteBook ? "DELETE" : "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                idBook: maSach,
                idUser: getIdUserByToken(),
            }),
        }).catch(err => console.log(err));

        setIsFavoriteBook(!isFavoriteBook);
    };

    if (dangTaiDuLieu) {
        return <h1>Đang tải dữ liệu...</h1>;
    }

    if (baoLoi) {
        return <h1>Gặp lỗi: {baoLoi}</h1>;
    }

    const duLieuAnh = danhSachAnh.length > 0 ? danhSachAnh[0].urlImage : "";

    return (
        <div className="col-md-3 mt-2">
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Link to={`/books/${sach.idBook}`}>
                    <img
                        src={duLieuAnh}
                        className="card-img-top"
                        alt={sach.nameBook}
                        style={{ height: "250px", objectFit: "cover", borderRadius: "10px" }}
                    />
                </Link>
                <div className="card-body" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Link to={`/sach/${sach.idBook}`} style={{ textDecoration: 'none' }}>
                        <h5 className="card-title" style={{ minHeight: "50px", textAlign: "center" }}>
                            {sach.nameBook}
                        </h5>
                    </Link>

                    <div className="price row" style={{ minHeight: "40px" }}>
                        <span className="original-price col-6 text-end">
                            <del>{dinhDangSo(sach.listPrice)}</del>
                        </span>
                        <span className="discounted-price col-6 text-end">
                            <strong>{dinhDangSo(sach.sellPrice)} đ</strong>
                        </span>
                    </div>

                    <div className="row mt-2" role="group">
                        <div className="col-6">
                            {renderRating(sach.avgRating || 0)}
                        </div>
                        <div className="col-6 text-end">
                            <button className="btn btn-secondary btn-block me-2" onClick={handleFavoriteBook}>
                                <i className={`fas fa-heart ${isFavoriteBook ? "text-danger" : ""}`}></i>
                            </button>
                            <button className="btn btn-danger btn-block" onClick={() => handleAddProduct(sach)}>
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
