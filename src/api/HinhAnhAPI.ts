import React from "react";
import ImageModel from "../models/ImageModel";
import { my_request } from "../api/Request";
import { endpointBE } from "../layouts/utils/Constant";
async function layAnhMotSach(duongDan:string): Promise<ImageModel[]> {
    const ketQua: ImageModel[] = [];
    // xac dinh endpoint
    // duyet du lieu
    const reponse = await my_request(duongDan);
    const reponseData = reponse.data;
    for (const item in reponseData) {
        ketQua.push({
            id: reponseData[item].id, 
            name: reponseData[item].name, 
            isThumbnail: reponseData[item].isThumbnail, 
            url: reponseData[item].url, 
            data: reponseData[item].data 
        });
    }
    return ketQua;

}

export async function layToanBoHinhAnhMotSach(idBook: number): Promise<ImageModel[]> {
    // xac dinh endpoint
    const duongDan: string = `${endpointBE}/book/${idBook}/images`;
    return layAnhMotSach(duongDan);
}

export async function lay1AnhCuaMotSach(idBook:number): Promise<ImageModel[]> {
    // xac dinh endpoint
    const duongDan: string = `${endpointBE}/book/${idBook}/images?sort=idImage,asc&page=0&size=1`;
    return layAnhMotSach(duongDan);
}

