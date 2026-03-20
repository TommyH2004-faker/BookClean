class FeedbackModel {
   id?: number;
   idFeedback?: number; // id phan hoi
   title?: string; // noi dung phan hoi
   comment?: string; // binh luan
   dateCreated?: Date; // ngay tao
   readed?: boolean; // da doc
   user?: string; // nguoi phan hoi
   constructor(idFeedback: number, title: string, comment: string, dateCreated: Date, readed: boolean, user: string) {
      this.idFeedback = idFeedback;
      this.title = title;
      this.comment = comment;
      this.dateCreated = dateCreated;
      this.readed = readed;
      this.user = user
   }
}

export default FeedbackModel;