class ImageModel {
   id: number;
   name?: string;
   isThumbnail?: boolean;
   url?: string;
   data?: string;

   constructor(
      id: number,
      name?: string,
      isThumbnail?: boolean,
      url?: string,
      data?: string
   ) {
      this.id = id;
      this.name = name;
      this.isThumbnail = isThumbnail;
      this.url = url;
      this.data = data;
   }
}
export default ImageModel;