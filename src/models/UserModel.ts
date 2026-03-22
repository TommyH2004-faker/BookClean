export interface UserModel {
    idUser:number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    avatar: string | null;
    dateOfBirth:string | null;
    deliveryAddress: string | null;
    gender: string | null;
    phoneNumber: string | null;
    enabled: boolean;
    roles: string[];
}
