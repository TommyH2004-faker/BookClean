import {isTokenExpired} from "../layouts/utils/JwtService";

// export async function my_request(duongdan: string) {
//     // truy cap duong dan
//     const response = await fetch(duongdan);
//     // neu tra ve loi
//     if (!response.ok) {
//         throw new Error("Không thể truy cập đường dẫn");
//     }
//     // neu tra ve ok
//     return response.json();
// }
export async function my_request(duongDan: string) {
    // 1. Lấy token từ localStorage
    const token = localStorage.getItem("token");
    
    // 2. Setup headers mặc định
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    // 3. Nếu có đăng nhập (có token) thì gắn vào
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // 4. Gọi fetch với headers đã cấu hình
    const response = await fetch(duongDan, {
        method: "GET",
        headers: headers
    });

    if (!response.ok) {
        throw new Error(`Lỗi kết nối tới API: ${duongDan}`);
    }

    return response.json();
}
export async function requestAdmin(endpoint: string) {
    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }
    if (!isTokenExpired(token)) {
        return;
    }
    // Truy cập đến đường dẫn
    const response = await fetch(endpoint, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    // Thất bại
    if (!response.ok) {
        throw new Error(`Không thể truy cập ${endpoint}`);
    }

    // Thành công
    return response.json();
}