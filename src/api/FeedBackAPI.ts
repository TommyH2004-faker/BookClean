
import {my_request, requestAdmin} from './Request';
import FeedbackModel from "../models/FeedbackModel";
import {endpointBE} from "../layouts/utils/Constant";
import ReviewModel from '../models/ReviewModel';

async function layDanhGiaCuaMotSach(duongDan: string): Promise<ReviewModel[]> {
    const ketQua: ReviewModel[] = [];

    // Gọi phương thức request
    const response = await my_request(duongDan);

    // Lấy ra json sach
    const responseData = response._embedded.reviews;
    // console.log(responseData);

    for (const key in responseData) {
        ketQua.push({
            id: responseData[key].id,
            comment: responseData[key].comment,
            rating: responseData[key].rating,
            dateCreated: responseData[key].dateCreated,
            user: {
                id: responseData[key].user.id,
                name: responseData[key].user.name,
                lastName: responseData[key].user.lastName,
                avatarUrl: responseData[key].user.avatarUrl,
            }
        });
    }

    return ketQua;
}


export async function layToanBoDanhGiaCuaMotSach(maSach: number): Promise<ReviewModel[]> {
    // Xác định endpoint
    const duongDan: string = `${endpointBE}/books/${maSach}/listReviews`;

    return layDanhGiaCuaMotSach(duongDan);
}


export async function lay1DanhGiaCuaMotSach(maSach: number): Promise<ReviewModel[]> {
    // Xác định endpoint
    const duongDan: string = `${endpointBE}/books/${maSach}/listReviews?sort=maDanhGia,asc&page=0&size=1`;

    return layDanhGiaCuaMotSach(duongDan);
}

// getTotalNumberOfFeedbacks
export async function getTotalNumberOfFeedbacks(): Promise<number> {
    // Xác định endpoint
    const duongDan: string = `${endpointBE}/feedback/get-total`;
    // Gọi phương thức request
    const response = await my_request(duongDan);
    return response;
}
// getAllFeedbacks
export async function getAllFeedback(): Promise<FeedbackModel[]> {
    const endpoint = endpointBE + "/feedback/all-feedback?sort=idfeedback,asc";
    const response = await requestAdmin(endpoint);

    let feedbacks: FeedbackModel[] = [];

    if (response) {
        feedbacks = await response.data.map((feedbackData: any) => ({
            ...feedbackData
        }))
    }

    return feedbacks;
}


