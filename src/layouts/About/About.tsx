import React from "react";
import useScrollToTop from "../../hooks/ScrollToTop";

function About() {
    useScrollToTop(); // Mỗi lần vào component này thì sẽ ở trên cùng
    return (
        <div className='container-fluid px-3 px-md-4 py-3 py-md-5'>
            <div className='mx-auto mb-4 p-3 p-md-4 rounded-4 shadow-4-strong bg-light' style={{ maxWidth: "980px" }}>
                <h3 className='text-center text-black'>Giới thiệu về Minh Hiệp Book</h3>
                <hr />
                <div className='row g-3 align-items-center'>
                    <div className='col-12 col-lg-8'>
                        <p>
                            <strong>Tên website: </strong>Minh Hiệp
                        </p>
                        <p>
                            <strong>Địa chỉ: </strong>Xã Yên Bình , Huyện Vĩnh Tường, Tỉnh Vĩnh Phúc

                        </p>
                        <p>
                            <strong>Số điện thoại: </strong>0813535314
                        </p>
                        <p>
                            <strong>Email: </strong>hiept81331@gmail.com
                        </p>
                    </div>
                    <div className='col-12 col-lg-4'>
                        <div
                            className='d-flex align-items-center justify-content-center rounded-4 p-3'
                            style={{ border: "1px solid #ccc", minHeight: "180px" }}
                        >
                            <img
                                src={"./../../../images/books/logo.png"}
                                style={{ width: "100%", maxWidth: "170px", height: "auto" }}
                                alt='MDB Logo'
                                loading='lazy'
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className='mx-auto p-3 p-md-4 rounded-4 shadow-4-strong bg-light' style={{ maxWidth: "980px" }}>
                <h3 className='text-center text-black'>Google maps</h3>
                <hr />
                <div className='d-flex align-items-center justify-content-center'>
                    <iframe
                        title='Map'
                        src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d979.7718648167253!2d106.71648955933027!3d10.804613354430936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175293dceb22197%3A0x755bb0f39a48d4a6!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBHaWFvIFRow7RuZyBW4bqtbiBU4bqjaSBUaMOgbmggUGjhu5EgSOG7kyBDaMOtIE1pbmggLSBDxqEgc-G7nyAx!5e0!3m2!1svi!2s!4v1699964965789!5m2!1svi!2s'
                        width='100%'
                        height='450'
                        style={{ border: 0, maxWidth: "100%", borderRadius: "16px" }}
                        allowFullScreen={true}
                        loading='lazy'
                        referrerPolicy='no-referrer-when-downgrade'
                    ></iframe>
                </div>
            </div>
        </div>
    );
}

export default About;
