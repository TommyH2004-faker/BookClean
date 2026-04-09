import React from "react";
import Avatar from "@mui/material/Avatar";
import ReviewModel from "../../../models/ReviewModel";


interface CommentProps {
	review: ReviewModel;
	children: React.ReactNode;
}

const User: React.FC<CommentProps> = (props) => {
	// const [user, setUser] = useState<UserModel | null>(null);
	// 	useEffect(() => {
	// 	if (!props.review?.id) return;

	// 	getUserByIdReview(props.review.id).then((response) => {
	// 		setUser(response);
	// 		console.log("User đã được lấy:", response);
	// 	});
	// }, [props.review.id]);
		const user = props.review.user;
		console.log("User đã được lấy:", user);
	const formatDate = (timestamp: string) => {
		const date = new Date(timestamp);

		const year = date.getFullYear();
		const month = date.getMonth() + 1; // Tháng bắt đầu từ 0, nên cộng thêm 1
		const day = date.getDate();
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();

		return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
	};

	return (
		<>
			<div className='me-4 mt-1'>
			<Avatar src={user?.avatarUrl ?? undefined}>
				{!user?.avatarUrl && user?.name?.charAt(0)}
			</Avatar>
			</div>
			<div>
				<strong>{user?.lastName}</strong>
				<span className='ms-2' style={{ fontSize: "12px", color: "#aaa" }}>
					{formatDate(props.review.dateCreated + "")}
				</span>
				{props.children}
			</div>
		</>
	);
};

export default User;
