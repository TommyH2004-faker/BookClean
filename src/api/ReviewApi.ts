import { endpointBE } from "../layouts/utils/Constant";
import {my_request, requestAdmin} from "./Request";
import ReviewModel from "../models/ReviewModel";



async function getReview(endpoint: string): Promise<ReviewModel[]> {
   // Gọi phương thức request()
   const response = await my_request(endpoint);

   return response._embedded.reviews.map((reviewData: any) => ({
      ...reviewData,
   }));
}

export async function getAllReview(idBook: number): Promise<ReviewModel[]> {
   // Xác định endpoint
   const endpoint: string = endpointBE + `/books/${idBook}/listReviews`;

   return getReview(endpoint);
}

export async function getTotalNumberOfReviews(): Promise<number> {
   const endpoint = endpointBE + "/review/search/countBy";
   try {
      const response = await requestAdmin(endpoint);
      if (response) {
         return response;
      }
   } catch (error) {
      throw new Error("Lỗi không gọi được endpoint lấy tổng review\n" + error);
   }
   return 0;
}