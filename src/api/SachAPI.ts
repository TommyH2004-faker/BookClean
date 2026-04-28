import BookModel from "../models/BookModel";
import {my_request, requestAdmin} from "./Request";
import {layToanBoHinhAnhMotSach} from "./HinhAnhAPI";
import {getGenreByIdBook} from "./GenreApi";
import GenreModel from "../models/GenreModel";
import {endpointBE} from "../layouts/utils/Constant";
import {  getPurchasedFlashSaleQuantityForBook } from "../layouts/utils/flashSaleLimit";

interface KetQuaInterface {
    ketQua: BookModel[];
    tongSoTrang: number;
    tongSoSach: number;
}

function resolveBasePricing(item: any): { isFlashSale: boolean; flashSalePrice: number | null; sellPrice: number; baseSellPrice: number } {
    const isFlashSale = Boolean(item?.isFlashSale);
    const rawFlashSalePrice = item?.flashSalePrice;
    const flashSalePrice = typeof rawFlashSalePrice === "number" ? rawFlashSalePrice : null;
    const normalSellPrice = item?.sellPrice ?? 0;

    if (isFlashSale && typeof flashSalePrice === "number" && flashSalePrice > 0) {
        return { isFlashSale, flashSalePrice, sellPrice: flashSalePrice, baseSellPrice: normalSellPrice };
    }

    return { isFlashSale, flashSalePrice, sellPrice: normalSellPrice, baseSellPrice: normalSellPrice };
}

// async function resolveUserAwarePricing(item: any): Promise<{ isFlashSale: boolean; flashSalePrice: number | null; sellPrice: number }> {
//     const basePricing = resolveBasePricing(item);
//     if (!basePricing.isFlashSale) {
//         return basePricing;
//     }

//     const bookId = Number(item?.id ?? item?.idBook ?? item?.bookId ?? 0);
//     if (!Number.isFinite(bookId) || bookId <= 0) {
//         return basePricing;
//     }

//     const maxPerUser = await getFlashSaleMaxPerUser(bookId);
//     if (!maxPerUser) {
//         return basePricing;
//     }

//     const purchasedQuantity = await getPurchasedFlashSaleQuantityForBook(bookId);
//     if (purchasedQuantity >= maxPerUser) {
//         return {
//             isFlashSale: false,
//             flashSalePrice: basePricing.flashSalePrice,
//             sellPrice: basePricing.baseSellPrice,
//         };
//     }

//     return basePricing;
// }
export async function resolveUserAwarePricing(item: any): Promise<{ isFlashSale: boolean; flashSalePrice: number | null; sellPrice: number }> {
    // Không cần gọi getFlashSaleMaxPerUser hay getPurchasedFlashSaleQuantityForBook nữa
    // Lấy trực tiếp kết quả mà C# đã trả về trong biến item
    
    return {
        isFlashSale: item?.isFlashSale ?? false,
        flashSalePrice: item?.flashSalePrice ?? null,
        sellPrice: item?.sellPrice ?? item?.listPrice ?? 0,
    };
}
// async function laySach(duongDan: string): Promise<KetQuaInterface> {
//     const ketQua: BookModel[] = [];

//     // Gọi phương thức request
//     const response = await my_request(duongDan);

//     // Lấy ra json sach
//     const responseData = response.data;
//     // lay thong tin trang
//     const tongSoTrang = response.totalPages;
//     const tongSoSach = response.totalElements;

//     // Duyệt dữ liệu
//     for (const item in responseData) {
//         ketQua.push({
//             idBook: responseData[item].id, // id sach
//             nameBook: responseData[item].name, // Có thể NULL
//             author: responseData[item].author, // tac gia
//             isbn: responseData[item].isbn, // ma isbn
//             description: responseData[item].description, // mo ta
//             listPrice: responseData[item].listPrice, // gia goc
//             sellPrice: responseData[item].sellPrice, // gia ban
//             quantity: responseData[item].quantity, // so luong
//             avgRating: responseData[item].avgRating, // diem trung binh
//             soldQuantity: responseData[item].soldQuantity, // so luong da ban
//             discountPercent: responseData[item].discountPercent, // phan tram giam gia
//             thumbnail: responseData[item].thumbnail // anh bia
//         });
//     }

//     return { ketQua: ketQua, tongSoTrang: tongSoTrang, tongSoSach: tongSoSach };
// }
// async function laySach(duongDan: string): Promise<KetQuaInterface> {
//     const ketQua: BookModel[] = [];

//     const response = await my_request(duongDan);

//     const responseData = response.data;
//     const tongSoTrang = response.totalPages;
//     const tongSoSach = response.totalElements;

//     for (const item of responseData) {
// 		const pricing = await resolveUserAwarePricing(item);
//         ketQua.push({
//             idBook: item.id,
//             nameBook: item.name ?? "",
//             author: item.author ?? "Đang cập nhật",
//             isbn: item.isbn ?? "",
//             description: item.description ?? "",
//             listPrice: item.listPrice ?? 0,
// 			sellPrice: pricing.sellPrice,
// 			isFlashSale: pricing.isFlashSale,
// 			flashSalePrice: pricing.flashSalePrice,
//             quantity: item.quantity ?? 0,
//             avgRating: item.avgRating ?? 0,
//             soldQuantity: item.soldQuantity ?? 0,
//             discountPercent: item.discountPercent ?? 0,
//             thumbnail: item.thumbnail ?? ""
//         });
//     }
//     return {
//         ketQua,
//         tongSoTrang,
//         tongSoSach
//     };
// }
async function laySach(duongDan: string): Promise<KetQuaInterface> {
    const ketQua: BookModel[] = [];

    // Sau khi my_request đã có Token, dữ liệu trả về ở đây đã RẤT CHUẨN
    const response = await my_request(duongDan);

    const responseData = response.data;
    const tongSoTrang = response.totalPages;
    const tongSoSach = response.totalElements;

    for (const item of responseData) {
        // Không cần gọi resolveUserAwarePricing nữa
        ketQua.push({
            idBook: item.id,
            nameBook: item.name ?? "",
            author: item.author ?? "Đang cập nhật",
            isbn: item.isbn ?? "",
            description: item.description ?? "",
            listPrice: item.listPrice ?? 0,
            
            // Lấy thẳng kết quả đã được C# tính toán
            sellPrice: item.sellPrice, 
            isFlashSale: item.isFlashSale,
            flashSalePrice: item.flashSalePrice,
            
            quantity: item.quantity ?? 0,
            avgRating: item.avgRating ?? 0,
            soldQuantity: item.soldQuantity ?? 0,
            discountPercent: item.discountPercent ?? 0,
            thumbnail: item.thumbnail ?? ""
        });
    }
    
    return {
        ketQua,
        tongSoTrang,
        tongSoSach
    };
}
export async function getAllBook(size?: number, page?: number): Promise<KetQuaInterface> {
    // Nếu không truyền size thì mặc định là 8
    if (!size) {
        size = 8;
    }

    // Xác định endpoint
    const endpoint: string = endpointBE + `/book/all-book?sort=idBook,desc&size=${size}&page=${page}`;

    return laySach(endpoint);
}
export async function layToanBoSach(trangHienTai:number): Promise<KetQuaInterface> {
    // Xác định endpoint
    const duongDan: string = `${endpointBE}/book/all-book?sort=idbook,desc&size=8&page=${trangHienTai}`;
    return laySach(duongDan);
}

export async function lay3SachMoiNhat(): Promise<KetQuaInterface> {
    // Xác định endpoint
    const duongDan: string = `${endpointBE}/book/all-book?sort=idBook,desc&page=0&size=3`;
    return laySach(duongDan);
}

export async function get3BestSellerBooks(): Promise<BookModel[]> {
    const endpoint: string = endpointBE + "/book/all-book?page=0&size=3&sort=soldQuantity,desc";
    let bookList = await laySach(endpoint);

    // Use Promise.all to wait for all promises in the map to resolve
    let newBookList = await Promise.all(bookList.ketQua.map(async (book: any) => {
        // Trả về quyển sách
        const responseImg = await layToanBoHinhAnhMotSach(book.idBook);
        const thumbnail = responseImg.find(image => image.isThumbnail);

        return {
            ...book,
            thumbnail: thumbnail ? thumbnail.url : null,
        };
    }));

    return newBookList;
}

export async function timKiemSach(
	tuKhoaTimKiem: string,
	idGenre: number
): Promise<KetQuaInterface> {

	const keyword = tuKhoaTimKiem?.trim() || "";

	const params = new URLSearchParams();

	// search
	if (keyword) {
		params.append("keySearch", keyword);
	}

	// filter genre
	if (idGenre && idGenre > 0) {
		params.append("genreId", idGenre.toString());
	}

	// mặc định sort mới nhất
	params.append("sort", "id_desc");

	// pagination cố định
	params.append("page", "0");
	params.append("size", "8");

	const endpoint = `${endpointBE}/book/search?${params.toString()}`;


	return laySach(endpoint);
}

// export async function laySachTheoMaSach(idBook: number): Promise<BookModel|null> {

//     const duongDan = `${endpointBE}/book/${idBook}`;

//     try {
//         // Gọi phương thức request
//         const response =  await fetch(duongDan);

//         if(!response.ok){
//             throw new Error('Gặp lỗi trong quá trình gọi API lấy sách!')
//         }

//         const sachData = await response.json();
//         var responseData = sachData.data;
//         if(sachData){
// 			const pricing = await resolveUserAwarePricing(responseData);
//             const bookResponse: BookModel = {
//                 idBook: responseData.id, // id sach
//                 nameBook: responseData.name, // Có thể NULL
//                 author: responseData.author, // tac gia
//                 isbn: responseData.isbn, // ma isbn
//                 description: responseData.description, // mo ta
//                 listPrice: responseData.listPrice, // gia goc
// 				sellPrice: pricing.sellPrice, // gia ban (ưu tiên flash sale nếu có)
// 				isFlashSale: pricing.isFlashSale,
// 				flashSalePrice: pricing.flashSalePrice,
//                 quantity: responseData.quantity, // so luong
//                 avgRating: responseData.avgRating, // diem trung binh
//                 soldQuantity: responseData.soldQuantity, // so luong da ban
//                 discountPercent: responseData.discountPercent, // phan tram giam gia
//                 thumbnail: responseData.thumbnail // anh bia
//             };

//             return bookResponse;
//         }else{
//             throw new Error('Sách không tồn tài!');
//         }
//     } catch (error) {
//         console.error("Error", error);
//         return null;
//     }
// }
export async function laySachTheoMaSach(idBook: number): Promise<BookModel|null> {
    const duongDan = `${endpointBE}/book/${idBook}`;

    try {
        // 1. Lấy token từ localStorage
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        // 2. Nếu có token thì thêm vào header để backend định danh
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // 3. Gọi phương thức request có kèm cấu hình
        const response = await fetch(duongDan, {
            method: "GET",
            headers: headers
        });

        if(!response.ok){
            throw new Error('Gặp lỗi trong quá trình gọi API lấy sách!');
        }

        const sachData = await response.json();
        var responseData = sachData.data;

        if(sachData){
            // Hàm xử lý giá cũ của bạn
            const pricing = await resolveUserAwarePricing(responseData); 
            
            const bookResponse: BookModel = {
                idBook: responseData.id, 
                nameBook: responseData.name, 
                author: responseData.author, 
                isbn: responseData.isbn, 
                description: responseData.description, 
                listPrice: responseData.listPrice, 
                sellPrice: pricing.sellPrice, 
                isFlashSale: pricing.isFlashSale,
                flashSalePrice: pricing.flashSalePrice,
                quantity: responseData.quantity, 
                avgRating: responseData.avgRating, 
                soldQuantity: responseData.soldQuantity, 
                discountPercent: responseData.discountPercent, 
                thumbnail: responseData.thumbnail 
            };

            return bookResponse;
        } else {
            throw new Error('Sách không tồn tại!');
        }
    } catch (error) {
        console.error("Error", error);
        return null;
    }
}
export async function getBookByIdCartItem(idCart: number): Promise<BookModel | null> {
    const endpoint = `${endpointBE}/cart-items/${idCart}/book`;

    try {
        const response = await my_request(endpoint);
        const responseData = response?.data ?? response;

        if (!responseData) {
            throw new Error("Sách không tồn tại");
        }

        const pricing = await resolveUserAwarePricing(responseData);
        return {
            idBook: responseData.id ?? responseData.idBook ?? 0,
            nameBook: responseData.name ?? responseData.nameBook ?? "",
            author: responseData.author ?? "",
            isbn: responseData.isbn ?? "",
            description: responseData.description ?? "",
            listPrice: responseData.listPrice ?? 0,
            sellPrice: pricing.sellPrice,
            isFlashSale: pricing.isFlashSale,
            flashSalePrice: pricing.flashSalePrice,
            quantity: responseData.quantity ?? 0,
            avgRating: responseData.avgRating ?? 0,
            soldQuantity: responseData.soldQuantity ?? 0,
            discountPercent: responseData.discountPercent ?? 0,
            thumbnail: responseData.thumbnail ?? "",
        };

    } catch (error) {
        console.error('Error: ', error);
        return null;
    }
}
export async function getTotalNumberOfBooks(): Promise<number> {
    const endpoint = `${endpointBE}/book/total-book`;
    try {
        // Gọi phương thức request()
        const response = await requestAdmin(endpoint);
        // Kiểm tra xem dữ liệu endpoint trả về có dữ liệu không
        if (response) {
            // Trả về số lượng cuốn sách
            return response.total;
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
            const thumbnail = imagesList.find((image) => image.isThumbnail);
            const relatedImg = imagesList.map((image) => {
                // Sử dụng conditional (ternary) để trả về giá trị
                return !image.isThumbnail ? image.url || image.data : null;
            }).filter(Boolean); // Loại bỏ các giá trị null



            bookResponse = { ...bookResponse, relatedImg: relatedImg as string[], thumbnail: thumbnail?.url || thumbnail?.data };

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

export async function getBookById(idBook: number): Promise<BookModel | null> {
    const endpoint = endpointBE + `/book/${idBook}`;
    try {
        const response = await my_request(endpoint);
        var responseData = response.data;

        if (responseData) {
			const pricing = await resolveUserAwarePricing(responseData);

            // map lại đúng field
            const bookResponse: BookModel = {
                idBook: responseData.id,
                nameBook: responseData.name,
                author: responseData.author,
                description: responseData.description,
                listPrice: responseData.listPrice,
				sellPrice: pricing.sellPrice,
				isFlashSale: pricing.isFlashSale,
				flashSalePrice: pricing.flashSalePrice,
                quantity: responseData.quantity,
                avgRating: responseData.avgRating,
                soldQuantity: responseData.soldQuantity,
                discountPercent: responseData.discountPercent,
                thumbnail: responseData.thumbnail // tạm thời
            };

            // lấy ảnh
            const responseImg = await layToanBoHinhAnhMotSach(responseData.id);

            const thumbnail = responseImg.filter(image => image.isThumbnail);

            return {
                ...bookResponse,
                thumbnail: thumbnail[0]?.url || thumbnail[0]?.data || "",
            };
        } else {
            throw new Error("Sách không tồn tại");
        }

    } catch (error) {
        console.error('Error: ', error);
        return null;
    }
}

export async function searchBook(
	keySearch?: string,
	idGenre?: number,
	filter?: number,
	size: number = 10,
	page: number = 0
): Promise<KetQuaInterface> {

	// trim search
	const keyword = keySearch?.trim() || "";

	// convert sort
	let sort = "";
	switch (filter) {
		case 1: sort = "name_asc"; break;
		case 2: sort = "name_desc"; break;
		case 3: sort = "price_asc"; break;
		case 4: sort = "price_desc"; break;
		case 5: sort = "sold_desc"; break;
		default: sort = "";
	}

	// build query params
	const params = new URLSearchParams();

	if (keyword) params.append("keySearch", keyword);
	if (idGenre && idGenre > 0) params.append("genreId", idGenre.toString());
	if (sort) params.append("sort", sort);

	params.append("page", page.toString());
	params.append("size", size.toString());

	const endpoint = `${endpointBE}/book/search?${params.toString()}`;

	console.log(" endpoint:", endpoint);

	return laySach(endpoint);
}
