/* eslint-disable @typescript-eslint/no-redeclare */
import React, { useEffect, useState } from "react";
import { Skeleton, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useConfirm } from "material-ui-confirm";
import { toast } from "react-toastify";

import TextEllipsis from "./text-ellipsis/TextEllipsis";
import SelectQuantity from "./select-quantity/SelectQuantity";

import { isToken } from "../../utils/JwtService";
import { endpointBE } from "../../utils/Constant";
import { useCartItem } from "../../utils/CartItemContext";
import { getErrorMessage } from "../../utils/helperError";
import { getCartAllByIdUser } from "../../../api/CartApi";

import CartItemModel from "../../../models/CartItemModel";
import ImageModel from "../../../models/ImageModel";
import { layToanBoHinhAnhMotSach } from "../../../api/HinhAnhAPI";

interface Props {
  cartItem: CartItemModel;
  handleRemoveBook: (id: number) => void;
}

const BookCartProps: React.FC<Props> = ({ cartItem, handleRemoveBook }) => {
  const { setCartList } = useCartItem();
  const confirm = useConfirm();

  const book = cartItem.book;

  const maxStock =
    typeof book.quantity === "number" && book.quantity > 0
      ? book.quantity
      : undefined;

  // const [quantity, setQuantity] = useState(
  //   maxStock !== undefined
  //     ? Math.min(cartItem.quantity, maxStock)
  //     : cartItem.quantity
  // );
  const safeQuantity =
    cartItem.totalQuantity ??
    ((cartItem.saleQuantity ?? 0) +
      (cartItem.normalQuantity ?? 0));

  const [quantity, setQuantity] = useState(
    maxStock !== undefined
      ? Math.min(safeQuantity, maxStock)
      : safeQuantity
  );
  useEffect(() => {
    const safeQuantity = cartItem.quantity ?? 1;

    setQuantity(
      maxStock !== undefined
        ? Math.min(safeQuantity, maxStock)
        : safeQuantity
    );
  }, [cartItem.quantity, maxStock]);
  const [images, setImages] = useState<ImageModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================== FETCH IMAGE ==================
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await layToanBoHinhAnhMotSach(
          book.idBook ?? book.id
        );
        setImages(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [book.idBook, book.id]);

  const thumbnail =
    images.find((i) => i.isThumbnail)?.url ||
    images.find((i) => i.isThumbnail)?.data;

  // ================== REMOVE ==================
  const handleConfirmRemove = () => {
    confirm({
      title: "Xoá sản phẩm",
      description: "Bạn muốn bỏ sản phẩm này khỏi giỏ hàng không",
      confirmationText: "Xoá",
      cancellationText: "Huỷ",
    })
      .then(async () => {
        handleRemoveBook(book.idBook);

        if (!isToken()) return;

        const token = localStorage.getItem("token");
        if (!cartItem.idCart) return;

        try {
          await fetch(`${endpointBE}/cart-items/${cartItem.idCart}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "content-type": "application/json",
            },
          });
        } catch (err) {
          console.error("Lỗi xoá cart:", err);
        }
      })
      .catch(() => { });
  };

  // ================== UPDATE QUANTITY ==================
  const handleUpdateQuantity = async (
    idBook: number,
    delta: number
  ): Promise<boolean> => {
    const cartData = localStorage.getItem("cart");
    const cart: CartItemModel[] = cartData ? JSON.parse(cartData) : [];

    const item = cart.find((i) => i.book.idBook === idBook);
    if (!item) return false;

    const currentQty =
      item.totalQuantity ??
      ((item.saleQuantity ?? 0) + (item.normalQuantity ?? 0));

    const nextQuantity = currentQty + delta;
    if (nextQuantity <= 0) return false;

    if (isToken()) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${endpointBE}/cart-items/update-item`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            idCart: cartItem.idCart,
            quantity: nextQuantity,
          }),
        });

        if (!res.ok) {
          const message = await getErrorMessage(res);
          toast.error(message);
          return false;
        }

        let dto: any = undefined;
        try {
          const payload = await res.json();
          dto = payload?.data ?? payload;
        } catch {
          dto = undefined;
        }

        if (dto && typeof dto === "object") {
          item.idCart = dto.idCart ?? dto.IdCart ?? item.idCart;
          item.quantity = dto.quantity ?? dto.Quantity ?? nextQuantity;
          item.totalQuantity = dto.totalQuantity ?? dto.TotalQuantity ?? item.quantity;
          // Fallback an toàn: giữ saleQuantity cũ, cap nếu quantity giảm
          const prevSaleQty = item.saleQuantity ?? 0;
          item.saleQuantity = dto.saleQuantity ?? dto.SaleQuantity
            ?? Math.min(prevSaleQty, item.quantity);
          item.normalQuantity = dto.normalQuantity ?? dto.NormalQuantity
            ?? Math.max(0, item.quantity - (item.saleQuantity ?? 0));
          item.flashSalePrice = dto.flashSalePrice ?? dto.FlashSalePrice ?? item.flashSalePrice;
          item.normalPrice = dto.normalPrice ?? dto.NormalPrice ?? item.normalPrice;
          item.totalItemPrice = dto.totalItemPrice ?? dto.TotalItemPrice ?? item.totalItemPrice;
          item.flashSaleItemId = dto.flashSaleItemId ?? dto.FlashSaleItemId ?? item.flashSaleItemId;
        } else {
          item.quantity = nextQuantity;
        }

        // Lưu tạm fallback trước
        localStorage.setItem("cart", JSON.stringify(cart));
        setCartList([...cart]);

        // Re-fetch cart từ BE để lấy đúng split sale/normal (BE biết quota)
        try {
          const freshCart = await getCartAllByIdUser();
          localStorage.setItem("cart", JSON.stringify(freshCart));
          setCartList([...freshCart]);
        } catch { /* giữ fallback data */ }

        return true;
      } catch {
        toast.error("Không thể cập nhật số lượng");
        return false;
      }
    }

    // guest cart — giữ saleQuantity cũ, chỉ cap khi quantity giảm
    item.quantity = nextQuantity;
    const prevSaleQtyGuest = item.saleQuantity ?? 0;
    item.saleQuantity = Math.min(prevSaleQtyGuest, nextQuantity);
    item.normalQuantity = Math.max(0, nextQuantity - item.saleQuantity);
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartList(cart);

    return true;
  };

  const add = async () => {
    if (!quantity) return;

    if (maxStock === undefined || quantity < maxStock) {
      const ok = await handleUpdateQuantity(book.idBook, 1);
      if (ok) setQuantity(quantity + 1);
    } else {
      toast.warning("Số lượng tồn kho không đủ");
    }
  };

  const reduce = async () => {
    if (quantity <= 1) {
      handleConfirmRemove();
      return;
    }

    const ok = await handleUpdateQuantity(book.idBook, -1);
    if (ok) setQuantity(quantity - 1);
  };

  // ================== RENDER ==================
  if (loading) return <Skeleton className="my-3" variant="rectangular" />;
  if (error) return <h4>Lỗi ...</h4>;

  return (
    <>
      <div className="col-12 col-md">
        <div className="d-flex">
          <Link to={`/books/${book.idBook}`}>
            <img
              src={thumbnail}
              alt={book.nameBook}
              style={{ width: 80, minWidth: 80 }}
            />
          </Link>

          <div className="d-flex flex-column pb-2 ms-2">
            <Link to={`/books/${book.idBook}`}>
              <Tooltip title={book.nameBook} arrow>
                <span>
                  <TextEllipsis text={book.nameBook + " "} limit={38} />
                </span>
              </Tooltip>
            </Link>

            <div className="mt-auto">
              <span className="text-danger">
                <strong style={{ fontSize: 20 }}>
                  {(book.sellPrice ?? 0).toLocaleString()}đ
                </strong>
              </span>

              <span className="ms-2 small">
                <del>{(book.listPrice ?? 0).toLocaleString()}đ</del>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Số lượng */}
      <div className="col-12 col-md-3 d-flex justify-content-start justify-content-md-center align-items-center mt-2 mt-md-0">
        <span className="d-md-none me-2 text-muted small">Số lượng:</span>
        <SelectQuantity
          max={book.quantity}
          quantity={quantity}
          setQuantity={setQuantity}
          add={add}
          reduce={reduce}
          book={book}
        />
      </div>

      {/* Số tiền */}
      <div className="col-12 col-md-2 d-flex justify-content-start justify-content-md-center align-items-center mt-1 mt-md-0">
        <span className="d-md-none me-2 text-muted small">Thành tiền:</span>
        <strong className="text-danger">
          {(() => {
            const flashPrice =
              cartItem.flashSalePrice ??
              book.flashSalePrice ??
              0;

            const normalPrice =
              cartItem.normalPrice ??
              book.sellPrice ??
              0;

            // quantity hiện tại UI
            const currentQuantity = quantity ?? 0;

            // số lượng flash sale ban đầu
            const saleQty =
              Math.min(
                currentQuantity,
                cartItem.saleQuantity ?? 0
              );

            // phần còn lại giá thường
            const normalQty =
              currentQuantity - saleQty;

            const total =
              (saleQty * flashPrice) +
              (normalQty * normalPrice);

            return total.toLocaleString();
          })()}đ
        </strong>
      </div>

      {/* Xoá */}
      <div className="col-12 col-md-2 d-flex justify-content-start justify-content-md-center align-items-center mt-1 mt-md-0 mb-2">
        <Tooltip title="Xoá sản phẩm" arrow>
          <button
            onClick={handleConfirmRemove}
            style={{ background: "transparent", border: 0 }}
          >
            <DeleteOutlineOutlinedIcon sx={{ cursor: "pointer" }} />
          </button>
        </Tooltip>
      </div>

      <hr className="my-2" />
    </>
  );
};

export default BookCartProps;