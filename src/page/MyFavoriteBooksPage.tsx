import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import useScrollToTop from "../hooks/ScrollToTop";
import {useAuth} from "../layouts/utils/AuthContext";
import FavoriteBooksList from "../layouts/product/FavoriteBookList";


interface MyFavoriteBooksPageProps {}

const MyFavoriteBooksPage: React.FC<MyFavoriteBooksPageProps> = (props) => {
    useScrollToTop();
    const { isLoggedIn } = useAuth();
    const navigation = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigation("/dangnhap");
        }
    });

    if (!isLoggedIn) {
        return null;
    }

    return (
        <>
            <FavoriteBooksList />
        </>
    );
};

export default MyFavoriteBooksPage;
