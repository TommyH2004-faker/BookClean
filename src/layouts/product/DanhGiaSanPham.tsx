import React, { useEffect, useState } from 'react';
import {layToanBoDanhGiaCuaMotSach} from "../../api/FeedBackAPI";
import ReviewModel from "../../models/ReviewModel";
import renderRating from "../utils/SaoXepHang";
interface DanhGiaSanPham {
    maSach: number;
}

const DanhGiaSanPham: React.FC<DanhGiaSanPham> = (props) => {
    const maSach: number = props.maSach;
    const [danhSachDanhGia, setDanhSachDanhGia] = useState<ReviewModel[]>([]);
    const [dangTaiDuLieu, setDangTaiDuLieu] = useState(true);
    const [baoLoi, setBaoLoi] = useState(null);
    useEffect(() => {
        layToanBoDanhGiaCuaMotSach(maSach).then(
            danhSach => {
                setDanhSachDanhGia(danhSach);
                setDangTaiDuLieu(false);
            }
        ).catch(
            error => {
                setDangTaiDuLieu(false);
                setBaoLoi(error.message);
            }
        );
    }, []);


    if (dangTaiDuLieu) {
        return (
            <div>
                <h1>Đang tải dữ liệu</h1>
            </div>
        );
    }
    if (baoLoi) {
        return (
            <div>
                <h1>Gặp lỗi: {baoLoi}</h1>
            </div>
        );
    }

    return (
        <div className="container mt-2 mb-2 text-center">
            <h4>Đánh giá sản phẩm: </h4>
            {
                danhSachDanhGia.map((danhGia, index) => (
                        <div className="row">
                            <div className="col-4  text-end">
                                <p>{danhGia.idReview}</p>
                                <p>{renderRating(danhGia.ratingPoint?danhGia.ratingPoint:0)}</p>
                            </div>
                            <div className="col-8 text-start">
                                <p>{danhGia.content}</p>
                            </div>
                        </div>
                    )
                )
            }

        </div>
    );


}

export default DanhGiaSanPham;