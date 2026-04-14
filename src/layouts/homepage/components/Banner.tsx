import React from 'react';
import { Link } from 'react-router-dom';
import { getActiveFlashSaleSlotHour, formatSlotLabel } from '../../utils/flashSale';
function Banner() {
    const activeSlotHour = getActiveFlashSaleSlotHour();

    return (
        <div className="p-2 mb-2 bg-dark">
            <div className="container-fluid py-5 text-white d-flex
                justify-content-center align-items-center" >
                <div>
                    <h3 className="display-5 fw-bold">
                        Đọc sách chính là hộ chiếu <br/> cho vô số cuộc phiêu lưu
                    </h3>
                    <p className="">Mary Pope Osborne</p>
                    <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
                        <Link to={`/flash-sale?slot=${activeSlotHour}`} className="btn btn-danger btn-lg text-white">
                            <i className="fas fa-bolt me-2" aria-hidden="true"></i>
                            Săn Flash Sale {formatSlotLabel(activeSlotHour)}
                        </Link>
                        <Link to="/search" className="btn btn-primary btn-lg text-white">
                            Khám phá sách
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Banner;