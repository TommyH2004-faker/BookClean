
import {my_request, requestAdmin} from './Request';
import FeedbackModel from "../models/FeedbackModel";
import ReviewModel from "../models/ReviewModel";
import {endpointBE} from "../layouts/utils/Constant";

async function layDanhGiaCuaMotSach(duongDan: string): Promise<ReviewModel[]> {
    const ketQua: ReviewModel[] = [];

    // Gọi phương thức request
    const response = await my_request(duongDan);

    // Lấy ra json sach
    const responseData = response._embedded.reviews;
    // console.log(responseData);

    for (const key in responseData) {
        ketQua.push({
            idReview: responseData[key].idReview,
            content: responseData[key].content,
            ratingPoint: responseData[key].ratingPoint,
            timestamp:responseData[key].timestamp
        });
    }

    return ketQua;
}


export async function layToanBoDanhGiaCuaMotSach(maSach: number): Promise<ReviewModel[]> {
    // Xác định endpoint
    const duongDan: string = `http://localhost:8080/books/${maSach}/listReviews`;

    return layDanhGiaCuaMotSach(duongDan);
}


export async function lay1DanhGiaCuaMotSach(maSach: number): Promise<ReviewModel[]> {
    // Xác định endpoint
    const duongDan: string = `http://localhost:8080/books/${maSach}/listReviews?sort=maDanhGia,asc&page=0&size=1`;

    return layDanhGiaCuaMotSach(duongDan);
}

// getTotalNumberOfFeedbacks
export async function getTotalNumberOfFeedbacks(): Promise<number> {
    // Xác định endpoint
    const duongDan: string = `http://localhost:8080/feedback/totalFeedbacks`;
    // Gọi phương thức request
    const response = await my_request(duongDan);
    return response;
}
// getAllFeedbacks
export async function getAllFeedback(): Promise<FeedbackModel[]> {
    const endpoint = endpointBE + "/feedbacks?sort=idFeedback,desc";
    const response = await requestAdmin(endpoint);

    let feedbacks: FeedbackModel[] = [];

    if (response) {
        feedbacks = await response._embedded.feedbackses.map((feedbackData: any) => ({
            ...feedbackData
        }))
    }

    return feedbacks;
}


