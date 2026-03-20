import { StarFill } from 'react-bootstrap-icons';
import React from 'react';
const renderRating = (rating: number) => {
    let result = [];
    for(let i =  1 ; i<=5;i++){
        if(i<=rating){
            result.push(<StarFill className="text-warning"/>);
        }else{
            result.push(<StarFill className="text-secondary"/>);
        }
    }
    return result;
}
export default renderRating;