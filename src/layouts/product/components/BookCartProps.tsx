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

  const [quantity, setQuantity] = useState(
    book.quantity !== undefined
      ? Math.min(cartItem.quantity, book.quantity)
      : cartItem.quantity
  );

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
      .catch(() => {});
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

    const nextQuantity = item.quantity + delta;
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
      } catch {
        toast.error("Không thể cập nhật số lượng");
        return false;
      }
    }

    item.quantity = nextQuantity;
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartList(cart);

    return true;
  };

  const add = async () => {
    if (!quantity) return;

    if (quantity < (book.quantity ?? 1)) {
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
      <div className="col">
        <div className="d-flex">
          <Link to={`/book/${book.idBook}`}>
            <img
              src={thumbnail}
              alt={book.nameBook}
              style={{ width: 100 }}
            />
          </Link>

          <div className="d-flex flex-column pb-2">
            <Link to={`/book/${book.idBook}`}>
              <Tooltip title={book.nameBook} arrow>
                <span>
                  <TextEllipsis text={book.nameBook + " "} limit={38} />
                </span>
              </Tooltip>
            </Link>

            <div className="mt-auto">
              <span className="text-danger">
                <strong style={{ fontSize: 22 }}>
                  {book.sellPrice.toLocaleString()}đ
                </strong>
              </span>

              <span className="ms-3 small">
                <del>{book.listPrice.toLocaleString()}đ</del>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="col-3 d-flex justify-content-center align-items-center">
        <SelectQuantity
          max={book.quantity}
          quantity={quantity}
          setQuantity={setQuantity}
          add={add}
          reduce={reduce}
          book={book}
        />
      </div>

      <div className="col-2 text-center my-auto">
        <strong className="text-danger">
          {(quantity * book.sellPrice).toLocaleString()}đ
        </strong>
      </div>

      <div className="col-2 text-center my-auto">
        <Tooltip title="Xoá sản phẩm" arrow>
          <button
            onClick={handleConfirmRemove}
            style={{ background: "transparent", border: 0 }}
          >
            <DeleteOutlineOutlinedIcon sx={{ cursor: "pointer" }} />
          </button>
        </Tooltip>
      </div>

      <hr className="my-3" />
    </>
  );
};

export default BookCartProps;