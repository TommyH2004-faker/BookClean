import BookModel from "./BookModel";
import CartItemModel from "./CartItemModel";
import PaymentModel from "./Payment";
import UserModel from "./UserModel";
import OrdersDetailModel from "./OrdersDetailModel";

class OrderModel{
    id?: any; // id don hang
    idOrder: number; // id don hang
    deliveryAddress: string; // dia chi giao hang
    totalPrice: number; // tong tien
    totalPriceProduct: number; // tong tien san pham
    feeDelivery: number; // phi giao hang
    feePayment: number; // phi thanh toan
    dateCreated: Date; // ngay tao
    status: string; // trang thai
    user?: UserModel; // nguoi dung
    fullName?: string; // ten nguoi nhan
    phoneNumber?: string; // so dien thoai
    note?: string; // ghi chu
    payment?: string; // phuong thuc thanh toan
    cartItems?: CartItemModel[]; // để tạm thời
    orderDetails?: OrdersDetailModel[]; // chi tiet don hang


    constructor(idOrder: number,
                deliveryAddress: string,
                totalPrice: number,
                totalPriceProduct: number,
                feeDelivery: number,
                feePayment: number,
                dateCreated: Date,
                user: UserModel,
                status: string,) {
        this.idOrder = idOrder;
        this.deliveryAddress = deliveryAddress;
        this.totalPrice = totalPrice;
        this.dateCreated = dateCreated;
        this.status = status;
        this.feeDelivery = feeDelivery;
        this.feePayment = feePayment;
        this.dateCreated = dateCreated;
        this.totalPriceProduct = totalPriceProduct;
        this.user = user;
    }
}

export default OrderModel;