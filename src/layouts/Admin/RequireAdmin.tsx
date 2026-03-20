import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
	id: any;
	role: string;
	avatar: string;
	lastName: string;
	enabled: boolean;
	sub: string;
}

const RequireAdmin = <P extends object>(
	WrappedComponent: React.ComponentType<P>
) => {
	const WithAdminCheck: React.FC<P> = (props) => {
		const navigate = useNavigate();

		useEffect(() => {
			const token = localStorage.getItem("token");

			// Nếu chưa đăng nhập thì về trang /login
			if (!token) {
				navigate("/dangnhap");
				return;
			}

			// Giải mã token
			const decodedToken = jwtDecode(token) as JwtPayload;

			// Lấy thông tin từ token đó
			const role = decodedToken.role;

			// Kiểm tra quyền
			if (role !== "ADMIN") {
				navigate("/bao-loi-403");
			}
		}, [navigate]);

		return <WrappedComponent {...props} />;
	};
	return WithAdminCheck || null;
};

export default RequireAdmin;
