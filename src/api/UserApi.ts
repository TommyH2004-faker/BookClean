import { endpointBE } from "../layouts/utils/Constant";

import { getRoleByIdUser } from "./RoleApi";

import {my_request, requestAdmin} from "./Request";
import { UserModel } from "../models/UserModel";

function unwrapData(response: any) {
   return response?.data ?? response;
}

function normalizeGender(gender: any): string {
   if (!gender) {
      return "";
   }

   const value = String(gender).toLowerCase();
   if (value === "m" || value === "male" || value === "nam") {
      return "Male";
   }

   if (value === "f" || value === "female" || value === "nu" || value === "nữ") {
      return "Female";
   }

   return String(gender);
}

async function getUser(endpoint: string): Promise<UserModel> {
   // Gọi phương thức request()
   const response = unwrapData(await my_request(endpoint));

   return response;
}


// export async function getAllUserRole(): Promise<UserModel[]> {
//    const endpoint: string = endpointBE + `/role`;


//    const response = await requestAdmin(endpoint);


//    const roles = response._embedded?.roles || [];


//    let users: UserModel[] = [];

//    for (const roleData of roles) {
//       const listUsersUrl = roleData._links?.listUsers?.href;


//       if (listUsersUrl) {
//          try {
//             const listUsersResponse = await requestAdmin(listUsersUrl);


//             const listUsers = listUsersResponse._embedded?.users || [];

//             const usersFromRole = listUsers.map((userData: any) => ({
//                idUser: userData.idUser,
//                avatar: userData.avatar,
//                dateOfBirth: userData.dateOfBirth,
//                deliveryAddress: userData.deliveryAddress,
//                email: userData.email,
//                firstName: userData.firstName,
//                lastName: userData.lastName,
//                gender: userData.gender,
//                phoneNumber: userData.phoneNumber,
//                username: userData.username,
//                role: roleData.nameRole,
//             }));

//             users = [...users, ...usersFromRole];
//          } catch (error) {
//             console.error(`Lỗi khi lấy danh sách người dùng từ ${listUsersUrl}`, error);
//          }
//       } else {
//          console.warn("Không tìm thấy listUsersUrl trong role:", roleData);
//       }
//    }

//    console.log("Danh sách users cuối cùng:", users);
//    return users;
// }

export async function getAllUsers(): Promise<UserModel[]> {
    const endpoint = `${endpointBE}/user/get-all`;

    const response = await requestAdmin(endpoint);

    if (!Array.isArray(response)) return [];

    return response.map((user: any): UserModel => ({
        idUser: user.idUser,
        avatar: user.avatar ?? null,
        dateOfBirth: user.dateOfBirth ?? null,
        deliveryAddress: user.deliveryAddress ?? null,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender ?? null,
        phoneNumber: user.phoneNumber ?? null,
        username: user.username,
        enabled: user.enabled ?? false,
        roles: user.roles ?? [], 
    }));
}
export async function get1User(idUser: any): Promise<UserModel> {
   const endpoint = endpointBE + `/user/${idUser}`;
   const responseUser = unwrapData(await my_request(endpoint));
   const responseRole = await getRoleByIdUser(idUser);

   const user: UserModel = {
      idUser: responseUser.idUser,
      avatar: responseUser.avatar,
      dateOfBirth: responseUser.dateOfBirth,
      deliveryAddress: responseUser.deliveryAddress,
      email: responseUser.email,
      firstName: responseUser.firstName,
      lastName: responseUser.lastName,
      gender: normalizeGender(responseUser.gender),
      phoneNumber: responseUser.phoneNumber,
      username: responseUser.username,
      enabled: responseUser.enabled,
      roles: responseRole.nameRole ? [responseRole.nameRole] : [],
   };
   console.log("User đã được lấy:", user);
   return user;
}

export async function getUserByIdReview(idReview: number): Promise<UserModel> {
   // Xác định endpoint
   const endpoint: string = endpointBE + `/review/${idReview}/user`;

   return getUser(endpoint);
}