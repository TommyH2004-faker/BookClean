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
   const response =await my_request(endpoint);
   return response;
}


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
      // gender: normalizeGender(responseUser.gender),
      gender:responseUser.gender,
      phoneNumber: responseUser.phoneNumber,
      username: responseUser.username,
      enabled: responseUser.enabled,
      roles: responseRole.nameRole ? [responseRole.nameRole] : [],
   };
   console.log("User đã được lấy:", user);
   return user;
}

// export async function getUserByIdReview(idReview: number): Promise<UserModel> {
//    const endpoint = endpointBE + `/user/reviews/${idReview}/user`;
//    return getUser(endpoint);
// }
export async function getUserByIdReview(idReview: number): Promise<UserModel> {
   const endpoint = endpointBE + `/user/reviews/${idReview}/user`;
   const response = await my_request(endpoint);

   // nếu API trả trực tiếp object user
   return {
      idUser: 0, // hoặc parse nếu cần
      username: response.name,          // map
      avatar: response.avatarUrl,       // map
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      dateOfBirth: null,
      deliveryAddress: null,
      gender: null,
      phoneNumber: null,
      enabled: true,
      timeStamp: response.timeStamp,
      roles: []
   };
}
