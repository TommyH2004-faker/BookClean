import BookModel from "../models/BookModel";
import {my_request, requestAdmin} from "./Request";
import {layToanBoHinhAnhMotSach} from "./HinhAnhAPI";
import {getGenreByIdBook} from "./GenreApi";
import GenreModel from "../models/GenreModel";
import {endpointBE} from "../layouts/utils/Constant";

interface KetQuaInterface {
    ketQua: BookModel[];
    tongSoTrang: number;
    tongSoSach: number;
}

async function laySach(duongDan: string): Promise<KetQuaInterface> {
    const ketQua: BookModel[] = [];

    // Gọi phương thức request
    const response = await my_request(duongDan);

    // Lấy ra json sach
    const responseData = response._embedded.books;
    // lay thong tin trang
    const tongSoTrang = response.page.totalPages;
    const tongSoSach = response.page.totalElements;

    // Duyệt dữ liệu
    for (const item in responseData) {
        ketQua.push({
            idBook: responseData[item].idBook, // id sach
            nameBook: responseData[item].nameBook, // Có thể NULL
            author: responseData[item].author, // tac gia
            isbn: responseData[item].isbn, // ma isbn
            description: responseData[item].description, // mo ta
            listPrice: responseData[item].listPrice, // gia goc
            sellPrice: responseData[item].sellPrice, // gia ban
            quantity: responseData[item].quantity, // so luong
            avgRating: responseData[item].avgRating, // diem trung binh
            soldQuantity: responseData[item].soldQuantity, // so luong da ban
            discountPercent: responseData[item].discountPercent, // phan tram giam gia
            thumbnail: responseData[item].thumbnail // anh bia
        });
    }

    return { ketQua: ketQua, tongSoTrang: tongSoTrang, tongSoSach: tongSoSach };
}

export async function getAllBook(size?: number, page?: number): Promise<KetQuaInterface> {
    // Nếu không truyền size thì mặc định là 8
    if (!size) {
        size = 8;
    }

    // Xác định endpoint
    const endpoint: string = endpointBE + `/books?sort=idBook,desc&size=${size}&page=${page}`;

    return laySach(endpoint);
}
export async function layToanBoSach(trangHienTai:number): Promise<KetQuaInterface> {
    // Xác định endpoint
    const duongDan: string = `http://localhost:8080/books?sort=idBook,desc&size=8&page=${trangHienTai}`;
    return laySach(duongDan);
}

export async function lay3SachMoiNhat(): Promise<KetQuaInterface> {
    // Xác định endpoint
    const duongDan: string = 'http://localhost:8080/books?sort=idBook,desc&page=0&size=3';
    return laySach(duongDan);
}

export async function get3BestSellerBooks(): Promise<BookModel[]> {
    const endpoint: string = endpointBE + "/books?sort=soldQuantity,desc&size=3";
    let bookList = await laySach(endpoint);

    // Use Promise.all to wait for all promises in the map to resolve
    let newBookList = await Promise.all(bookList.ketQua.map(async (book: any) => {
        // Trả về quyển sách
        const responseImg = await layToanBoHinhAnhMotSach(book.idBook);
        const thumbnail = responseImg.find(image => image.thumbnail);

        return {
            ...book,
            thumbnail: thumbnail ? thumbnail.urlImage : null,
        };
    }));

    return newBookList;
}

export async function timKiemSach(tuKhoaTimKiem: string, idGenre: number): Promise<KetQuaInterface> {
    // Xác định endpoint
    let duongDan: string = `http://localhost:8080/books?sort=idBook,desc&size=8&page=0`;
    if (tuKhoaTimKiem !== '' && idGenre == 0) {
        duongDan = `http://localhost:8080/books/search/findByNameBookContaining?sort=idBook,desc&size=8&page=0&nameBook=${tuKhoaTimKiem}`;
    } else if (tuKhoaTimKiem === '' && idGenre > 0) {
        duongDan = `http://localhost:8080/books/search/findByListGenres_idGenre?sort=idBook,desc&size=8&page=0&idGenre=${idGenre}`;
    } else if (tuKhoaTimKiem !== '' && idGenre > 0) {
        duongDan = `http://localhost:8080/books/search/findByNameBookContainingAndListGenres_idGenre?sort=idBook,desc&size=8&page=0&nameBook=${tuKhoaTimKiem}&idGenre=${idGenre}`;
    }
    return laySach(duongDan);
}
// http://localhost:8080/book/2?

export async function laySachTheoMaSach(idBook: number): Promise<BookModel|null> {

    const duongDan = `http://localhost:8080/books/${idBook}`;

    let ketQua: BookModel;

    try {
        // Gọi phương thức request
        const response =  await fetch(duongDan);

        if(!response.ok){
            throw new Error('Gặp lỗi trong quá trình gọi API lấy sách!')
        }

        const sachData = await response.json();

        if(sachData){
            return {
                idBook: sachData.idBook, // id sach
                nameBook: sachData.nameBook, // Có thể NULL
                author: sachData.author, // tac gia
                isbn: sachData.isbn, // ma isbn
                description: sachData.description, // mo ta
                listPrice: sachData.listPrice, // gia goc
                sellPrice:sachData.sellPrice, // gia ban
                quantity: sachData.quantity, // so luong
                avgRating: sachData.avgRating, // diem trung binh
                soldQuantity: sachData.soldQuantity, // so luong da ban
                discountPercent: sachData.discountPercent, // phan tram giam gia
                thumbnail: sachData.thumbnail // anh bia

            }
        }else{
            throw new Error('Sách không tồn tài!');
        }
    } catch (error) {
        console.error("Error", error);
        return null;
    }
}

export async function getBookByIdCartItem(idCart: number): Promise<BookModel | null> {
    const endpoint ="http://localhost:8080" + `/cart-items/${idCart}/book`;

    try {
        // Gọi phương thức request()
        const response = await my_request(endpoint);

        // Kiểm tra xem dữ liệu endpoint trả về có dữ liệu không
        if (response) {

            // Trả về quyển sách
            return response;
        } else {
            throw new Error("Sách không tồn tại");
        }

    } catch (error) {
        console.error('Error: ', error);
        return null;
    }
}
export async function getTotalNumberOfBooks(): Promise<number> {
    const endpoint = "http://localhost:8080/book/get-total";
    try {
        // Gọi phương thức request()
        const response = await requestAdmin(endpoint);
        // Kiểm tra xem dữ liệu endpoint trả về có dữ liệu không
        if (response) {
            // Trả về số lượng cuốn sách
            return response;
        }
    } catch (error) {
        throw new Error("Lỗi không gọi được endpoint lấy tổng cuốn sách\n" + error);
    }
    return 0;
}
// getBookByIdAllInformation
// Lấy sách theo id (lấy thumbnail, ảnh liên quan, thể loại)
export async function getBookByIdAllInformation(idBook: number): Promise<BookModel | null> {
    let bookResponse: BookModel = {
        idBook: 0,
        nameBook: "",
        author: "",
        description: "",
        listPrice: NaN,
        sellPrice: NaN,
        quantity: NaN,
        avgRating: NaN,
        soldQuantity: NaN,
        discountPercent: NaN,
        thumbnail: "",
        relatedImg: [],
        idGenres: [],
        genresList: [],
    }

    try {
        // Gọi phương thức request()
        const response = await laySachTheoMaSach(idBook);

        // Kiểm tra xem dữ liệu endpoint trả về có dữ liệu không
        if (response) {
            // Lưu dữ liệu sách
            bookResponse = response;

            // Lấy tất cả hình ảnh của sách
            const imagesList = await layToanBoHinhAnhMotSach(response.idBook);
            const thumbnail = imagesList.find((image) => image.thumbnail);
            const relatedImg = imagesList.map((image) => {
                // Sử dụng conditional (ternary) để trả về giá trị
                return !image.thumbnail ? image.urlImage || image.dataImage : null;
            }).filter(Boolean); // Loại bỏ các giá trị null



            bookResponse = { ...bookResponse, relatedImg: relatedImg as string[], thumbnail: thumbnail?.urlImage || thumbnail?.dataImage };

            // Lấy tất cả thể loại của sách
            const genresList = await getGenreByIdBook(response.idBook);
            genresList.genreList.forEach((genre) => {
                const dataGenre: GenreModel = { idGenre: genre.idGenre, nameGenre: genre.nameGenre };
                bookResponse = { ...bookResponse, genresList: [...bookResponse.genresList || [], dataGenre] };
            })

            return bookResponse;
        } else {
            throw new Error("Sách không tồn tại");
        }

    } catch (error) {
        console.error('Error: ', error);
        return null;
    }
}
// Lấy sách theo id (chỉ lấy thumbnail)
export async function getBookById(idBook: number): Promise<BookModel | null> {
    let bookResponse: BookModel = {
        idBook: 0,
        nameBook: "",
        author: "",
        description: "",
        listPrice: NaN,
        sellPrice: NaN,
        quantity: NaN,
        avgRating: NaN,
        soldQuantity: NaN,
        discountPercent: NaN,
        thumbnail: "",
    }
    const endpoint = endpointBE + `/books/${idBook}`;
    try {
        // Gọi phương thức request()
        const response = await my_request(endpoint);

        // Kiểm tra xem dữ liệu endpoint trả về có dữ liệu không
        if (response) {
            bookResponse = response;
            // Trả về quyển sách
            const responseImg = await layToanBoHinhAnhMotSach(response.idBook);
            const thumbnail = responseImg.filter(image => image.thumbnail);
            return {
                ...bookResponse,
                thumbnail: thumbnail[0].urlImage,
            };
        } else {
            throw new Error("Sách không tồn tại");
        }

    } catch (error) {
        console.error('Error: ', error);
        return null;
    }
}

export async function searchBook(keySearch?: string, idGenre?: number, filter?: number, size?: number, page?: number): Promise<KetQuaInterface> {

    // Nếu key search không undifined
    if (keySearch) {
        keySearch = keySearch.trim();
    }

    const optionsShow = `size=${size}&page=${page}`;

    // Endpoint mặc định
    let endpoint: string = endpointBE + `/books?` + optionsShow;

    let filterEndpoint = '';
    if (filter === 1) {
        filterEndpoint = "sort=nameBook";
    } else if (filter === 2) {
        filterEndpoint = "sort=nameBook,desc";
    } else if (filter === 3) {
        filterEndpoint = "sort=sellPrice";
    } else if (filter === 4) {
        filterEndpoint = "sort=sellPrice,desc";
    } else if (filter === 5) {
        filterEndpoint = "sort=soldQuantity,desc";
    }

    // Nếu có key search và không có lọc thể loại
    if (keySearch !== '') {
        // Mặc đinh nếu không có filter
        endpoint = endpointBE + `/books/search/findByNameBookContaining?nameBook=${keySearch}&` + optionsShow + '&' + filterEndpoint;
    }

    // Nếu idGenre không undifined
    if (idGenre !== undefined) {
        // Nếu có không có key search và có lọc thể loại
        if (keySearch === '' && idGenre > 0) {
            // Mặc định nếu không có filter
            endpoint = endpointBE + `/books/search/findByListGenres_idGenre?idGenre=${idGenre}&` + optionsShow + '&' + filterEndpoint;
        }

        // Nếu có key search và có lọc thể loại
        if (keySearch !== '' && idGenre > 0) {
            endpoint = endpointBE + `/books/search/findByNameBookContainingAndListGenres_idGenre?nameBook=${keySearch}&idGenre=${idGenre}&` + optionsShow + '&' + filterEndpoint;
        }

        // Chỉ lọc filter
        if (keySearch === '' && (idGenre === 0 || typeof (idGenre) === 'string')) {
            endpoint = endpointBE + "/books?" + optionsShow + '&' + filterEndpoint;
        }

        // console.log("idGenre: " + typeof (idGenre) + idGenre + ", filter: " + typeof (filter) + filter + ", keySearch" + +typeof (keySearch) + keySearch);
    }

    // console.log(endpoint);

    return laySach(endpoint);
}
