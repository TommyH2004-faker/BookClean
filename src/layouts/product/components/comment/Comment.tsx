
import React, { useEffect, useState } from "react";

import { getAllReview } from "../../../../api/ReviewApi";
import RatingStar from "../../rating/Rating";
import User from "../../user/User";
import ReviewModel from "../../../../models/ReviewModel";


interface CommentProps {
	idBook: number;
}

const Comment: React.FC<CommentProps> = (props) => {
	const [reviews, setReviews] = useState<ReviewModel[] | null>(null);
	useEffect(() => {
		getAllReview(props.idBook).then((respose) => {
			setReviews(respose);
			console.log(respose);
		});
	}, []);

	if (reviews?.length === 0) {
		return <p>Không có đánh giá nào</p>;
	}

	return (
		<>
			{reviews?.map((review, index) => {
				return (
					<div className='mb-3' key={index}>
						<div className='d-flex'>
							<User review={review}>
								<div>
									<RatingStar
										readonly={true}
										ratingPoint={review.rating}
									/>
									<p className='mb-0'>{review.comment}</p>
								</div>
							</User>
						</div>
					</div>
				);
			})}
		</>
	);
};

export default Comment;
