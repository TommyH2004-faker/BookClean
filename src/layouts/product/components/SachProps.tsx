
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
    showSoldProgress?: boolean;
}

const SachProps: React.FC<SachPropsInterface> = ({ sach, showSoldProgress = false }) => {
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
                .catch(error => console.log(error));
        }
    }, [maSach]);


//     const handleAddProduct = async (newBook: BookModel) => {
//     const existingCartItem = cartList.find(
//         (item) => item.book.idBook === newBook.idBook
//     );

//     // ❗ Nếu chưa login mà là flash sale → chặn luôn
//     if (!isToken() && newBook.isFlashSale) {
//         toast.info("Vui lòng đăng nhập để mua Flash Sale");
//         return;
//     }

//     try {
//         let updatedCart;

//         if (existingCartItem) {
//             // 👉 UPDATE ITEM
//             const res = await fetch(`${endpointBE}/cart-items/update-item`, {
//                 method: "PUT",
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem("token")}`,
//                     "content-type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     idCart: existingCartItem.idCart,
//                     quantity: existingCartItem.quantity + 1,
//                 }),
//             });

//             if (!res.ok) {
//                 const errText = await res.text();
//                 try {
//                     const errObj = JSON.parse(errText);
//                     toast.error(errObj.message);
//                 } catch {
//                     toast.error("Không thể cập nhật giỏ hàng");
//                 }
//                 return;
//             }

//             // ✅ update state IMMUTABLE
//             updatedCart = cartList.map(item =>
//                 item.book.idBook === newBook.idBook
//                     ? { ...item, quantity: item.quantity + 1 }
//                     : item
//             );

//         } else {
//             if (!isToken()) {
//     // 👉 CHƯA LOGIN → LOCAL ONLY
//     let updatedCart;

//     if (existingCartItem) {
//         updatedCart = cartList.map(item =>
//             item.book.idBook === newBook.idBook
//                 ? { ...item, quantity: item.quantity + 1 }
//                 : item
//         );
//     } else {
//         updatedCart = [
//             ...cartList,
//             { quantity: 1, book: newBook }
//         ];
//     }

//     setCartList(updatedCart);
//     localStorage.setItem("cart", JSON.stringify(updatedCart));

//     const total = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
//     setTotalCart(total);

//     toast.success("Thêm vào giỏ hàng thành công");
//     return; 
// }
//             else {
//             // 👉 ADD ITEM
//             const res = await fetch(`${endpointBE}/cart-items/add-item`, {
//                 method: "POST",
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem("token")}`,
//                     "content-type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     bookId: newBook.idBook,
//                     quantity: 1,
//                 }),
//             });

//             if (!res.ok) {
//                 const errText = await res.text();
//                 try {
//                     const errObj = JSON.parse(errText);
//                     toast.error(errObj.message);
//                 } catch {
//                     toast.error("Không thể thêm vào giỏ hàng");
//                 }
//                 return;
//             }

//             const data = await res.json();
//             const idCart = data?.data ?? data?.idCart ?? data;

//             updatedCart = [
//                 ...cartList,
//                 {
//                     idCart,
//                     quantity: 1,
//                     book: newBook,
//                 },
//             ];
//         }

//         // ✅ Sync state + localStorage
//         setCartList(updatedCart);
//         localStorage.setItem("cart", JSON.stringify(updatedCart));

//         // ✅ Tổng số lượng đúng
//         const total = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
//         setTotalCart(total);

//         toast.success("Thêm vào giỏ hàng thành công");

//     } catch (err) {
//         toast.error("Lỗi kết nối server");
//     }
// };
    const handleAddProduct = async (newBook: BookModel) => {
    const existingCartItem = cartList.find(
        (item) => item.book.idBook === newBook.idBook
    );

    // ❗ Nếu chưa login mà là flash sale → chặn luôn
    if (!isToken() && newBook.isFlashSale) {
        toast.info("Vui lòng đăng nhập để mua Flash Sale");
        return;
    }

    try {
        let updatedCart = [...cartList];

        if (existingCartItem) {
            // 👉 SẢN PHẨM ĐÃ CÓ TRONG GIỎ -> TĂNG SỐ LƯỢNG (Cộng 1)
            const newQuantity = existingCartItem.quantity + 1;

            if (isToken()) {
                const res = await fetch(`${endpointBE}/cart-items/update-item`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({
                        idCart: existingCartItem.idCart,
                        quantity: newQuantity,
                    }),
                });

                if (!res.ok) {
                    toast.error("Không thể cập nhật giỏ hàng");
                    return;
                }
            }

            // Cập nhật vào mảng ảo
            updatedCart = updatedCart.map(item =>
                item.book.idBook === newBook.idBook
                    ? { ...item, quantity: newQuantity }
                    : item
            );

        } else {
            // 👉 SẢN PHẨM CHƯA CÓ TRONG GIỎ -> THÊM MỚI
            if (isToken()) {
                const res = await fetch(`${endpointBE}/cart-items/add-item`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({
                        bookId: newBook.idBook,
                        quantity: 1, // Mặc định ở ngoài danh sách là thêm 1
                    }),
                });

                if (!res.ok) {
                    toast.error("Không thể thêm vào giỏ hàng");
                    return;
                }

                const data = await res.json();
                const idCart = data?.data ?? data?.idCart ?? data;

                updatedCart.push({
                    idCart,
                    quantity: 1,
                    book: newBook,
                });
            } else {
                // Chưa login
                updatedCart.push({
                    quantity: 1,
                    book: newBook,
                });
            }
        }

        // ✅ LƯU STATE VÀ LOCALSTORAGE (Chỉ gọi 1 lần ở cuối)
        setCartList(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        // ✅ Cập nhật tổng số lượng hiển thị trên icon giỏ hàng
        const total = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
        setTotalCart(total);

        toast.success("Thêm vào giỏ hàng thành công");

    } catch (err) {
        toast.error("Lỗi kết nối server");
    }
};
    const handleFavoriteBook = async () => {
        if (!isToken()) {
            toast.info("Bạn phải đăng nhập để sử dụng chức năng này");
            navigation("/dangnhap");
            return;
        }

        const token = localStorage.getItem("token");
        const isRemoving = isFavoriteBook;
        const url = isRemoving ? `${endpointBE}/favorite-book/delete-book` : `${endpointBE}/favorite-book/add-book`;

        try {
            const response = await fetch(url, {
                method: isRemoving ? "DELETE" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ bookId: maSach }),
            });

            if (!response.ok) throw new Error("Lỗi khi xử lý favorite");

            setIsFavoriteBook(!isFavoriteBook);
            toast.success(isRemoving ? "Đã xóa khỏi danh sách yêu thích" : "Thêm vào yêu thích thành công");
        } catch (err) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
        }
    };

    if (dangTaiDuLieu) return <h1>Đang tải dữ liệu...</h1>;
    if (baoLoi) return <h1>Gặp lỗi: {baoLoi}</h1>;

    const duLieuAnh = danhSachAnh.length > 0 ? danhSachAnh[0].url : "";
    const listPrice = sach.listPrice ?? 0;
    const sellPrice = sach.sellPrice ?? 0;
    const discountPercent = listPrice > 0 && sellPrice > 0 && sellPrice < listPrice
        ? Math.round(((listPrice - sellPrice) / listPrice) * 100) : 0;

    const isFlashSale = Boolean(sach.isFlashSale);
    const soldQuantity = sach.soldQuantity ?? 0;
    const stockQuantity = sach.quantity ?? 0;
    const totalForProgress = soldQuantity + stockQuantity;
    const soldPercent = totalForProgress > 0 ? Math.round((soldQuantity / totalForProgress) * 100) : 0;

    return (
        <div className="col-md-3 mt-2">
            <div className="card border-0 shadow-4 rounded h-100 bg-white" style={{ position: "relative", overflow: "hidden" }}>
                {discountPercent > 0 && (
                    <div className="badge bg-danger" style={{ position: "absolute", top: "10px", left: "10px", padding: "8px 10px", fontSize: "0.85rem", zIndex: 2 }}>
                        -{discountPercent}%
                    </div>
                )}

                <Link to={`/books/${sach.idBook}`} className="d-block text-decoration-none">
                    <div style={{ height: "290px", background: "#f8f9fa" }}>
                        <img src={duLieuAnh} alt={sach.nameBook} className="w-100 h-100" style={{ objectFit: "cover" }} />
                    </div>
                </Link>

                <div className="card-body p-3 d-flex flex-column">
                    <Link to={`/books/${sach.idBook}`} className="text-decoration-none text-dark">
                        <div className={`fw-semibold ${isFlashSale ? "blinking-text-flash-sale" : ""}`}
                            style={{ minHeight: "44px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                        >
                            {sach.nameBook}
                        </div>
                    </Link>

                    <div className="mt-2">
                        <span className="discounted-price text-danger me-2">
                            <strong style={{ fontSize: "18px" }}>{dinhDangSo(sach.sellPrice)}đ</strong>
                        </span>
                        <span className="original-price small text-muted"><del>{dinhDangSo(sach.listPrice)}đ</del></span>
                    </div>

                    {showSoldProgress && (
                        <div className="mt-2">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="small text-body-secondary">Đã bán {soldQuantity}</span>
                                {totalForProgress > 0 && <span className="small text-body-secondary">{soldPercent}%</span>}
                            </div>
                            {totalForProgress > 0 && (
                                <div className="progress" style={{ height: 8 }}>
                                    <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${Math.min(100, Math.max(0, soldPercent))}%` }} aria-valuenow={soldPercent} aria-valuemin={0} aria-valuemax={100}></div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-2 d-flex align-items-center justify-content-between mt-auto pt-2">
                        <div>{renderRating(sach.avgRating || 0)}</div>
                        <div className="d-flex gap-2" role="group" aria-label="Thao tác sản phẩm">
                            <button type="button" className={`btn btn-sm ${isFavoriteBook ? "btn-danger" : "btn-outline-danger"}`} onClick={handleFavoriteBook} title="Yêu thích">
                                <i className="fas fa-heart"></i>
                            </button>
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleAddProduct(sach)} title="Thêm vào giỏ">
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