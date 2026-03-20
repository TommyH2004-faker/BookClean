import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { endpointBE } from '../utils/Constant';

    function KichHoatTaiKhoan() {
        const location = useLocation();
        const params = new URLSearchParams(location.search);

        const email = params.get("email");
        const code = params.get("code");

        const [daKichHoat, setDaKichHoat] = useState(false);
        const [thongBao, setThongBao] = useState("");

        useEffect(() => {
            if (email && code) {
                thucHienKichHoat(email, code);
            }
        }, [email, code]);

        const thucHienKichHoat = async (email: string, code: string) => {
            try {
                const url = `${endpointBE}/user/activate?email=${email}&code=${code}`;

                const response = await fetch(url);
                const data = await response.json();

                if (response.ok) {
                    setDaKichHoat(true);
                    setThongBao(data.message);
                } else {
                    // trường hợp đã activate hoặc lỗi khác
                    if (data.message?.includes("đã được kích hoạt")) {
                        setDaKichHoat(true);
                        setThongBao(data.message);
                    } else {
                        setDaKichHoat(false);
                        setThongBao(data.message);
                    }
                }
            } catch {
                setThongBao("Lỗi hệ thống");
            }
        };

        return (
            <div>
                <h1>Kích hoạt tài khoản</h1>
                {daKichHoat
                    ? <p>{thongBao}</p>
                    : <p>Không thể kích hoạt: {thongBao}</p>}
            </div>
        );
    }

export default KichHoatTaiKhoan;