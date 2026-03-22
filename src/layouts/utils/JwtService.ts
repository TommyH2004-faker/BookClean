import { jwtDecode } from "jwt-decode";
import {JwtPayload} from "../Admin/RequireAdmin";

function getRolesFromToken(decodedToken: JwtPayload): string[] {
   if (Array.isArray(decodedToken.role)) {
      return decodedToken.role;
   }

   if (typeof decodedToken.role === "string" && decodedToken.role.trim().length > 0) {
      return [decodedToken.role];
   }

   return [];
}
export function isTokenExpired(token: string) {
   const decodedToken = jwtDecode(token);

   if (!decodedToken.exp) {
      // Token không có thời gian hết hạn (exp)
      return false;
   }

   const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

   return currentTime < decodedToken.exp;
}

export function isToken() {
   const token = localStorage.getItem('token');
   if (token) {
      return true;
   }
   return false;
}


export function getAvatarByToken() {
   const token = localStorage.getItem('token');
   if (token) {
      const decodedToken = jwtDecode(token) as JwtPayload;
      return decodedToken.avatar;
   }
}

export function getLastNameByToken() {
   const token = localStorage.getItem('token');
   if (token) {
      const decodedToken = jwtDecode(token) as JwtPayload;
      return decodedToken.lastName;
   }
}

export function getUsernameByToken() {
   const token = localStorage.getItem('token');
   if (token) {
      return jwtDecode(token).sub;
   }
}

export function getIdUserByToken() {
   const token = localStorage.getItem('token');
   if (token) {
      const decodedToken = jwtDecode(token) as JwtPayload;
      return decodedToken.sub;
   }
}

export function getRoleByToken() {
   const token = localStorage.getItem('token');
   if (token) {
      const decodedToken = jwtDecode(token) as JwtPayload;
      return getRolesFromToken(decodedToken);
   }

   return [];
}

export function hasRole(role: string) {
   const token = localStorage.getItem('token');
   if (!token) {
      return false;
   }

   const decodedToken = jwtDecode(token) as JwtPayload;
   return getRolesFromToken(decodedToken).includes(role);
}

export function logout(navigate: any) {
   navigate("/dangnhap");
   localStorage.removeItem('token');
   localStorage.removeItem('cart');
}