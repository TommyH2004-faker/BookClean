
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import SelectQuantity from "./components/select-quantity/SelectQuantity";
import Button from "@mui/material/Button";
import { ShoppingCartOutlined } from "@mui/icons-material";
import Comment from "./components/comment/Comment";
import TextEllipsis from "./components/text-ellipsis/TextEllipsis";
import { getGenreByIdBook } from "../../api/GenreApi";

import React from "react";
import ReactSimpleImageViewer from "react-simple-image-viewer";
import { toast } from "react-toastify";

import { endpointBE } from "../utils/Constant";
import { isToken } from "../utils/JwtService";
import { useCartItem } from "../utils/CartItemContext";
import { Skeleton } from "@mui/material";

import useScrollToTop from "../../hooks/ScrollToTop";
import BookModel from "../../models/BookModel";
import { laySachTheoMaSach, searchBook } from "../../api/SachAPI";
import GenreModel from "../../models/GenreModel";
import ImageModel from "../../models/ImageModel";
import {layToanBoHinhAnhMotSach} from "../../api/HinhAnhAPI";
import {CheckoutPage} from "../../page/components/CheckoutPage";
import RatingStar from "./rating/Rating";
import CartItemModel from "../../models/CartItemModel";
import SachProps from "./components/SachProps";
import { getErrorMessage } from "../utils/helperError";


interface BookDetailProps {}

const BookDetail: React.FC<BookDetailProps> = (props) => {
    useScrollToTop(); // Mỗi lần vào component này thì sẽ ở trên cùng
    const { setTotalCart, cartList, setCartList } = useCartItem();

    // Lấy mã sách từ url
    const { idBook } = useParams();
    let idBookNumber: number = 0;

    // Ép kiểu về number
    try {
        idBookNumber = parseInt(idBook + "");
        if (Number.isNaN(idBookNumber)) {
            idBookNumber = 0;
        }
    } catch (error) {
        console.error("Error: " + error);
    }

    // Khai báo biến
    const [book, setBook] = useState<BookModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [erroring, setErroring] = useState<string | null>(null);
    // Lấy sách ra
    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setErroring(null);
        setBook(null);

        laySachTheoMaSach(idBookNumber)
            .then((response) => {
                if (cancelled) return;
                setBook(response);
                setLoading(false);
            })
            .catch((error) => {
                if (cancelled) return;
                setLoading(false);
                setErroring(error.message);
            });

        return () => {
            cancelled = true;
        };
    }, [idBookNumber]);

    // Lấy ra thể loại của sách
    const [genres, setGenres] = useState<GenreModel[] | null>(null);
    useEffect(() => {
        let cancelled = false;

        setGenres(null);
        getGenreByIdBook(idBookNumber)
            .then((response) => {
                if (cancelled) return;
                setGenres(response.genreList);
            })
            .catch(() => {
                if (cancelled) return;
                setGenres([]);
            });

        return () => {
            cancelled = true;
        };
    }, [idBookNumber]);

    // Lấy ra hình ảnh của sách
    const [images, setImages] = useState<ImageModel[] | null>(null);
    useEffect(() => {
        let cancelled = false;

        setImages(null);
        layToanBoHinhAnhMotSach(idBookNumber)
            .then((response) => {
                if (cancelled) return;
                setImages(response);
            })
            .catch((error) => {
                console.error(error);
                if (cancelled) return;
                setImages([]);
            });

        return () => {
            cancelled = true;
        };
    }, [idBookNumber]);

    // Sách liên quan (cùng thể loại)
    const [relatedBooks, setRelatedBooks] = useState<BookModel[]>([]);
    const [loadingRelatedBooks, setLoadingRelatedBooks] = useState(false);

    useEffect(() => {
        if (!genres || genres.length === 0) {
            setRelatedBooks([]);
            return;
        }

        let cancelled = false;
        setLoadingRelatedBooks(true);

        const genreIds = Array.from(
            new Set(genres.map((g) => g.idGenre).filter(Boolean))
        ) as number[];

        Promise.all(
            genreIds.map((genreId) =>
                searchBook("", genreId, undefined, 100, 0)
                    .then((res) => res.ketQua)
                    .catch(() => [])
            )
        )
            .then((lists) => {
                if (cancelled) return;
                const merged = lists.flat();
                const dedup = new Map<number, BookModel>();
                for (const b of merged) {
                    if (!b?.idBook) continue;
                    if (b.idBook === idBookNumber) continue;
                    if (!dedup.has(b.idBook)) dedup.set(b.idBook, b);
                }
                setRelatedBooks(Array.from(dedup.values()));
            })
            .finally(() => {
                if (cancelled) return;
                setLoadingRelatedBooks(false);
            });

        return () => {
            cancelled = true;
        };
    }, [genres, idBookNumber]);

    const relatedScrollRef = useRef<HTMLDivElement | null>(null);
    const scrollRelated = (direction: "prev" | "next") => {
        const el = relatedScrollRef.current;
        if (!el) return;
        const amount = el.clientWidth || 600;
        el.scrollBy({
            left: direction === "prev" ? -amount : amount,
            behavior: "smooth",
        });
    };

    const [quantity, setQuantity] = useState(1);

    // BỔ SUNG LOGIC TÍNH TỐI ĐA THỰC TẾ
    const currentQuantityInCart = cartList.find((c) => c.book.idBook === book?.idBook)?.quantity || 0;
    const availableStock = book?.quantity || 0;
    const maxAllowed = Math.max(0, availableStock - currentQuantityInCart);

    // Xử lý tăng số lượng (giới hạn theo maxAllowed)
    const add = () => {
        if (quantity < maxAllowed) {
            setQuantity(quantity + 1);
        } else {
            toast.warning(`Giỏ hàng đã có ${currentQuantityInCart} sản phẩm. Bạn chỉ thêm được tối đa ${maxAllowed} sản phẩm nữa.`);
        }
    };

    // Xử lý giảm số lượng
    const reduce = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    // const handleAddProduct = async (newBook: BookModel, quantity: number = 1) => {
    //     if (newBook.isFlashSale) {
    //         const maxPerUser = await getFlashSaleMaxPerUser(newBook.idBook);
    //         if (maxPerUser && currentQuantityInCart + quantity > maxPerUser) {
    //             toast.error(`Flash Sale: tối đa ${maxPerUser} sản phẩm/khách`);
    //             return;
    //         }
    //     }

    //     if (currentQuantityInCart + quantity > availableStock) {
    //         toast.error("Không thể thêm, đã vượt quá số lượng tồn kho!");
    //         return;
    //     }

    //     // Tạo mảng ảo ngay từ đầu để thao tác
    //     let updatedCart = [...cartList];
    //     let isExistBook = updatedCart.find(
    //         (cartItem) => cartItem.book.idBook === newBook.idBook
    //     );

    //     if (isExistBook) {
    //         const newQuantity = isExistBook.quantity + quantity;

    //         if (isToken()) {
    //             const request = {
    //                 idCart: isExistBook.idCart,
    //                 quantity: newQuantity,
    //             };

    //             try {
    //                 const res = await fetch(endpointBE + `/cart-items/update-item`, {
    //                     method: "PUT",
    //                     headers: {
    //                         Authorization: `Bearer ${localStorage.getItem("token")}`,
    //                         "content-type": "application/json",
    //                     },
    //                     body: JSON.stringify(request),
    //                 });

    //                 if (!res.ok) {
    //                     const message = await getErrorMessage(res);
    //                     toast.error(message);
    //                     return; // Lỗi thì dừng luôn, không chạy xuống dưới
    //                 }
    //             } catch (err) {
    //                 toast.error("Không thể cập nhật giỏ hàng");
    //                 return;
    //             }
    //         }
            
    //         // Cập nhật số lượng vào mảng ảo (chạy cho cả khi login và chưa login)
    //         updatedCart = updatedCart.map(item =>
    //             item.book.idBook === newBook.idBook
    //                 ? { ...item, quantity: newQuantity }
    //                 : item
    //         );

    //     } else {
    //         if (isToken()) {
    //             try {
    //                 const token = localStorage.getItem("token");
    //                 const postPayload = {
    //                     bookId: newBook.idBook,
    //                     quantity: quantity,
    //                 };

    //                 const response = await fetch(endpointBE + "/cart-items/add-item", {
    //                     method: "POST",
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                         "content-type": "application/json",
    //                     },
    //                     body: JSON.stringify(postPayload),
    //                 });

    //                 if (!response.ok) {
    //                     toast.error("Không thể thêm vào giỏ hàng");
    //                     return;
    //                 }

    //                 const payload = await response.json();
    //                 const idCart = payload?.data ?? payload?.idCart ?? payload;

    //                 // Thêm sách mới vào mảng ảo
    //                 updatedCart.push({
    //                     idCart: idCart,
    //                     quantity: quantity,
    //                     book: newBook,
    //                 });
    //             } catch (error) {
    //                 toast.error("Không thể thêm vào giỏ hàng");
    //                 return;
    //             }
    //         } else {
    //             // Chưa đăng nhập -> Thêm thẳng vào mảng ảo
    //             updatedCart.push({
    //                 quantity: quantity,
    //                 book: newBook,
    //             });
    //         }
    //     }

    //     // ✅ CHỈ LƯU VÀO STATE VÀ LOCALSTORAGE ĐÚNG 1 LẦN Ở ĐÂY
    //     setCartList(updatedCart);
    //     localStorage.setItem("cart", JSON.stringify(updatedCart));

    //     const total = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
    //     setTotalCart(total);
    //     setQuantity(1); // Reset lại nút chọn số lượng về 1 sau khi thêm xong
        
    //     toast.success("Thêm vào giỏ hàng thành công");
    // };
    const handleAddProduct = async (newBook: BookModel, quantity: number = 1) => {
    // 1. CHỈ CHẶN NẾU VƯỢT QUÁ TỒN KHO VẬT LÝ (Đã xóa block chặn Flash Sale)
    if (currentQuantityInCart + quantity > availableStock) {
        toast.error("Không thể thêm, đã vượt quá số lượng tồn kho!");
        return;
    }

    // 2. Tạo mảng ảo ngay từ đầu để thao tác
    let updatedCart = [...cartList];
    let isExistBook = updatedCart.find(
        (cartItem) => cartItem.book.idBook === newBook.idBook
    );

    if (isExistBook) {
        const newQuantity = isExistBook.quantity + quantity;

        if (isToken()) {
            const request = {
                idCart: isExistBook.idCart,
                quantity: newQuantity,
            };

            try {
                const res = await fetch(endpointBE + `/cart-items/update-item`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(request),
                });

                if (!res.ok) {
                    const message = await getErrorMessage(res);
                    toast.error(message);
                    return; // Lỗi thì dừng luôn, không chạy xuống dưới
                }
            } catch (err) {
                toast.error("Không thể cập nhật giỏ hàng");
                return;
            }
        }
        
        // Cập nhật số lượng vào mảng ảo (chạy cho cả khi login và chưa login)
        updatedCart = updatedCart.map(item =>
            item.book.idBook === newBook.idBook
                ? { ...item, quantity: newQuantity }
                : item
        );

    } else {
        if (isToken()) {
            try {
                const token = localStorage.getItem("token");
                const postPayload = {
                    bookId: newBook.idBook,
                    quantity: quantity,
                };

                const response = await fetch(endpointBE + "/cart-items/add-item", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(postPayload),
                });

                if (!response.ok) {
                    toast.error("Không thể thêm vào giỏ hàng");
                    return;
                }

                const payload = await response.json();
                const idCart = payload?.data ?? payload?.idCart ?? payload;

                // Thêm sách mới vào mảng ảo
                updatedCart.push({
                    idCart: idCart,
                    quantity: quantity,
                    book: newBook,
                });
            } catch (error) {
                toast.error("Không thể thêm vào giỏ hàng");
                return;
            }
        } else {
            // Chưa đăng nhập -> Thêm thẳng vào mảng ảo
            updatedCart.push({
                quantity: quantity,
                book: newBook,
            });
        }
    }

    // ✅ CHỈ LƯU VÀO STATE VÀ LOCALSTORAGE ĐÚNG 1 LẦN Ở ĐÂY
    setCartList(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    const total = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
    setTotalCart(total);
    setQuantity(1); // Reset lại nút chọn số lượng về 1 sau khi thêm xong
    
    toast.success("Thêm vào giỏ hàng thành công");
};
    // Viewer hình ảnh
    const [currentImage, setCurrentImage] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    let imageList: string[] = [];
    if (images !== undefined && images !== null) {
        imageList = images.map((image) => {
            return image.url || image.data;
        }) as string[];
    }

    const openImageViewer = useCallback((index: number) => {
        setCurrentImage(index);
        setIsViewerOpen(true);
    }, []);

    const closeImageViewer = () => {
        setCurrentImage(0);
        setIsViewerOpen(false);
    };

    const [isCheckout, setIsCheckout] = useState(false);
    const [cartItem, setCartItem] = useState<CartItemModel[]>([]);
    const [totalPriceProduct, setTotalPriceProduct] = useState(0);
    
    // function handleBuyNow(newBook: BookModel) {
    //     if(!isToken()) {
    //         toast.warning("Bạn cần đăng nhập để mua hàng");
    //         return;
    //     }
    //     void (async () => {
    //         if (newBook.isFlashSale) {
    //             const maxPerUser = await getFlashSaleMaxPerUser(newBook.idBook);
    //             if (maxPerUser && currentQuantityInCart + quantity > maxPerUser) {
    //                 toast.error(`Flash Sale: tối đa ${maxPerUser} sản phẩm/khách`);
    //                 return;
    //             }
    //         }

    //         setCartItem([{ quantity, book: newBook }]);
    //         setIsCheckout(!isCheckout);
    //         setTotalPriceProduct(newBook.sellPrice * quantity);
    //     })();
    // }
    function handleBuyNow(newBook: BookModel) {
    if(!isToken()) {
        toast.warning("Bạn cần đăng nhập để mua hàng");
        return;
    }

    // Chốt chặn an toàn: Kiểm tra tồn kho vật lý
    if (quantity > availableStock) {
        toast.error("Không thể mua, đã vượt quá số lượng tồn kho!");
        return;
    }

    // Đẩy thẳng vào state để chuyển sang trang Checkout
    setCartItem([{ quantity, book: newBook }]);
    setIsCheckout(!isCheckout);
    
    // Lưu ý: Tính tổng tiền tạm thời ở Frontend. 
    // Khi sang trang Checkout và gọi API tạo đơn, Backend C# sẽ tự động bóc tách số lượng để tính giá (ví dụ: 2 Sale + 1 Gốc)
    setTotalPriceProduct(newBook.sellPrice * quantity);
}
    if (loading) {
        return (
            <div className='container-book container mb-5 py-5 px-5 bg-light'>
                <div className='row'>
                    <div className='col-4'>
                        <Skeleton
                            className='my-3'
                            variant='rectangular'
                            height={400}
                        />
                    </div>
                    <div className='col-8 px-5'>
                        <Skeleton
                            className='my-3'
                            variant='rectangular'
                            height={100}
                        />
                        <Skeleton className='my-3' variant='rectangular' />
                        <Skeleton className='my-3' variant='rectangular' />
                        <Skeleton className='my-3' variant='rectangular' />
                    </div>
                </div>
            </div>
        );
    }

    if (erroring) {
        return (
            <div>
                <h1>Gặp lỗi: {erroring}</h1>
            </div>
        );
    }

    if (book === null) {
        return (
            <div>
                <h1>Sách không tồn tại </h1>
            </div>
        );
    }

    return (
        <>
            {!isCheckout ? (
                <>
                    <div className='container p-2 bg-white my-3 rounded'>
                        <div className='row mt-4 mb-4'>
                            <div className='col-lg-4 col-md-4 col-sm-12'>
                                <Carousel
                                    emulateTouch={true}
                                    swipeable={true}
                                    showIndicators={false}
                                >
                                    {images?.map((image, index) => (
                                        <div
                                            key={index}
                                            onClick={() => openImageViewer(index)}
                                            style={{
                                                width: "100%",
                                                height: "400px",
                                                objectFit: "cover",
                                            }}
                                        >
                                            <img
                                                alt=''
                                                src={
                                                    image.data
                                                        ? image.data
                                                        : image.url
                                                }
                                            />
                                        </div>
                                    ))}
                                </Carousel>
                                {isViewerOpen && (
                                    <ReactSimpleImageViewer
                                        src={imageList}
                                        currentIndex={currentImage}
                                        disableScroll={true}
                                        closeOnClickOutside={true}
                                        onClose={closeImageViewer}
                                        backgroundStyle={{
                                            backgroundColor: "rgba(0,0,0,0.7)",
                                        }}
                                    />
                                )}
                            </div>
                            <div className='col-lg-8 col-md-8 col-sm-12 px-5'>
                                <h2>{book.nameBook}</h2>
                                <div className='d-flex align-items-center'>
                                    <p className='me-5'>
                                        Thể loại:{" "}
                                        <strong>
                                        {genres?.map((genre) => genre.nameGenre).join(", ")}
                                        </strong>
                                    </p>
                                    <p className='ms-5'>
                                        Tác giả: <strong>{book.author}</strong>
                                    </p>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <div className='d-flex align-items-center'>
                                        <RatingStar
                                            readonly={true}
                                            ratingPoint={book.avgRating}
                                        />

                                        <p className='text-danger ms-2 mb-0'>
                                            ({book.avgRating})
                                        </p>
                                    </div>
                                    <div className='d-flex align-items-center'>
                                        <span className='mx-3 mb-1 text-secondary'>
                                            |
                                        </span>
                                    </div>
                                    <div className='d-flex align-items-end justify-content-center '>
                                        <span
                                            style={{
                                                color: "rgb(135,135,135)",
                                                fontSize: "16px",
                                            }}
                                        >
                                            Đã bán
                                        </span>
                                        <span className='fw-bold ms-2'>
                                            {book.soldQuantity}
                                        </span>
                                    </div>
                                </div>
                                <div className='price'>
                                    <span className='discounted-price text-danger me-3'>
                                        <strong style={{ fontSize: "32px" }}>
                                            {book.sellPrice?.toLocaleString()}đ
                                        </strong>
                                    </span>
                                    <span className='original-price small me-3'>
                                        <strong>
                                            <del>{book.listPrice?.toLocaleString()}đ</del>
                                        </strong>
                                    </span>
                                    <h4 className='my-0 d-inline-block'>
                                        <span className='badge bg-danger'>
                                            {book.discountPercent}%
                                        </span>
                                    </h4>
                                </div>
                                <div className='mt-3'>
                                    <div className='d-flex align-items-center mt-3'>
                                        <img
                                            src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/d9e992985b18d96aab90969636ebfd0e.png'
                                            height='20'
                                            alt='free ship'
                                        />
                                        <span className='ms-3'>Miễn phí vận chuyển</span>
                                    </div>
                                </div>
                                <div className='d-flex align-items-center mt-3'>
                                    <strong className='me-5'>Số lượng: </strong>
                                    <SelectQuantity
                                        max={maxAllowed} // ĐÃ ĐỔI TỪ book.quantity SANG maxAllowed
                                        quantity={maxAllowed === 0 ? 0 : quantity}
                                        setQuantity={setQuantity}
                                        add={add}
                                        reduce={reduce}
                                    />
                                    <span className='ms-4'>
                                        {book.quantity} sản phẩm có sẵn
                                    </span>
                                </div>
                                <div className='mt-4 d-flex align-items-center'>
                                    {availableStock === 0 ? (
                                        <Button
                                            variant='outlined'
                                            size='large'
                                            className='me-3'
                                            color='error'
                                        >
                                            Hết hàng
                                        </Button>
                                    ) : maxAllowed <= 0 ? (
                                        <Button
                                            variant='outlined'
                                            size='large'
                                            className='me-3'
                                            color='warning'
                                            disabled
                                        >
                                            Đã thêm tối đa vào giỏ
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant='outlined'
                                                size='large'
                                                startIcon={<ShoppingCartOutlined />}
                                                className='me-3'
                                                onClick={() => handleAddProduct(book, quantity)}
                                            >
                                                Thêm vào giỏ hàng
                                            </Button>
                                            <Button
                                                variant='contained'
                                                size='large'
                                                className='ms-3'
                                                onClick={() => handleBuyNow(book)}
                                            >
                                                Mua ngay
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='container p-4 bg-white my-3 rounded'>
                        <h5 className='my-3'>Mô tả sản phẩm</h5>
                        <hr />
                        <TextEllipsis
                            isShow={true}
                            text={book.description + ""}
                            limit={1000}
                        />
                    </div>
                    <div className='container p-4 bg-white my-3 rounded'>
                        <h5 className='my-3'>Khách hàng đánh giá</h5>
                        <hr />
                        <Comment idBook={idBookNumber} />
                        <hr />
                        <h6 className='my-3'>Xem thêm sách cùng thể loại</h6>
                        {loadingRelatedBooks ? (
                            <div className='row'>
                                <div className='col-md-3 mt-2'>
                                    <Skeleton className='my-3' variant='rectangular' height={400} />
                                </div>
                                <div className='col-md-3 mt-2'>
                                    <Skeleton className='my-3' variant='rectangular' height={400} />
                                </div>
                                <div className='col-md-3 mt-2'>
                                    <Skeleton className='my-3' variant='rectangular' height={400} />
                                </div>
                                <div className='col-md-3 mt-2'>
                                    <Skeleton className='my-3' variant='rectangular' height={400} />
                                </div>
                            </div>
                        ) : relatedBooks.length > 0 ? (
                            <>
                                <div className='d-flex justify-content-end gap-2 mb-2'>
                                    <Button
                                        variant='outlined'
                                        size='small'
                                        onClick={() => scrollRelated("prev")}
                                    >
                                        Trước
                                    </Button>
                                    <Button
                                        variant='outlined'
                                        size='small'
                                        onClick={() => scrollRelated("next")}
                                    >
                                        Sau
                                    </Button>
                                </div>
                                <div
                                    ref={relatedScrollRef}
                                    className='d-flex flex-row flex-nowrap gap-3 overflow-auto pb-2'
                                >
                                    {relatedBooks.map((sach) => (
                                        <SachProps key={sach.idBook} sach={sach} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className='text-muted'>Không có sách liên quan</div>
                        )}
                    </div>
                </>
            ) : (
                <CheckoutPage
                    setIsCheckout={setIsCheckout}
                    cartList={cartItem}
                    totalPriceProduct={totalPriceProduct}
                    isBuyNow={true}
                />
            )}
        </>
    );
};

export default BookDetail;