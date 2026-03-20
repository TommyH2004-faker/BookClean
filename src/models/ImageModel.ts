class ImageModel {
   idImage: number; // id anh
   nameImage?: string; // ten anh
   thumbnail?: boolean; // la icon
   urlImage?: string; // duong dan anh
   dataImage?: string;  // du lieu anh

   constructor(idImage: number, nameImage: string, thumbnail: boolean, urlImage: string, dataImage: string) {
      this.idImage = idImage;
      this.nameImage = nameImage;
      this.thumbnail = thumbnail;
      this.urlImage = urlImage;
      this.dataImage = dataImage;
   }
}

export default ImageModel;