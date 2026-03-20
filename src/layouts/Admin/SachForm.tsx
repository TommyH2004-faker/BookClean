import React, { FormEvent, useState } from 'react';
import RequiredAdmin from '../Admin/RequireAdmin';

const SachForm: React.FC = () => {
    const [sach, setSach] = useState({
        idBook: 0,
        nameBook: "",
        author: "",
        isbn: "",
        description: "",
        listPrice: 0,
        sellPrice: 0,
        quantity: 0,
        avgRating: 0,
    })

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        const token = localStorage.getItem('token'); // lay token ra
        fetch('http://localhost:8080/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(sach)
        }).then((response) => {
            if (response.ok) {
                alert("Đã thêm sách thành công!");
                setSach({
                    idBook: 0,
                    nameBook: '',
                    author: '',
                    isbn: '',
                    description: '',
                    listPrice: 0,
                    sellPrice: 0,
                    quantity: 0,
                    avgRating: 0,
                })
            } else {
                alert("Gặp lỗi trong quá trình thêm sách!");
            }
        })
    }

    return (
        <div className='container row d-flex align-items-center justify-content-center'>
            <div className=''>
                <h1>THÊM SÁCH</h1>
                <form onSubmit={handleSubmit} className='form'>
                    <input
                        type='hidden'
                        id='maSach'
                        value={sach.idBook}
                    />

                    <label htmlFor='tenSach'>Tên sách</label>
                    <input
                        className='form-control'
                        type='text'
                        value={sach.nameBook}
                        onChange={(e) => setSach({ ...sach, nameBook: e.target.value })}
                        required
                    />

                    <label htmlFor='giaBan'>Giá bán</label>
                    <input
                        className='form-control'
                        type='number'
                        value={sach.sellPrice}
                        onChange={(e) => setSach({ ...sach, sellPrice: parseFloat(e.target.value) })}
                        required
                    />

                    <label htmlFor='giaNiemYet'>Giá niêm yết</label>
                    <input
                        className='form-control'
                        type='number'
                        value={sach.listPrice}
                        onChange={(e) => setSach({ ...sach, listPrice: parseFloat(e.target.value) })}
                        required
                    />

                    <label htmlFor='soLuong'>Số lượng</label>
                    <input
                        className='form-control'
                        type='number'
                        value={sach.quantity}
                        onChange={(e) => setSach({ ...sach, quantity: parseInt(e.target.value) })}
                        required
                    />

                    <label htmlFor='tenTacGia'>Tên tác giả</label>
                    <input
                        className='form-control'
                        type='text'
                        value={sach.author}
                        onChange={(e) => setSach({ ...sach, author: e.target.value })}
                        required
                    />

                    <label htmlFor='moTa'>Mô tả</label>
                    <input
                        className='form-control'
                        type='text'
                        value={sach.description}
                        onChange={(e) => setSach({ ...sach, description: e.target.value })}
                        required
                    />

                    <label htmlFor='isbn'>ISBN</label>
                    <input
                        className='form-control'
                        type='text'
                        value={sach.isbn}
                        onChange={(e) => setSach({ ...sach, isbn: e.target.value })}
                        required
                    />

                    <button type='submit' className='btn btn-success mt-2'>Lưu</button>
                </form>
            </div>
        </div>
    )
}

const SachFormAdmin = RequiredAdmin(SachForm);
export default SachFormAdmin;
