import React from "react";
import ImageModel from "../models/ImageModel";
import { my_request } from "../api/Request";
async function layAnhMotSach(duongDan:string): Promise<ImageModel[]> {
    const ketQua: ImageModel[] = [];
    // xac dinh endpoint
    // duyet du lieu
    const reponse = await my_request(duongDan);
    const reponseData = reponse._embedded.images;
    for (const item in reponseData) {
        ketQua.push({
            idImage: reponseData[item].idImage, // id anh
            nameImage: reponseData[item].nameImage, // ten anh
            thumbnail: reponseData[item].thumbnail, // la icon
            urlImage: reponseData[item].urlImage, // duong dan anh
            dataImage: reponseData[item].dataImage // du lieu anh
        });
    }
    return ketQua;

}
export async function layToanBoHinhAnhMotSach(idBook: number): Promise<ImageModel[]> {
    // xac dinh endpoint
    const duongDan: string = `http://localhost:8080/books/${idBook}/listImages`;
    return layAnhMotSach(duongDan);
}

export async function lay1AnhCuaMotSach(idBook:number): Promise<ImageModel[]> {
    // xac dinh endpoint
    const duongDan: string = `http://localhost:8080/books/${idBook}/listImages?sort=idImage,asc?page=0&size=1`;
    return layAnhMotSach(duongDan);
}

