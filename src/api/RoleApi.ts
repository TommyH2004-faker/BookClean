import { endpointBE } from "../layouts/utils/Constant";
import RoleModel from "../models/RoleModel";
import {my_request, requestAdmin} from "./Request";

function unwrapData(response: any) {
   return response?.data ?? response;
}

function normalizeRole(role: any): RoleModel {
   if (typeof role === "string") {
      return {
         idRole: 0,
         nameRole: role,
      } as RoleModel;
   }

   return {
      ...role,
      idRole: role?.idRole ?? role?.id ?? 0,
      nameRole: role?.nameRole ?? role?.name ?? "",
   } as RoleModel;
}

function extractRoles(input: any): any[] {
   if (Array.isArray(input)) {
      return input;
   }

   if (Array.isArray(input?.roles)) {
      return input.roles;
   }

   if (Array.isArray(input?._embedded?.roles)) {
      return input._embedded.roles;
   }

   return [];
}


export async function getAllRoles(): Promise<RoleModel[]> {
   const endpoint = endpointBE + "/role";
   // Gọi phương thức request()
   const response = unwrapData(await requestAdmin(endpoint));

   const rolesList: RoleModel[] = extractRoles(response).map((role: any) =>
      normalizeRole(role)
   );

   return rolesList;
}

export async function getRoleByIdUser(idUser: any): Promise<RoleModel> {
   const endpoint = endpointBE + `/user/${idUser}/roles`;
   // Gọi phương thức request()
   const response = unwrapData(await my_request(endpoint));

   if (typeof response?.idRole !== "undefined") {
      return {
         idRole: response.idRole,
         nameRole: Array.isArray(response.roles) ? response.roles[0] || "" : "",
      } as RoleModel;
   }

   const rolesList: RoleModel[] = extractRoles(response).map((role: any) =>
      normalizeRole(role)
   );

   return rolesList[0] || ({ idRole: 0, nameRole: "" } as RoleModel);
}