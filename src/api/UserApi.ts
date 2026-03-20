import { endpointBE } from "../layouts/utils/Constant";

import { getRoleByIdUser } from "./RoleApi";
import UserModel from "../models/UserModel";
import {my_request, requestAdmin} from "./Request";

async function getUser(endpoint: string): Promise<UserModel> {
   // Gọi phương thức request()
   const response = await my_request(endpoint);

   return response;
}


export async function getAllUserRole(): Promise<UserModel[]> {
   const endpoint: string = endpointBE + `/role`;


   const response = await requestAdmin(endpoint);


   const roles = response._embedded?.roles || [];


   let users: UserModel[] = [];

   for (const roleData of roles) {
      const listUsersUrl = roleData._links?.listUsers?.href;


      if (listUsersUrl) {
         try {
            const listUsersResponse = await requestAdmin(listUsersUrl);


            const listUsers = listUsersResponse._embedded?.users || [];

            const usersFromRole = listUsers.map((userData: any) => ({
               idUser: userData.idUser,
               avatar: userData.avatar,
               dateOfBirth: userData.dateOfBirth,
               deliveryAddress: userData.deliveryAddress,
               email: userData.email,
               firstName: userData.firstName,
               lastName: userData.lastName,
               gender: userData.gender,
               phoneNumber: userData.phoneNumber,
               username: userData.username,
               role: roleData.nameRole,
            }));

            users = [...users, ...usersFromRole];
         } catch (error) {
            console.error(`Lỗi khi lấy danh sách người dùng từ ${listUsersUrl}`, error);
         }
      } else {
         console.warn("Không tìm thấy listUsersUrl trong role:", roleData);
      }
   }

   console.log("Danh sách users cuối cùng:", users);
   return users;
}



export async function get1User(idUser: any): Promise<UserModel> {
   const endpoint = endpointBE + `/users/${idUser}`;
   const responseUser = await my_request(endpoint);
   const responseRole = await getRoleByIdUser(idUser);

   const user: UserModel = {
      idUser: responseUser.idUser,
      avatar: responseUser.avatar,
      dateOfBirth: responseUser.dateOfBirth,
      deliveryAddress: responseUser.deliveryAddress,
      email: responseUser.email,
      firstName: responseUser.firstName,
      lastName: responseUser.lastName,
      gender: responseUser.gender,
      phoneNumber: responseUser.phoneNumber,
      username: responseUser.username,
      role: responseRole.idRole,
   };

   return user;
}

export async function getUserByIdReview(idReview: number): Promise<UserModel> {
   // Xác định endpoint
   const endpoint: string = endpointBE + `/review/${idReview}/user`;

   return getUser(endpoint);
}