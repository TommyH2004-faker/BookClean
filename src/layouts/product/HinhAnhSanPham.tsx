import React, { useEffect, useState } from 'react';
import ImageModel from "../../models/ImageModel";
import {layToanBoHinhAnhMotSach} from "../../api/HinhAnhAPI";
import {Carousel} from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
interface HinhAnhSanPham {
    maSach: number;
}

const HinhAnhSanPham: React.FC<HinhAnhSanPham> = (props) => {

    const maSach: number = props.maSach;

    const [danhSachAnh, setDanhSachAnh] = useState<ImageModel[]>([]);
    const [dangTaiDuLieu, setDangTaiDuLieu] = useState(true);
    const [baoLoi, setBaoLoi] = useState(null);
    useEffect(() => {
            layToanBoHinhAnhMotSach(maSach).then(
                danhSach => {
                    setDanhSachAnh(danhSach);
                    setDangTaiDuLieu(false);
                }
            ).catch(
                error => {
                    setDangTaiDuLieu(false);
                    setBaoLoi(error.message);
                }
            );
        }, [] // Chi goi mot lan
    )



    // console.log(danhSachAnh.length);

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
        <div className="row">
           <div className="col-12">
                <Carousel showArrows={true} showIndicators={true} >
                     {
                          danhSachAnh.map((hinhAnh, index) => {
                            return (
                                 <div key={index}>
                                      <img src={hinhAnh.urlImage} alt={hinhAnh.dataImage} />
                                 </div>
                            );
                          })
                     }
                </Carousel>
            </div>
        </div>
    );
}
export default HinhAnhSanPham;