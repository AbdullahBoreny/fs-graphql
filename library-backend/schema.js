
const typeDefs =/* GraphQL */  `
type Author {
  name:String!
  born:Int
  id:ID
  bookCount:Int

}
type Token {
  value: String!
}
type User {
  username:String!
  id:ID!
  favoriteGenre:String!
}
type Book {
  id:ID!
  title:String
  author:Author
  published:Int
  genres:[String]
  
}
type Mutation  {
      _resetDatabase: Boolean

  addBook(
    title:String!
    author:String!
    published:Int!
    genres:[String!]!
    ):Book
    editAuthor(
    name:String! setBornTo:Int!
    ):Author
    createUser(
      username:String!
      favoriteGenre:String!
    ):User
    login(
    username: String!
    password: String!
    ):Token
}
  type Query {
    allUsers:[User!]!
    me:User
    allAuthors:[Author!]!
    bookCount: Int!
    authorCount: Int!
    allBooks(genre:String ,author:String):[Book!]!
  }
`;

module.exports = typeDefs;