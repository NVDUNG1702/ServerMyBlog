

let comments = {
    "comments": [
        {
            "id": 1,
            "noteID": 1,
            "uID": 1,
            "content": "This is the first comment.",
            "parentID": null,
            "createdAt": "2024-09-15T10:30:00.000Z",
            "updatedAt": "2024-09-15T10:30:00.000Z",
            "User": {
                "id": 1,
                "fullName": "Nguyễn Văn Dũng",
                "userName": "dung1702_",
                "avatar": "http://localhost:1306/uploads/files/avatars/1726371706666_356684421_621792113244139_3216677652619940490_n.jpg"
            }
        },
        {
            "id": 2,
            "noteID": 1,
            "uID": 2,
            "content": "This is a reply to the first comment.",
            "parentID": 1,
            "createdAt": "2024-09-15T10:35:00.000Z",
            "updatedAt": "2024-09-15T10:35:00.000Z",
            "User": {
                "id": 2,
                "fullName": null,
                "userName": "dung1306",
                "avatar": null
            }
        },
        {
            "id": 3,
            "noteID": 1,
            "uID": 1,
            "content": "Another reply to the first comment.",
            "parentID": 2,
            "createdAt": "2024-09-15T10:40:00.000Z",
            "updatedAt": "2024-09-15T10:40:00.000Z",
            "User": {
                "id": 1,
                "fullName": "Nguyễn Văn Dũng",
                "userName": "dung1702_",
                "avatar": "http://localhost:1306/uploads/files/avatars/1726371706666_356684421_621792113244139_3216677652619940490_n.jpg"
            }
        },
        {
            "id": 4,
            "noteID": 1,
            "uID": 2,
            "content": "This is another top-level comment.",
            "parentID": 3,
            "createdAt": "2024-09-15T11:00:00.000Z",
            "updatedAt": "2024-09-15T11:00:00.000Z",
            "User": {
                "id": 2,
                "fullName": null,
                "userName": "dung1306",
                "avatar": null
            }
        },
        {
            "id": 5,
            "noteID": 1,
            "uID": 1,
            "content": "Replying to the second top-level comment.",
            "parentID": 4,
            "createdAt": "2024-09-15T11:10:00.000Z",
            "updatedAt": "2024-09-15T11:10:00.000Z",
            "User": {
                "id": 1,
                "fullName": "Nguyễn Văn Dũng",
                "userName": "dung1702_",
                "avatar": "http://localhost:1306/uploads/files/avatars/1726371706666_356684421_621792113244139_3216677652619940490_n.jpg"
            }
        }
    ]
}

const mapComments = (comments) => {
    // Tạo một map để chứa các replies theo comment id
    const commentMap = {};

    // Khởi tạo tất cả các comment vào map và đồng thời tạo key "replies"
    comments.forEach((comment) => {
        commentMap[comment.id] = {
            id: comment.id,
            content: comment.content,
            uID: comment.uID,
            noteID: comment.noteID,
            parentID: comment.parentID,
            createdAt: comment.createdAt,
            User: comment.User,
            replies: [],
        };
    });

    // Phân chia các comment vào đúng chỗ trong map
    const rootComments = [];
    comments.forEach((comment) => {
        if (comment.parentID) {
            // Nếu có parentCommentID thì thêm nó vào replies của comment đó
            commentMap[comment.parentID].replies.push(commentMap[comment.id]);
        } else {
            // Nếu không có parentCommentID thì đây là comment cấp cao nhất
            rootComments.push(commentMap[comment.id]);
        }
    });

    return rootComments;
};


module.exports = mapComments;