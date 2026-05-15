# BookStore_FE

## 1) Mo ta du an
BookStore_FE la giao dien nguoi dung cho he thong cua hang sach. Ung dung tap trung vao luong mua hang tu tim kiem sach, xem chi tiet, them gio, thanh toan va theo doi don hang. Ngoai ra, he thong co phan quan tri danh cho admin de quan ly sach, the loai, don hang, khach hang, feedback va cac chuong trinh flash sale.

## 2) Tinh nang chinh
### 2.1 Danh cho khach hang
- Trang chu hien thi danh sach sach theo the loai va tim kiem.
- Trang chi tiet sach, danh gia va nhan xet.
- Gio hang va dat hang.
- Thanh toan: COD, VNPAY, PayPal.
- Theo doi don hang cua toi.
- Danh sach yeu thich.
- Ho so nguoi dung, doi thong tin ca nhan.
- Chat widget ho tro khach hang.

### 2.2 Danh cho quan tri (Admin)
- Dashboard thong ke.
- Quan ly sach, the loai.
- Quan ly nguoi dung.
- Quan ly don hang.
- Quan ly feedback khach hang.
- Quan ly flash sale.

### 2.3 He thong
- Xac thuc va phan quyen qua JWT (luu trong localStorage).
- Luu tam gio hang tren localStorage khi chua dang nhap.
- Tu dong lay gio hang tu API khi da dang nhap.
- Tich hop goi API backend tap trung qua `endpointBE`.

## 3) Cong nghe su dung
- React 18 + TypeScript.
- React Router.
- Material UI, Styled Components.
- Swiper, Chart.js, Framer Motion.
- React Toastify.

## 4) Yeu cau he thong
- Node.js va npm.
- Backend API dang hoat dong (xem cau hinh ben duoi).

## 5) Cai dat va chay du an
```bash
npm install
npm start
```

Ung dung se chay mac dinh tai:
```
http://localhost:3000
```

Build production:
```bash
npm run build
```

## 6) Cau hinh backend
Duong dan API duoc khai bao tai:
```
src/layouts/utils/Constant.ts
```

Mac dinh:
```
export const endpointBE: string = "https://api.minhhiep2534.id.vn";
```

Neu muon chay backend local, doi thanh:
```
export const endpointBE: string = "http://localhost:5000";
```

## 7) Tai khoan admin
De truy cap cac trang `/admin/*`, tai khoan can co role `ADMIN` trong JWT. Neu khong co quyen, he thong se tu dong chuyen huong sang trang 403.

## 8) Scripts
```bash
npm start     # chay dev server
npm run build # build production
npm test      # test
```

## 9) Cau truc thu muc (tom tat)
```
src/
	api/               # goi API backend
	layouts/           # cac man hinh chinh va layout
	models/            # dinh nghia model
	page/              # cac page tuyen dung va component dung chung
	layouts/utils/     # context, helper, constant
```