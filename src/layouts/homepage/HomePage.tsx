import React from 'react';
import Carousel from "./components/Carousel";
import Banner from "./components/Banner";
import DanhSachSanPham from "../product/DanhSachSanPham";
import { useParams } from 'react-router-dom';
interface HomePageProps {
    tuKhoaTimKiem: string;
}
function HomePage({tuKhoaTimKiem}: HomePageProps) {
    const {idGenre} = useParams();
    let idGenreNumber=0;
    try {
        idGenreNumber = parseInt(idGenre+'');
    }catch (error) {
        idGenreNumber = 0;
        console.error('Error :',error);
    }
    if(Number.isNaN(idGenreNumber)){
        idGenreNumber = 0;
    }

    return (
        <div>
          <Banner/>
            <Carousel/>
            <DanhSachSanPham tuKhoaTimKiem={tuKhoaTimKiem} idGenre={idGenreNumber}/>
        </div>
    );
}
export default HomePage;