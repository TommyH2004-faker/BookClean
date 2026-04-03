// import { Button } from "@mui/material";
// import React, { useEffect } from "react";
// import { Link } from "react-router-dom";
// import { useCartItem } from "../../layouts/utils/CartItemContext";
// import { clearMyCart } from "../../api/CartApi";

// export const CheckoutSuccess = () => {


// 	return (
// 		<div className='container bg-light my-3 rounded-3 p-3'>
// 			<div className='d-flex align-items-center justify-content-center flex-column p-5'>
// 				<img
// 					src='https://cdn0.fahasa.com/skin/frontend/base/default/images/order_status/ico_successV2.svg?q=10311'
// 					alt='success'
// 				/>
// 				<h2 className='my-3 text-success'>
// 					Đơn hàng của bạn đã được tiếp nhận
// 				</h2>
// 				<p className='mb-2'>Cảm ơn bạn đã mua sản phẩm của chúng tôi</p>
// 				<p className='mb-2'>
// 					Bạn sẽ sớm nhận được email xác nhận đơn hàng từ chúng tôi
// 				</p>
// 				<Link to={"/search"}>
// 					<Button variant='contained' className='my-3'>
// 						Tiếp tục mua sắm
// 					</Button>
// 				</Link>
// 			</div>
// 		</div>
// 	);
// };
import { Button } from "@mui/material";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCartItem } from "../../layouts/utils/CartItemContext";
import { getCartAllByIdUser } from "../../api/CartApi";
import { toast } from "react-toastify";

export const CheckoutSuccess = () => {
  const { setCartList, setTotalCart } = useCartItem();

 useEffect(() => {
  async function syncCartAfterVnPay() {
    try {
      const carts = await getCartAllByIdUser();
      setCartList(carts); // sẽ là [] nếu order thành công
      setTotalCart(carts.length);
      localStorage.removeItem("cart");
    } catch (error) {
      console.error(error);
    }
  }

  syncCartAfterVnPay();
}, [setCartList, setTotalCart]);

  return (
    <div className='container bg-light my-3 rounded-3 p-3'>
      <div className='d-flex align-items-center justify-content-center flex-column p-5'>
        <img
          src='https://cdn0.fahasa.com/skin/frontend/base/default/images/order_status/ico_successV2.svg?q=10311'
          alt='success'
        />
        <h2 className='my-3 text-success'>
          Đơn hàng của bạn đã được tiếp nhận
        </h2>
        <p className='mb-2'>Cảm ơn bạn đã mua sản phẩm của chúng tôi</p>
        <p className='mb-2'>
          Bạn sẽ sớm nhận được email xác nhận đơn hàng từ chúng tôi
        </p>
        <Link to={"/search"}>
          <Button variant='contained' className='my-3'>
            Tiếp tục mua sắm
          </Button>
        </Link>
      </div>
    </div>
  );
};
