class ReviewModel {
   idReview: number; // id danh gia
   content: string; // noi dung danh gia
   ratingPoint: number; // diem danh gia
   timestamp?: string; // thoi gian

   constructor(idReview: number,
      content: string,
      ratingPoint: number,) {
      this.idReview = idReview;
      this.content = content;
      this.ratingPoint = ratingPoint;
   }
}

export default ReviewModel;