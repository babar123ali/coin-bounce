class BlogDetailsDto {
    constructor(blog){
        this ._id=blog._id;
        this.content = blog.content,
        this.title = blog.title,
        this.photo = blog.photoPath,
        this.createdAt = blog.createdAt,
        this.authorName= blog.author.name,
        this.authorUserame= blog.author.Userame;
    }
}

 module.exports = BlogDetailsDto;