import { CloudUpload, EditOutlined } from "@mui/icons-material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Tab from "@mui/material/Tab";
import React, { FormEvent, useEffect, useLayoutEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import {
	checkPassword,
	checkPhoneNumber,
	checkRepeatPassword,
} from "../../../utils/Validation";
import Tooltip from "@mui/material/Tooltip";





import HiddenInputUpload from "../../../utils/HiddenInputUpload";
import useScrollToTop from "../../../../hooks/ScrollToTop";
import {useAuth} from "../../../utils/AuthContext";
import {useNavigate} from "react-router-dom";
import {getIdUserByToken} from "../../../utils/JwtService";
import {get1User} from "../../../../api/UserApi";
import {toast} from "react-toastify";
import {endpointBE} from "../../../utils/Constant";
import {OrderTable} from "../order/OrderTable";
import {FadeModal} from "../../../utils/FadeModal";
import {OrderForm} from "../order/OrderForm";
import CheckIcon from "@mui/icons-material/Check";
import { UserModel } from "../../../../models/UserModel";

interface ProfilePageProps {
	setReloadAvatar: any;
}

const ProfilePage: React.FC<ProfilePageProps> = (props) => {
	useScrollToTop(); // Mỗi lần vào component này thì sẽ ở trên cùng
	const [currentPassword, setCurrentPassword] = useState("");
	const [errorCurrentPassword, setErrorCurrentPassword] = useState("");
	const { isLoggedIn } = useAuth();
	const navigation = useNavigate();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	useLayoutEffect(() => {
		if (!isLoggedIn) {
			navigation("/dangnhap");
		}
	});

	// Các biến thông tin cá nhân
	 const [user, setUser] = useState<UserModel>({
		 idUser: "",
		 dateOfBirth: "",
		 deliveryAddress: "",
		 email: "",
		 firstName: "",
		 lastName: "",
		 gender: false,
		 password: "",
		 phoneNumber: "",
		 username: "",
		 avatar: "",
		 enabled: true,
		 roles: ["CUSTOMER"],
	 });
	const [newPassword, setNewPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [previewAvatar, setPreviewAvatar] = useState("");

	// reload lại component order table
	const [keyCountReload, setKeyCountReload] = useState(0);

	// Xử lý order table
	const [id, setId] = useState("");
	const [openModal, setOpenModal] = React.useState(false);
	const handleOpenModal = () => setOpenModal(true);
	const handleCloseModal = () => setOpenModal(false);

	// Các biến trạng thái
	const [modifiedStatus, setModifiedStatus] = useState(false);
	const [isUploadAvatar, setIsUploadAvatar] = useState(false);

	// Các biến thông báo lỗi
	const [errorPhoneNumber, setErrorPhoneNumber] = useState("");
	const [errorNewPassword, setErrorNewPassword] = useState("");
	const [errorRepeatPassword, setErrorRepeatPassword] = useState("");
	useEffect(() => {
	const idUser = getIdUserByToken();
	get1User(idUser)
		.then((response) => {
		setUser({
		...response,
		gender: response.gender ?? null,
		dateOfBirth: response.dateOfBirth
			? response.dateOfBirth.split("T")[0]
			: "",
		});
		setPreviewAvatar(response.avatar ?? "");
		})
		.catch((error) => console.log(error));
	}, []);

	// Xử lý change só điện thoại
	const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUser({ ...user, phoneNumber: e.target.value });
		setErrorPhoneNumber("");
	};

		function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
	if (event.target.files && event.target.files.length > 0) {
		const file = event.target.files[0];
		setSelectedFile(file);
		setPreviewAvatar(URL.createObjectURL(file)); // preview ngay
		setIsUploadAvatar(true);
	}
	}

	// Xử lý ngày sinh
	 const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		 const dateString = e.target.value;
		 setUser({
			 ...user,
			 dateOfBirth: dateString,
		 });
	 };
	// Xử lý change password
	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNewPassword(e.target.value);
		setErrorNewPassword("");
	};

	const handleRepeatPasswordChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setRepeatPassword(e.target.value);
		setErrorRepeatPassword("");
	};

	// Xử lý TABS
	const [value, setValue] = React.useState("1");
	const handleChange = (event: React.SyntheticEvent, newValue: string) => {
		setValue(newValue);
	};

	// Xử lý khi form submit (thay đổi thông tin)
	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		const token = localStorage.getItem("token");
		toast.promise(
			fetch(endpointBE + `/user/update-profile`, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
					"content-type": "application/json",
				},
				body: JSON.stringify({
					idUser: getIdUserByToken(),
					firstName: user.firstName,
					lastName: user.lastName,
					dateOfBirth: user.dateOfBirth,
					phoneNumber: user.phoneNumber,
					deliveryAddress: user.deliveryAddress,
					gender: user.gender,
				}),
			})
				.then((response) => {
					toast.success("Cập nhật thông tin thành công");
					setModifiedStatus(!modifiedStatus);
				})
				.catch((error) => {
					toast.error("Cập nhật thông tin thất bại");
					setModifiedStatus(!modifiedStatus);
					console.log(error);
				}),
			{ pending: "Đang trong quá trình xử lý ..." }
		);
	}

// 	async function handleSubmitAvatar() {
// 	if (!selectedFile) return toast.warning("Chọn ảnh trước khi upload!");

// 	try {
// 		const reader = new FileReader();
// 		reader.readAsDataURL(selectedFile);

// 		reader.onload = async () => {
// 		const base64Data = (reader.result as string).split(",")[1];

// 		const token = localStorage.getItem("token");
// 		const response = await fetch(endpointBE + "/user/change-avatar", {
// 			method: "PUT",
// 			headers: {
// 			Authorization: `Bearer ${token}`,
// 			"Content-Type": "application/json",
// 			},
// 			body: JSON.stringify({ avatar: base64Data }),
// 		});

// 		if (!response.ok) throw new Error(await response.text());

// 		const data = await response.json();
// 		localStorage.setItem("token", data.jwtToken);

// 		setUser({ ...user, avatar: data.avatar ?? user.avatar });
// 		setPreviewAvatar(data.avatar ?? user.avatar);
// 		setIsUploadAvatar(false);
// 		setSelectedFile(null);
// 		toast.success("Cập nhật avatar thành công!");
// 		props.setReloadAvatar(Math.random());
// 		};
// 	} catch (error) {
// 		console.error(error);
// 		toast.error("Cập nhật avatar thất bại");
// 		setPreviewAvatar(user.avatar || "");
// 		setIsUploadAvatar(false);
// 	}
// }
	async function handleSubmitAvatar() {
	if (!selectedFile) {
		toast.warning("Chọn ảnh trước khi upload!");
		return;
	}

	try {
		const formData = new FormData();
		formData.append("file", selectedFile);

		const token = localStorage.getItem("token");

		const response = await fetch(endpointBE + "/user/upload-avatar", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});

		if (!response.ok) throw new Error(await response.text());

		const data = await response.json();

		// ✅ backend trả về URL
		setUser({ ...user, avatar: data.avatar });
		setPreviewAvatar(data.avatar);

		setSelectedFile(null);
		setIsUploadAvatar(false);

		toast.success("Upload avatar thành công!");
		props.setReloadAvatar(Math.random());

	} catch (error) {
		console.error(error);
		toast.error("Upload thất bại");
	}
}
	// Xử lý khi form submit (thay đổi mật khẩu)
function handleSubmitChangePassword(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    // Kiểm tra lỗi
    if (errorCurrentPassword || errorNewPassword || errorRepeatPassword) {
        toast.warning("Xem lại các mật khẩu vừa nhập");
        return;
    }

    const token = localStorage.getItem("token");
    fetch(endpointBE + "/user/change-password", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            currentPassword: currentPassword, // gửi mật khẩu hiện tại
            newPassword: newPassword,         // gửi mật khẩu mới
        }),
    })
        .then(async (response) => {
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }
            // thành công
            setCurrentPassword("");
            setNewPassword("");
            setRepeatPassword("");
            toast.success("Đổi mật khẩu thành công");
        })
        .catch((error) => {
            console.error(error);
            toast.error("Thay đổi mật khẩu không thành công: " + error.message);
        });
}

	// Khúc này chủ yếu nếu mà không đăng nhập mà cố tình vào thì sẽ không render component ra
	if (!isLoggedIn) {
		return null;
	}

	return (
		<div className='container my-5'>
			<Grid container>
				<Grid item sm={12} md={12} lg={3}>
					<div className='bg-light rounded py-3 me-lg-2 me-md-0 me-sm-0'>
						<div className='d-flex align-items-center justify-content-center flex-column'>
							<Avatar
								style={{fontSize: "50px"}}
								alt={user.lastName.toUpperCase()}
								src={previewAvatar}
								sx={{width: 100, height: 100}}
							/>
							{!isUploadAvatar ? (
								<Button
									className='mt-3'
									size='small'
									component='label'
									variant='outlined'
									startIcon={<CloudUpload/>}
								>
									Upload avatar
									<HiddenInputUpload
										handleImageUpload={handleImageUpload}
									/>
								</Button>
							) : (
								<div>
									<Button
										className='mt-4 me-2'
										size='small'
										variant='outlined'
										startIcon={<CloseIcon/>}
										onClick={() => {
											setPreviewAvatar(user.avatar ? user.avatar : "");
											setIsUploadAvatar(false);
										}}
										color='error'
									>
										Huỷ
									</Button>
									<Button
										className='mt-4 ms-2'
										size='small'
										variant='outlined'
										startIcon={<CheckIcon/>}
										color='success'
										onClick={handleSubmitAvatar}
									>
										Thay đổi
									</Button>
								</div>
							)}
						</div>
						<div className='text-center mt-3'>
							<p>Email: {user.email}</p>
						</div>
					</div>
				</Grid>
				<Grid item sm={12} md={12} lg={9}>
					<div
						className='bg-light rounded px-2 ms-lg-2 ms-md-0 ms-sm-0 mt-lg-0 mt-md-3 mt-sm-3'
						style={{minHeight: "300px"}}
					>
						<Box sx={{width: "100%", typography: "body1"}}>
							<TabContext value={value}>
								<Box sx={{borderBottom: 1, borderColor: "divider"}}>
									<TabList
										onChange={handleChange}
										aria-label='lab API tabs example'
									>
										<Tab label='Thông tin cá nhân' value='1'/>
										<Tab label='Đơn hàng' value='2'/>
										<Tab label='Đổi mật khẩu' value='3'/>
									</TabList>
								</Box>
								<TabPanel value='1'>
									<form
										onSubmit={handleSubmit}
										className='form position-relative'
										style={{padding: "0 20px"}}
									>
										{!modifiedStatus && (
											<div
												className='text-end my-3 position-absolute'
												style={{
													bottom: "0",
													right: "0",
												}}
											>
												<Tooltip
													title='Chỉnh sửa thông tin'
													placement='bottom-end'
												>
													<Button
														variant='contained'
														type='button'
														className='rounded-pill'
														onClick={() =>
															setModifiedStatus(!modifiedStatus)
														}
													>
														<EditOutlined
															sx={{width: "24px"}}
														/>
													</Button>
												</Tooltip>
											</div>
										)}
										<div className='row'>
											<div className='col-sm-12 col-md-6 col-lg-4'>
												<TextField
													required
													fullWidth
													label='ID'
													value={user.idUser}
													disabled={true}
													className='input-field'
													InputProps={{
														readOnly: true,
													}}
												/>
												<TextField
													required
													fullWidth
													label='Họ đệm'
													value={user.firstName}
													onChange={(e) =>
														setUser({
															...user,
															firstName: e.target.value,
														})
													}
													disabled={modifiedStatus ? false : true}
													className='input-field'
												/>
												<TextField
													fullWidth
													error={
														errorPhoneNumber.length > 0
															? true
															: false
													}
													helperText={errorPhoneNumber}
													required={true}
													label='Số điện thoại'
													placeholder='Nhập số điện thoại'
													value={user.phoneNumber}
													onChange={handlePhoneNumberChange}
													onBlur={(e) => {
														checkPhoneNumber(
															setErrorPhoneNumber,
															e.target.value
														);
													}}
													disabled={modifiedStatus ? false : true}
													className='input-field'
												/>
											</div>
											<div className='col-sm-12 col-md-6 col-lg-4'>
												<TextField
													required
													fullWidth
													label='Tên tài khoản'
													value={user.username}
													disabled={true}
													className='input-field'
												/>
												<TextField
													required
													fullWidth
													label='Tên'
													value={user.lastName}
													onChange={(e) =>
														setUser({
															...user,
															lastName: e.target.value,
														})
													}
													disabled={modifiedStatus ? false : true}
													className='input-field'
												/>
												<TextField
													required
													fullWidth
													label='Địa chỉ giao hàng'
													value={user.deliveryAddress}
													onChange={(e) =>
														setUser({
															...user,
															deliveryAddress: e.target.value,
														})
													}
													disabled={modifiedStatus ? false : true}
													className='input-field'
												/>
											</div>
											<div className='col-sm-12 col-md-6 col-lg-4'>
												<TextField
													required
													fullWidth
													label='Email'
													value={user.email}
													className='input-field'
													disabled={true}
													InputProps={{
														readOnly: true,
													}}
												/>
												 <TextField
													 required
													 fullWidth
													 className='input-field'
													 label='Ngày sinh'
													 style={{width: "100%"}}
													 type='date'
													 value={user.dateOfBirth}
													 onChange={handleDateChange}
													 disabled={modifiedStatus ? false : true}
												 />
												<FormControl>
													<FormLabel id='demo-row-radio-buttons-group-label'>
														Giới tính
													</FormLabel>
													{/* <RadioGroup
														row
														aria-labelledby='demo-row-radio-buttons-group-label'
														name='row-radio-buttons-group'
														value={user.gender}
														onChange={(e) =>
															setUser({
																...user,
																gender: e.target.value,
															})
														}
													> */}
													<RadioGroup
													row
													value={
														user.gender === true
														? "1"
														: user.gender === false
														? "0"
														: ""
													}
													onChange={(e) => {
														const value = e.target.value;
														setUser({
														...user,
														gender:
															value === "1"
															? true
															: value === "0"
															? false
															: null,
														});
													}}
													>
														<FormControlLabel
															disabled={
																modifiedStatus ? false : true
															}
															value='0'
															control={<Radio/>}
															label='Nam'
														/>
														<FormControlLabel
															disabled={
																modifiedStatus ? false : true
															}
															value='1'
															control={<Radio/>}
															label='Nữ'
														/>
													</RadioGroup>
												</FormControl>
											</div>
										</div>
										{modifiedStatus && (
											<div className='text-center my-3'>
												<Button
													fullWidth
													variant='outlined'
													type='submit'
													sx={{ width: { xs: "100%", sm: "50%" }, padding: "10px" }}
												>
													Lưu và thay đổi
												</Button>
											</div>
										)}
									</form>
								</TabPanel>
								<TabPanel value='2'>
									<div>
										<OrderTable
											setOption={setId}
											handleOpenModal={handleOpenModal}
											keyCountReload={keyCountReload}
											setKeyCountReload={setKeyCountReload}
											setId={setId}
										/>
									</div>
									<FadeModal
										open={openModal}
										handleOpen={handleOpenModal}
										handleClose={handleCloseModal}
									>
										<OrderForm
											id={id}
											setKeyCountReload={setKeyCountReload}
											handleCloseModal={handleCloseModal}
											option='view-customer'
										/>
									</FadeModal>
								</TabPanel>
								<TabPanel value='3'>
									<form
										onSubmit={handleSubmitChangePassword}
											className='form position-relative px-3 px-md-5'
									>
										<TextField
											error={errorCurrentPassword.length > 0}
											helperText={errorCurrentPassword}
											required
											fullWidth
											type="password"
											label="Mật khẩu hiện tại"
											placeholder="Nhập mật khẩu hiện tại"
											value={currentPassword}
											onChange={(e) => {
												setCurrentPassword(e.target.value);
												setErrorCurrentPassword("");
											}}
										/>
										<TextField
											error={
												errorNewPassword.length > 0 ? true : false
											}
											helperText={errorNewPassword}
											required={true}
											fullWidth
											type='password'
											label='Mật khẩu mới'
											placeholder='Nhập mật khẩu mới'
											value={newPassword}
											onChange={handlePasswordChange}
											onBlur={(e) => {
												checkPassword(
													setErrorNewPassword,
													e.target.value
												);
											}}
											className='input-field'
										/>

										<TextField
											error={
												errorRepeatPassword.length > 0
													? true
													: false
											}
											helperText={errorRepeatPassword}
											required={true}
											fullWidth
											type='password'
											label='Xác nhận mật khẩu mới'
											placeholder='Nhập lại mật khẩu mới'
											value={repeatPassword}
											onChange={handleRepeatPasswordChange}
											onBlur={(e) => {
												checkRepeatPassword(
													setErrorRepeatPassword,
													e.target.value,
													newPassword
												);
											}}
											className='input-field'
										/>
										<div className='text-center my-3'>
											<Button
												fullWidth
												variant='outlined'
												type='submit'
													sx={{ width: { xs: "100%", sm: "50%" }, padding: "10px" }}
											>
												Lưu và thay đổi
											</Button>
										</div>
									</form>
								</TabPanel>
							</TabContext>
						</Box>
					</div>
				</Grid>
			</Grid>
		</div>
	);
};

export default ProfilePage;
