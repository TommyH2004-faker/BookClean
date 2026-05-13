import React from 'react';
import Carousel from "./components/Carousel";
import Banner from "./components/Banner";
import FlashSaleBannerCarousel from "./components/FlashSaleBannerCarousel";
import DanhSachSanPham from "../product/DanhSachSanPham";
import { useParams } from 'react-router-dom';
import useScrollToTop from "../../hooks/ScrollToTop";
interface HomePageProps {
    tuKhoaTimKiem: string;
}
function HomePage({tuKhoaTimKiem}: HomePageProps) {
    useScrollToTop();
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
                <div className='overflow-hidden'>
                    <Banner/>
                        <div className='px-0 px-md-2'>
                                <FlashSaleBannerCarousel/>
                        </div>
            <Carousel/>
            <DanhSachSanPham tuKhoaTimKiem={tuKhoaTimKiem} idGenre={idGenreNumber}/>
        </div>
    );
}
export default HomePage;