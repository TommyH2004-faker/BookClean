class UserModel {
   id?: any; // id nguoi dung
   idUser: number; // id nguoi dung
   dateOfBirth: Date; // ngay sinh
   deliveryAddress: string; // dia chi giao hang
   purchaseAddress?: string; // dia chi mua hang
   email: string; // email
   firstName: string; // ten
   lastName: string; // ho
   gender: string;  // gioi tinh
   password?: string; // mat khau
   phoneNumber: string; // so dien thoai
   username: string; // ten dang nhap
   avatar: string; // anh dai dien
   role?: number; // vai tro


   constructor(idUser: number,
               dateOfBirth: Date,
               deliveryAddress: string,
               purchaseAddress: string,
               email: string,
               firstName: string,
               lastName: string,
               gender: string,
               password: string,
               phoneNumber: string,
               username: string, avatar: string,role: number) {
      this.idUser = idUser;
      this.dateOfBirth = dateOfBirth;
      this.deliveryAddress = deliveryAddress;
      this.purchaseAddress = purchaseAddress;
      this.email = email;
      this.firstName = firstName;
      this.lastName = lastName;
      this.gender = gender;
      this.password = password;
      this.phoneNumber = phoneNumber;
      this.username = username;
      this.avatar = avatar;
      this.role = role;
   }
}

export default UserModel;