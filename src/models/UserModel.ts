export interface UserModel {
    idUser:string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    avatar: string | null;
    dateOfBirth:string | null;
    deliveryAddress: string | null;
    gender: boolean | null;
    phoneNumber: string | null;
    enabled: boolean;
    roles: string[];
    timeStamp?: string;
}
