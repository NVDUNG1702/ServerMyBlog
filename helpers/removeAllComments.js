const { CommentNote } = require('../models/index');

const deleteCommentAndReplies = async (commentID, deletedIDs = []) => {
    // Thêm ID của comment hiện tại vào danh sách đã xoá
    deletedIDs.push(parseInt(commentID));

    // Tìm các comment con có parentID là commentID
    const replies = await CommentNote.findAll({ where: { parentID: commentID } });

    // Nếu tồn tại comment con
    if (replies.length > 0) {
        // Gọi đệ quy để xoá tất cả comment con
        for (const reply of replies) {
            await deleteCommentAndReplies(reply.id, deletedIDs);  // Xoá comment con và các comment con của nó
        }
    }

    // Xoá comment hiện tại sau khi đã xoá hết các comment con
    await CommentNote.destroy({ where: { id: commentID } });

    // Trả về danh sách ID đã xoá
    return deletedIDs;
};

module.exports = { deleteCommentAndReplies }