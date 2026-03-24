export default interface ReviewModel {
	id: number;
	comment: string;
	rating: number;
	dateCreated: string;

	user: {
		id: string;
		name: string;
		lastName: string;
		avatarUrl?: string;
	};
}