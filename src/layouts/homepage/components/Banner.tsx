import React from 'react';
import { Link } from 'react-router-dom';
function Banner() {
    return (
        <div className="p-2 mb-2 bg-dark">
            <div className="container-fluid py-5 text-white d-flex
                justify-content-center align-items-center" >
                <div>
                    <h3 className="display-5 fw-bold">
                        Đọc sách chính là hộ chiếu <br/> cho vô số cuộc phiêu lưu
                    </h3>
                    <p className="">Mary Pope Osborne</p>
                    <Link to="/search" className="btn btn-primary btn-lg text-white float-end">
                        Khám phá sách tại đây !
                    </Link>
                </div>
            </div>
        </div>
    );
}
export default Banner;