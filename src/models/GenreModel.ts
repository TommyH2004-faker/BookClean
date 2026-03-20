class GenreModel {
   id?: number; // id the loai
   idGenre: number; // id the loai
   nameGenre: string; // ten the loai

   constructor(idGenre: number, nameGenre: string) {
      this.idGenre = idGenre;
      this.nameGenre = nameGenre;
   }
}

export default GenreModel;