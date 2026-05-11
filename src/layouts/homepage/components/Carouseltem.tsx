// import React, { useEffect, useState } from "react";
// import BookModel from "../../../models/BookModel";
// import ImageModel from "../../../models/ImageModel";

// import {lay1AnhCuaMotSach} from "../../../api/HinhAnhAPI";
// import { Link } from "react-router-dom";

// interface CaroselItemPropsInterface {
//     sach: BookModel;
// }

// const Carouseltem: React.FC<CaroselItemPropsInterface> = (props) => {
//     const maSach: number = props.sach.idBook;
//     const [danhSachAnh, setDanhSachAnh] = useState<ImageModel[]>([]);
//     const [dangTaiDuLieu, setDangTaiDuLieu] = useState(true);
//     const [baoLoi, setBaoLoi] = useState<string | null>(null);

//     useEffect(() => {
//         lay1AnhCuaMotSach(maSach).then(
//             (hinhAnhData: ImageModel[]) => {
//                 setDanhSachAnh(hinhAnhData);
//                 setDangTaiDuLieu(false);
//             }
//         ).catch(
//             (error: Error) => {
//                 setDangTaiDuLieu(false);
//                 setBaoLoi(error.message);
//             }
//         );
//     }, [maSach]);

//     if (dangTaiDuLieu) {
//         return (
//             <div>
//                 <h1>Đang tải dữ liệu</h1>
//             </div>
//         );
//     }

//     if (baoLoi) {
//         return (
//             <div>
//                 <h1>Gặp lỗi: {baoLoi}</h1>
//             </div>
//         );
//     }

//     let duLieuAnh: string = "";
//     if (danhSachAnh[0] && danhSachAnh[0].url) {
//         duLieuAnh = danhSachAnh[0].url;
//     }

//     // return (
//     //     <div>
//     //         <div className="row align-items-center">
//     //             <div className="col-5 text-center">
//     //                 <img src={duLieuAnh} className="float-end" style={{width: '300px'}}/>
//     //             </div>
//     //             <div className="col-7">
//     //                 <h5>{props.sach.nameBook}</h5>
//     //                 <p>{props.sach.author}</p>
//     //             </div>
//     //         </div>
//     //     </div>
//     // );

//        return (
//         <div className="row align-items-center g-3">
//             <div className="col-12 col-md-5 text-center">
//                 <Link to={`/books/${maSach}`}>
//                     <img
//                         src={duLieuAnh}
//                         alt={props.sach.nameBook}
//                         className="img-fluid"
//                         style={{
//                             width: "100%",
//                             maxWidth: "300px",
//                             height: "auto",
//                             borderRadius: "10px",
//                             objectFit: "cover",
//                         }}
//                     />
//                 </Link>
//             </div>
//             <div className="col-12 col-md-7">
//                 <Link to={`/books/${maSach}`} style={{ textDecoration: 'none', color: 'inherit' }}>
//                     <h5 className="mb-1">{props.sach.nameBook}</h5>
//                     <p className="mb-0">{props.sach.author}</p>
//                 </Link>
//             </div>
//         </div>
//     );
// }

// export default Carouseltem;
import React, { useEffect, useState } from "react";
import BookModel from "../../../models/BookModel";
import ImageModel from "../../../models/ImageModel";
import { lay1AnhCuaMotSach } from "../../../api/HinhAnhAPI";
import { Link } from "react-router-dom";

interface CaroselItemPropsInterface {
    sach: BookModel;
}

const Carouseltem: React.FC<CaroselItemPropsInterface> = (props) => {
    const [danhSachAnh, setDanhSachAnh] = useState<ImageModel[]>([]);
    const [dangTaiDuLieu, setDangTaiDuLieu] = useState(true);
    const [baoLoi, setBaoLoi] = useState<string | null>(null);

    // 1. Kiểm tra an toàn ngay từ đầu
    const sach = props.sach;
    const maSach = sach?.idBook; // Sử dụng ?. để không bị crash nếu sach undefined

    useEffect(() => {
        // 2. Chỉ gọi API nếu có maSach
        if (maSach) {
            lay1AnhCuaMotSach(maSach)
                .then((hinhAnhData: ImageModel[]) => {
                    setDanhSachAnh(hinhAnhData);
                    setDangTaiDuLieu(false);
                })
                .catch((error: Error) => {
                    setDangTaiDuLieu(false);
                    setBaoLoi(error.message);
                });
        }
    }, [maSach]);

    // 3. Nếu không có sách, không render gì cả
    if (!sach) {
        return null;
    }

    if (dangTaiDuLieu) {
        return (
            <div className="container text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (baoLoi) {
        return <div>Lỗi: {baoLoi}</div>;
    }

    let duLieuAnh: string = "";
    if (danhSachAnh[0] && danhSachAnh[0].url) {
        duLieuAnh = danhSachAnh[0].url;
    }

    return (
        <div className="row align-items-center g-3">
            <div className="col-12 col-md-5 text-center">
                <Link to={`/books/${maSach}`}>
                    <img
                        src={duLieuAnh}
                        alt={sach.nameBook}
                        className="img-fluid"
                        style={{
                            width: "100%",
                            maxWidth: "300px",
                            borderRadius: "10px",
                            objectFit: "cover",
                        }}
                    />
                </Link>
            </div>
            <div className="col-12 col-md-7">
                <Link to={`/books/${maSach}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h5 className="mb-1">{sach.nameBook}</h5>
                    <p className="mb-0">{sach.author}</p>
                </Link>
            </div>
        </div>
    );
};

export default Carouseltem;