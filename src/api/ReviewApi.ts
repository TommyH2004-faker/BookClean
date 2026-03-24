import { a } from "framer-motion/dist/types.d-6pKw1mTI";
import { endpointBE } from "../layouts/utils/Constant";
import ReviewModel from "../models/ReviewModel";
import {my_request, requestAdmin} from "./Request";




async function getReview(endpoint: string): Promise<ReviewModel[]> {
   // Gọi phương thức request()
   const response = await my_request(endpoint);

   return response.data.map((reviewData: any) => ({
      ...reviewData,
   }));
}

// export async function getAllReview(idBook: number): Promise<ReviewModel[]> {
//    // Xác định endpoint
//    const endpoint: string = endpointBE + `/review/get-all/${idBook}`;

//    return getReview(endpoint);
// }

export async function getAllReview(idBook: number): Promise<ReviewModel[]> {
	const response = await my_request(`${endpointBE}/review/get-all/${idBook}`);

	return response.data.map((item: any) => ({
		id: item.id,
		comment: item.comment,
		rating: item.rating,
		dateCreated: item.dateCreated,
		user: {
			id: item.user?.id,
			name: item.user?.name,
			lastName: item.user?.lastName,
			avatarUrl: item.user?.avatar
      },
	}));
}

export async function getTotalNumberOfReviews(): Promise<number> {
   const endpoint = endpointBE + "/review/total";
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