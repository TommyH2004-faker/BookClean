
// import {
//   Button,
//   FormControl,
//   FormControlLabel,
//   Radio,
//   RadioGroup,
//   TextField,
// } from "@mui/material";
// import React, { FormEvent, useEffect, useState } from "react";

// import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// import { get1User } from "../../api/UserApi";
// import { toast } from "react-toastify";

// import useScrollToTop from "../../hooks/ScrollToTop";
// import { useCartItem } from "../../layouts/utils/CartItemContext";

// import { getIdUserByToken } from "../../layouts/utils/JwtService";
// import { endpointBE } from "../../layouts/utils/Constant";
// import { checkPhoneNumber } from "../../layouts/utils/Validation";
// import { BookHorizontal } from "../../layouts/product/components/BookHorizontalProps";
// import { CheckoutSuccess } from "./CheckoutSuccess";
// import { UserModel } from "../../models/UserModel";
// import CartItemModel from "../../models/CartItemModel";
// import { getErrorMessage } from "../../layouts/utils/helperError";

// interface CheckoutPageProps {
//   setIsCheckout: any;
//   cartList: CartItemModel[];
//   totalPriceProduct: number;
//   isBuyNow?: boolean;
// }

// export const CheckoutPage: React.FC<CheckoutPageProps> = (props) => {
//   useScrollToTop();

//   const { setCartList, setTotalCart } = useCartItem();

//   const [isSuccessPayment, setIsSuccessPayment] = useState(false);

//   const [payment, setPayment] = React.useState(1); // 1: COD, 2: VNPAY
//   const [fullName, setFullName] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [deliveryAddress, setDeliveryAddress] = useState("");
//   const [note, setNote] = useState("");

//   const [errorPhoneNumber, setErrorPhoneNumber] = useState("");

//   const handleChangePayment = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setPayment(parseInt((event.target as HTMLInputElement).value));
//   };

//   const [user, setUser] = useState<UserModel>();
//   useEffect(() => {
//     const idUser = getIdUserByToken();
//     get1User(idUser)
//       .then((response) => {
//         setUser(response);
//         setFullName(response.firstName + " " + response.lastName);
//         setPhoneNumber(response.phoneNumber ? response.phoneNumber : "");
//         setDeliveryAddress(response.deliveryAddress ? response.deliveryAddress : "");
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   }, []);

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     if (errorPhoneNumber.length > 0) {
//       toast.error("Số điện thoại không hợp lệ");
//       return;
//     }

//     const token = localStorage.getItem("token");
//     if (!token) {
//       toast.error("Bạn chưa đăng nhập");
//       return;
//     }

//     if (!props.cartList || props.cartList.length === 0) {
//       toast.error("Giỏ hàng trống");
//       return;
//     }

//     const booksRequest = props.cartList.map((cartItem) => ({
//       // BE đang đọc item.Book.IdBook và item.Book.NameBook để báo lỗi
//       book: cartItem.book,
//       quantity: cartItem.quantity,

//       // Các field BE cần để reserve flash sale + tính giá an toàn
//       saleQuantity: cartItem.saleQuantity ?? 0,
//       normalQuantity:
//         cartItem.normalQuantity ??
//         Math.max(0, cartItem.quantity - (cartItem.saleQuantity ?? 0)),
//       flashSalePrice: cartItem.flashSalePrice ?? null,
//       normalPrice: cartItem.normalPrice ?? cartItem.book.sellPrice,
//       flashSaleItemId: cartItem.flashSaleItemId ?? null,
//     }));

//     const request = {
//       idUser: getIdUserByToken(), 
//       idPayment: payment,
//       fullName,
//       phoneNumber,
//       email: user?.email ?? "",
//       deliveryAddress,
//       totalPriceProduct: props.totalPriceProduct,
//       totalPrice: props.totalPriceProduct,
//       book: booksRequest,
//       note,
//     };
//     console.log("PAYLOAD GỬI LÊN BE KHI THANH TOÁN:", JSON.stringify(request, null, 2));
//     try {
//       const res = await fetch(endpointBE + "/order/add-order", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "content-type": "application/json",
//         },
//         body: JSON.stringify(request),
//       });

//       if (!res.ok) {
//         const message = await getErrorMessage(res);
//         throw new Error(message || "Checkout failed");
//       }

//       let json: any = undefined;
//       try {
//         json = await res.json();
//       } catch {
//         json = undefined;
//       }

//       const paymentUrl = json?.data?.paymentUrl ?? json?.paymentUrl;

//       // VNPAY: BE trả PaymentUrl => redirect sang cổng VNPAY
//       if (payment === 2) {
//         if (!paymentUrl) {
//           throw new Error("Không nhận được paymentUrl từ server");
//         }
//         window.location.replace(paymentUrl);
//         return;
//       }

//       // COD: đặt xong -> clear local UI (BE đã xoá cart DB)
//       if (!props.isBuyNow) {
//         localStorage.removeItem("cart");
//         setCartList([]);
//         setTotalCart(0);
//       }

//       setIsSuccessPayment(true);
//       toast.success("Đặt hàng thành công");
//     } catch (error: any) {
//       console.log(error);
//       toast.error(error?.message ?? "Thanh toán thất bại");
//     }
//   }

//   return (
//     <>
//       {!isSuccessPayment ? (
//         <form onSubmit={handleSubmit}>
//           <div className="container bg-light my-3 rounded-3 p-3">
//             <strong className="fs-6">ĐỊA CHỈ GIAO HÀNG</strong>
//             <hr />
//             <div className="row">
//               <div className="col-lg-6 col-md-6 col-sm-12">
//                 <TextField
//                   required={true}
//                   fullWidth
//                   type="text"
//                   label="Họ và tên người nhận"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   className="input-field"
//                 />
//                 <TextField
//                   error={errorPhoneNumber.length > 0}
//                   helperText={errorPhoneNumber}
//                   required={true}
//                   fullWidth
//                   type="text"
//                   label="Số điện thoại"
//                   value={phoneNumber}
//                   onChange={(e) => setPhoneNumber(e.target.value)}
//                   onBlur={(e: any) => {
//                     checkPhoneNumber(setErrorPhoneNumber, e.target.value);
//                   }}
//                   className="input-field"
//                 />
//               </div>
//               <div className="col-lg-6 col-md-6 col-sm-12">
//                 <TextField
//                   required={true}
//                   fullWidth
//                   type="text"
//                   label="Email"
//                   value={user?.email}
//                   disabled
//                   className="input-field"
//                 />
//                 <TextField
//                   required={true}
//                   fullWidth
//                   type="text"
//                   label="Địa chỉ nhận hàng"
//                   value={deliveryAddress}
//                   onChange={(e) => setDeliveryAddress(e.target.value)}
//                   className="input-field"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="container bg-light my-3 rounded-3 p-3">
//             <strong className="fs-6">PHƯƠNG THỨC THANH TOÁN</strong>
//             <hr />
//             <FormControl>
//               <RadioGroup
//                 aria-labelledby="demo-controlled-radio-buttons-group"
//                 name="controlled-radio-buttons-group"
//                 value={payment}
//                 onChange={handleChangePayment}
//               >
//                 <FormControlLabel
//                   value={1}
//                   control={<Radio />}
//                   label={
//                     <div style={{ display: "flex", alignItems: "center" }}>
//                       <img
//                         src="https://cdn0.fahasa.com/skin/frontend/base/default/images/payment_icon/ico_cashondelivery.svg?q=10311"
//                         alt="Cash on Delivery"
//                         style={{ width: "40px", marginRight: "10px" }}
//                       />
//                       Thanh toán tiền mặt khi nhận hàng (COD)
//                     </div>
//                   }
//                 />

//                 <FormControlLabel
//                   value={2}
//                   control={<Radio />}
//                   label={
//                     <div style={{ display: "flex", alignItems: "center" }}>
//                       <img
//                         src="https://cdn0.fahasa.com/skin/frontend/base/default/images/payment_icon/ico_vnpay.svg?q=10311"
//                         alt="VNPAY"
//                         style={{ width: "40px", marginRight: "10px" }}
//                       />
//                       Thanh toán bằng VNPAY
//                     </div>
//                   }
//                 />

//                 <FormControlLabel
//                 value={3} // Giá trị phân biệt cho PayPal (ví dụ là 3 nếu VNPAY là 2)
//                 control={<Radio />}
//                 label={
//                   <div style={{ display: "flex", alignItems: "center" }}>
//                     <img
//                       // Đường dẫn logo PayPal chuẩn (SVG)
//                       src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
//                       alt="PayPal"
//                       // Giữ nguyên kích thước và khoảng cách tương tự ảnh cũ
//                       style={{ width: "40px", marginRight: "10px" }}
//                     />
//                     Thanh toán bằng PayPal
//                   </div>
//                 }
//               />

//               </RadioGroup>
//             </FormControl>
//           </div>

//           <div className="container bg-light my-3 rounded-3 p-3">
//             <strong className="fs-6">MÃ KHUYẾN GIẢM GIÁ</strong>
//             <hr />
//             <div className="d-flex align-items-end w-50">
//               <TextField
//                 className="w-50"
//                 id="standard-basic"
//                 label="Mã khuyến mãi (nếu có): "
//                 variant="standard"
//                 value={""}
//               />
//               <Button className="ms-3" variant="outlined">
//                 Áp dụng
//               </Button>
//             </div>
//           </div>

//           <div className="container bg-light my-3 rounded-3 p-3">
//             <strong className="fs-6">GHI CHÚ</strong>
//             <hr />
//             <TextField
//               className="w-100"
//               id="standard-basic"
//               label="Ghi chú"
//               variant="outlined"
//               multiline
//               minRows={3}
//               maxRows={4}
//               value={note}
//               onChange={(e) => setNote(e.target.value)}
//             />
//           </div>

//           <div className="container bg-light my-3 rounded-3 p-3">
//             <strong className="fs-6">KIỂM TRA LẠI ĐƠN HÀNG</strong>
//             <hr />
//             <div className="row my-3">
//               <div className="col">
//                 <span className="ms-3">Sản phẩm</span>
//               </div>
//               <div className="col-2 text-center">Số lượng</div>
//               <div className="col-2 text-center">Tổng tiền</div>
//             </div>

//             {props.cartList.map((cartItem) => (
//               <BookHorizontal key={cartItem.idCart} cartItem={cartItem}  type="cart" />
//             ))}
//           </div>

//           <footer
//             className="fixed-bottom bottom-0 shadow-4-strong bg-light"
//             style={{ height: "175px" }}
//           >
//             <div className="container my-3">
//               <div className="row">
//                 <div className="me-3 col text-end">Thành tiền</div>
//                 <div className="ms-3 col-2 text-end">
//                   {props.totalPriceProduct.toLocaleString("vi-vn")} đ
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="me-3 col text-end">Phí vận chuyển</div>
//                 <div className="ms-3 col-2 text-end">0 đ</div>
//               </div>
//               <div className="row">
//                 <div className="me-3 col text-end">
//                   <strong>Tổng số tiền (gồm VAT)</strong>
//                 </div>
//                 <div className="ms-3 col-2 text-end text-danger fs-5">
//                   <strong>{props.totalPriceProduct.toLocaleString("vi-vn")} đ</strong>
//                 </div>
//               </div>

//               <hr className="mt-3" />

//               <div className="row">
//                 <div className="col d-flex align-items-center">
//                   <span
//                     style={{ cursor: "pointer" }}
//                     onClick={() => props.setIsCheckout(false)}
//                   >
//                     <ArrowBackIcon />
//                     <strong className="ms-2">Quay về giỏ hàng</strong>
//                   </span>
//                 </div>
//                 <div className="col-4">
//                   <Button type="submit" variant="contained" sx={{ width: "100%" }}>
//                     Xác nhận thanh toán
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </footer>
//         </form>
//       ) : (
//         <CheckoutSuccess />
//       )}
//     </>
//   );
// };
import {
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import React, { FormEvent, useEffect, useState } from "react";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { get1User } from "../../api/UserApi";
import { toast } from "react-toastify";

import useScrollToTop from "../../hooks/ScrollToTop";
import { useCartItem } from "../../layouts/utils/CartItemContext";

import { getIdUserByToken } from "../../layouts/utils/JwtService";
import { endpointBE } from "../../layouts/utils/Constant";
import { checkPhoneNumber } from "../../layouts/utils/Validation";
import { BookHorizontal } from "../../layouts/product/components/BookHorizontalProps";
import { CheckoutSuccess } from "./CheckoutSuccess";
import { UserModel } from "../../models/UserModel";
import CartItemModel from "../../models/CartItemModel";
import { getErrorMessage } from "../../layouts/utils/helperError";

interface CheckoutPageProps {
  setIsCheckout: any;
  cartList: CartItemModel[];
  totalPriceProduct: number;
  isBuyNow?: boolean;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = (props) => {
  useScrollToTop();

  const { setCartList, setTotalCart } = useCartItem();

  const [isSuccessPayment, setIsSuccessPayment] = useState(false);

  // 1: COD
  // 2: VNPAY
  // 3: PAYPAL
  const [payment, setPayment] = React.useState(1);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [note, setNote] = useState("");

  const [errorPhoneNumber, setErrorPhoneNumber] = useState("");

  const handleChangePayment = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPayment(parseInt((event.target as HTMLInputElement).value));
  };

  const [user, setUser] = useState<UserModel>();

  useEffect(() => {
    const idUser = getIdUserByToken();

    get1User(idUser)
      .then((response) => {
        setUser(response);

        setFullName(
          `${response.firstName ?? ""} ${response.lastName ?? ""}`
        );

        setPhoneNumber(response.phoneNumber ?? "");

        setDeliveryAddress(response.deliveryAddress ?? "");
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // =========================
    // VALIDATE
    // =========================
    if (errorPhoneNumber.length > 0) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Bạn chưa đăng nhập");
      return;
    }

    if (!props.cartList || props.cartList.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    // =========================
    // REQUEST
    // =========================
    const booksRequest = props.cartList.map((cartItem) => ({
      book: cartItem.book,
      quantity: cartItem.quantity,

      saleQuantity: cartItem.saleQuantity ?? 0,

      normalQuantity:
        cartItem.normalQuantity ??
        Math.max(
          0,
          cartItem.quantity - (cartItem.saleQuantity ?? 0)
        ),

      flashSalePrice: cartItem.flashSalePrice ?? null,

      normalPrice:
        cartItem.normalPrice ?? cartItem.book.sellPrice,

      flashSaleItemId:
        cartItem.flashSaleItemId ?? null,
    }));

    const request = {
      idUser: getIdUserByToken(),

      idPayment: payment,

      fullName,
      phoneNumber,

      email: user?.email ?? "",

      deliveryAddress,

      totalPriceProduct: props.totalPriceProduct,

      totalPrice: props.totalPriceProduct,

      book: booksRequest,

      note,
    };

    console.log(
      "PAYLOAD GỬI LÊN BE:",
      JSON.stringify(request, null, 2)
    );

    try {
      const res = await fetch(
        endpointBE + "/order/add-order",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!res.ok) {
        const message = await getErrorMessage(res);

        throw new Error(
          message || "Checkout failed"
        );
      }

      let json: any = undefined;

      try {
        json = await res.json();
      } catch {
        json = undefined;
      }

      console.log("CHECKOUT RESPONSE:", json);

      const paymentUrl =
        json?.data?.paymentUrl ??
        json?.paymentUrl;

      // ====================================================
      // VNPAY
      // KHÔNG ĐƯỢC XOÁ GIỎ HÀNG Ở ĐÂY
      // CHỈ REDIRECT
      // ====================================================
      if (payment === 2) {
        if (!paymentUrl) {
          throw new Error(
            "Không nhận được paymentUrl từ server"
          );
        }

        window.location.href = paymentUrl;

        return;
      }

      // ====================================================
      // PAYPAL
      // ====================================================
      if (payment === 3) {
        if (!paymentUrl) {
          throw new Error(
            "Không nhận được paymentUrl PayPal"
          );
        }

        window.location.href = paymentUrl;

        return;
      }

      // ====================================================
      // COD
      // CHỈ COD MỚI XOÁ GIỎ HÀNG
      // ====================================================
      if (payment === 1 && !props.isBuyNow) {
        localStorage.removeItem("cart");

        setCartList([]);

        setTotalCart(0);
      }

      setIsSuccessPayment(true);

      toast.success("Đặt hàng thành công");
    } catch (error: any) {
      console.log(error);

      toast.error(
        error?.message ?? "Thanh toán thất bại"
      );
    }
  }

  return (
    <>
      {!isSuccessPayment ? (
        <form onSubmit={handleSubmit}>
          {/* ĐỊA CHỈ */}
          <div className="container bg-light my-3 rounded-3 p-3">
            <strong className="fs-6">
              ĐỊA CHỈ GIAO HÀNG
            </strong>

            <hr />

            <div className="row">
              <div className="col-lg-6 col-md-6 col-sm-12">
                <TextField
                  required
                  fullWidth
                  type="text"
                  label="Họ và tên người nhận"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  className="input-field"
                />

                <TextField
                  error={errorPhoneNumber.length > 0}
                  helperText={errorPhoneNumber}
                  required
                  fullWidth
                  type="text"
                  label="Số điện thoại"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value)
                  }
                  onBlur={(e: any) => {
                    checkPhoneNumber(
                      setErrorPhoneNumber,
                      e.target.value
                    );
                  }}
                  className="input-field"
                />
              </div>

              <div className="col-lg-6 col-md-6 col-sm-12">
                <TextField
                  required
                  fullWidth
                  type="text"
                  label="Email"
                  value={user?.email ?? ""}
                  disabled
                  className="input-field"
                />

                <TextField
                  required
                  fullWidth
                  type="text"
                  label="Địa chỉ nhận hàng"
                  value={deliveryAddress}
                  onChange={(e) =>
                    setDeliveryAddress(
                      e.target.value
                    )
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* THANH TOÁN */}
          <div className="container bg-light my-3 rounded-3 p-3">
            <strong className="fs-6">
              PHƯƠNG THỨC THANH TOÁN
            </strong>

            <hr />

            <FormControl>
              <RadioGroup
                value={payment}
                onChange={handleChangePayment}
              >
                {/* COD */}
                <FormControlLabel
                  value={1}
                  control={<Radio />}
                  label={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src="https://cdn0.fahasa.com/skin/frontend/base/default/images/payment_icon/ico_cashondelivery.svg?q=10311"
                        alt="COD"
                        style={{
                          width: "40px",
                          marginRight: "10px",
                        }}
                      />

                      Thanh toán tiền mặt khi nhận hàng
                    </div>
                  }
                />

                {/* VNPAY */}
                <FormControlLabel
                  value={2}
                  control={<Radio />}
                  label={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src="https://cdn0.fahasa.com/skin/frontend/base/default/images/payment_icon/ico_vnpay.svg?q=10311"
                        alt="VNPAY"
                        style={{
                          width: "40px",
                          marginRight: "10px",
                        }}
                      />

                      Thanh toán bằng VNPAY
                    </div>
                  }
                />

                {/* PAYPAL */}
                <FormControlLabel
                  value={3}
                  control={<Radio />}
                  label={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                        alt="PayPal"
                        style={{
                          width: "40px",
                          marginRight: "10px",
                        }}
                      />

                      Thanh toán bằng PayPal
                    </div>
                  }
                />
              </RadioGroup>
            </FormControl>
          </div>

          {/* GHI CHÚ */}
          <div className="container bg-light my-3 rounded-3 p-3">
            <strong className="fs-6">GHI CHÚ</strong>

            <hr />

            <TextField
              className="w-100"
              label="Ghi chú"
              variant="outlined"
              multiline
              minRows={3}
              maxRows={4}
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
            />
          </div>

          {/* ĐƠN HÀNG */}
          <div className="container bg-light my-3 rounded-3 p-3">
            <strong className="fs-6">
              KIỂM TRA LẠI ĐƠN HÀNG
            </strong>

            <hr />

            <div className="row my-3">
              <div className="col">
                <span className="ms-3">
                  Sản phẩm
                </span>
              </div>

              <div className="col-2 text-center">
                Số lượng
              </div>

              <div className="col-2 text-center">
                Tổng tiền
              </div>
            </div>

            {props.cartList.map((cartItem) => (
              <BookHorizontal
                key={cartItem.idCart}
                cartItem={cartItem}
                type="cart"
              />
            ))}
          </div>

          {/* FOOTER */}
          <footer
            className="fixed-bottom bottom-0 shadow-4-strong bg-light"
            style={{ height: "175px" }}
          >
            <div className="container my-3">
              <div className="row">
                <div className="me-3 col text-end">
                  Thành tiền
                </div>

                <div className="ms-3 col-2 text-end">
                  {props.totalPriceProduct.toLocaleString(
                    "vi-vn"
                  )}{" "}
                  đ
                </div>
              </div>

              <div className="row">
                <div className="me-3 col text-end">
                  Phí vận chuyển
                </div>

                <div className="ms-3 col-2 text-end">
                  0 đ
                </div>
              </div>

              <div className="row">
                <div className="me-3 col text-end">
                  <strong>
                    Tổng số tiền (gồm VAT)
                  </strong>
                </div>

                <div className="ms-3 col-2 text-end text-danger fs-5">
                  <strong>
                    {props.totalPriceProduct.toLocaleString(
                      "vi-vn"
                    )}{" "}
                    đ
                  </strong>
                </div>
              </div>

              <hr className="mt-3" />

              <div className="row">
                <div className="col d-flex align-items-center">
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      props.setIsCheckout(false)
                    }
                  >
                    <ArrowBackIcon />

                    <strong className="ms-2">
                      Quay về giỏ hàng
                    </strong>
                  </span>
                </div>

                <div className="col-4">
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ width: "100%" }}
                  >
                    Xác nhận thanh toán
                  </Button>
                </div>
              </div>
            </div>
          </footer>
        </form>
      ) : (
        <CheckoutSuccess />
      )}
    </>
  );
};