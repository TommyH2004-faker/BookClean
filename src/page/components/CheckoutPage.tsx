
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
// // ✅ BE đã xoá cart DB khi tạo order thành công => không cần clearMyCart nữa
// // import { clearMyCart } from "../../api/CartApi";

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
//       book: cartItem.book, // phải có IdBook
//       quantity: cartItem.quantity,
//     }));

//     const request = {
//       idUser: getIdUserByToken(), // có thể gửi, BE sẽ check khớp token
//       idPayment: payment,
//       fullName,
//       phoneNumber,
//       email: user?.email ?? "",
//       deliveryAddress,
//       totalPriceProduct: props.totalPriceProduct,
//       totalPrice: props.totalPriceProduct, //  BE dùng TotalPrice để tạo Amount VNPAY
//       book: booksRequest,
//       note,
//     };

//     try {
//       const res = await fetch(endpointBE + "/order/add-order", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "content-type": "application/json",
//         },
//         body: JSON.stringify(request),
//       });

//       const json = await res.json();
//       if (!res.ok) throw new Error(json?.message ?? "Checkout failed");

//       const paymentUrl = json?.data?.paymentUrl;

//       //  VNPAY: BE trả PaymentUrl => redirect sang cổng VNPAY
//       if (payment === 2) {
//         if (!paymentUrl) {
//           throw new Error("Không nhận được paymentUrl từ server");
//         }

//         //  KHÔNG clear local ở đây nếu bạn muốn clear khi success/fail return về FE
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
//               <BookHorizontal key={cartItem.idCart} cartItem={cartItem} />
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

  const [payment, setPayment] = React.useState(1); // 1: COD, 2: VNPAY
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [note, setNote] = useState("");

  const [errorPhoneNumber, setErrorPhoneNumber] = useState("");

  const handleChangePayment = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPayment(parseInt((event.target as HTMLInputElement).value));
  };

  const [user, setUser] = useState<UserModel>();
  useEffect(() => {
    const idUser = getIdUserByToken();
    get1User(idUser)
      .then((response) => {
        setUser(response);
        setFullName(response.firstName + " " + response.lastName);
        setPhoneNumber(response.phoneNumber ? response.phoneNumber : "");
        setDeliveryAddress(response.deliveryAddress ? response.deliveryAddress : "");
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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

    const booksRequest = props.cartList.map((cartItem) => ({
      book: cartItem.book, // phải có IdBook
      quantity: cartItem.quantity,
    }));

    // =========================================================
    // 🔥 ĐOẠN SỬA LỖI: Lấy FlashSaleItemId để gửi lên Backend
    // =========================================================
    let flashSaleIdValue = undefined;

    // Nếu giỏ hàng chỉ có 1 sản phẩm và sản phẩm đó đang được Flash Sale
    if (props.cartList.length === 1 && props.cartList[0].book.isFlashSale) {
        // Tuỳ thuộc vào cách bạn đặt tên biến trong BookModel, có thể là flashSaleItemId, idFlashSaleItem, hoặc id. 
        // Ta sẽ bắt an toàn các trường hợp:
        const targetBook: any = props.cartList[0].book;
        flashSaleIdValue = targetBook.flashSaleItemId || targetBook.idFlashSaleItem || targetBook.flashSaleId || undefined;
    }

    const request = {
      idUser: getIdUserByToken(), 
      idPayment: payment,
      fullName,
      phoneNumber,
      email: user?.email ?? "",
      deliveryAddress,
      totalPriceProduct: props.totalPriceProduct,
      totalPrice: props.totalPriceProduct, 
      
      flashSaleItemId: flashSaleIdValue, 

      book: booksRequest,
      note,
    };
console.log("PAYLOAD GỬI LÊN BE KHI THANH TOÁN:", JSON.stringify(request, null, 2));
    try {
      const res = await fetch(endpointBE + "/order/add-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? "Checkout failed");

      const paymentUrl = json?.data?.paymentUrl;

      // VNPAY: BE trả PaymentUrl => redirect sang cổng VNPAY
      if (payment === 2) {
        if (!paymentUrl) {
          throw new Error("Không nhận được paymentUrl từ server");
        }
        window.location.replace(paymentUrl);
        return;
      }

      // COD: đặt xong -> clear local UI (BE đã xoá cart DB)
      if (!props.isBuyNow) {
        localStorage.removeItem("cart");
        setCartList([]);
        setTotalCart(0);
      }

      setIsSuccessPayment(true);
      toast.success("Đặt hàng thành công");
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message ?? "Thanh toán thất bại");
    }
  }

  return (
    <>
      {!isSuccessPayment ? (
        <form onSubmit={handleSubmit}>
          <div className="container bg-light my-3 rounded-3 p-3">
            <strong className="fs-6">ĐỊA CHỈ GIAO HÀNG</strong>
            <hr />
            <div className="row">
              <div className="col-lg-6 col-md-6 col-sm-12">
                <TextField
                  required={true}
                  fullWidth
                  type="text"
                  label="Họ và tên người nhận"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                />
                <TextField
                  error={errorPhoneNumber.length > 0}
                  helperText={errorPhoneNumber}
                  required={true}
                  fullWidth
                  type="text"
                  label="Số điện thoại"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onBlur={(e: any) => {
                    checkPhoneNumber(setErrorPhoneNumber, e.target.value);
                  }}
                  className="input-field"
                />
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12">
                <TextField
                  required={true}
                  fullWidth
                  type="text"
                  label="Email"
                  value={user?.email}
                  disabled
                  className="input-field"
                />
                <TextField
                  required={true}
                  fullWidth
                  type="text"
                  label="Địa chỉ nhận hàng"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="container bg-light my-3 rounded-3 p-3">
            <strong className="fs-6">PHƯƠNG THỨC THANH TOÁN</strong>
            <hr />
            <FormControl>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={payment}
                onChange={handleChangePayment}
              >
                <FormControlLabel
                  value={1}
                  control={<Radio />}
                  label={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src="https://cdn0.fahasa.com/skin/frontend/base/default/images/payment_icon/ico_cashondelivery.svg?q=10311"
                        alt="Cash on Delivery"
                        style={{ width: "40px", marginRight: "10px" }}
                      />
                      Thanh toán tiền mặt khi nhận hàng (COD)
                    </div>
                  }
                />

                <FormControlLabel
                  value={2}
                  control={<Radio />}
                  label={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src="https://cdn0.fahasa.com/skin/frontend/base/default/images/payment_icon/ico_vnpay.svg?q=10311"
                        alt="VNPAY"
                        style={{ width: "40px", marginRight: "10px" }}
                      />
                      Thanh toán bằng VNPAY
                    </div>
                  }
                />
              </RadioGroup>
            </FormControl>
          </div>

          <div className="container bg-light my-3 rounded-3 p-3">
            <strong className="fs-6">MÃ KHUYẾN GIẢM GIÁ</strong>
            <hr />
            <div className="d-flex align-items-end w-50">
              <TextField
                className="w-50"
                id="standard-basic"
                label="Mã khuyến mãi (nếu có): "
                variant="standard"
                value={""}
              />
              <Button className="ms-3" variant="outlined">
                Áp dụng
              </Button>
            </div>
          </div>

          <div className="container bg-light my-3 rounded-3 p-3">
            <strong className="fs-6">GHI CHÚ</strong>
            <hr />
            <TextField
              className="w-100"
              id="standard-basic"
              label="Ghi chú"
              variant="outlined"
              multiline
              minRows={3}
              maxRows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="container bg-light my-3 rounded-3 p-3">
            <strong className="fs-6">KIỂM TRA LẠI ĐƠN HÀNG</strong>
            <hr />
            <div className="row my-3">
              <div className="col">
                <span className="ms-3">Sản phẩm</span>
              </div>
              <div className="col-2 text-center">Số lượng</div>
              <div className="col-2 text-center">Tổng tiền</div>
            </div>

            {props.cartList.map((cartItem) => (
              <BookHorizontal key={cartItem.idCart} cartItem={cartItem} />
            ))}
          </div>

          <footer
            className="fixed-bottom bottom-0 shadow-4-strong bg-light"
            style={{ height: "175px" }}
          >
            <div className="container my-3">
              <div className="row">
                <div className="me-3 col text-end">Thành tiền</div>
                <div className="ms-3 col-2 text-end">
                  {props.totalPriceProduct.toLocaleString("vi-vn")} đ
                </div>
              </div>
              <div className="row">
                <div className="me-3 col text-end">Phí vận chuyển</div>
                <div className="ms-3 col-2 text-end">0 đ</div>
              </div>
              <div className="row">
                <div className="me-3 col text-end">
                  <strong>Tổng số tiền (gồm VAT)</strong>
                </div>
                <div className="ms-3 col-2 text-end text-danger fs-5">
                  <strong>{props.totalPriceProduct.toLocaleString("vi-vn")} đ</strong>
                </div>
              </div>

              <hr className="mt-3" />

              <div className="row">
                <div className="col d-flex align-items-center">
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => props.setIsCheckout(false)}
                  >
                    <ArrowBackIcon />
                    <strong className="ms-2">Quay về giỏ hàng</strong>
                  </span>
                </div>
                <div className="col-4">
                  <Button type="submit" variant="contained" sx={{ width: "100%" }}>
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