const { GraphQLError } = require('graphql');
const Author = require('./models/author');
const Book = require('./models/book');
const User = require('./models/user');
const jwt = require('jsonwebtoken');

const resolvers = {
    Query: {
        allUsers: async (root, args) => {
            return User.find({n});
        },
        me: async (root, args, { currentUser }) => {
            if (!currentUser) {
                null;
            }
            return currentUser;
        },
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            if (args.genre) {
                const book = await Book.find({ genres: args.genre });
                console.log(book);
                return book;
            }
            return Book.find({});
        },
        allAuthors: async () => Author.find({}),


    },
    Author: {
        bookCount: async (root, args) => {
            const count = Book.findOne({ author: root._id.toString() }).countDocuments();
            return count;
        }
    },
    Book: {
        author: async (root, args) => {
            let person = await Author.findOne({ _id: root.author._id });
            return person;
        }
    },
    Mutation: {
        _resetDatabase: async () => {
            if (process.env.NODE_ENV !== 'test') {
                throw new GraphQLError('_resetDatabase is only available in test mode');
            }
            await Author.deleteMany({});
            await Book.deleteMany({});
            await User.deleteMany({});
            return true;
        },
        editAuthor: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new GraphQLError('not authenticated', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.name,

                    }
                });
            }
            const author = await Author.findOne({ name: args.name });
            if (!author) {
                return null;
            }
            author.born = args.setBornTo;
            return author.save();

        },
        createUser: async (root, args) => {
            const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre });

            return user.save()
                .catch(error => {
                    throw new GraphQLError(`Creating the user failed: ${error.message}`, {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: args.username,
                            error
                        }
                    });
                });
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username });

            if (!user || args.password !== 'secret') {
                throw new GraphQLError('wrong credentials', {
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                });
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            };

            return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
        },
        addBook: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new GraphQLError('not authenticated', {
                    extensions: {
                        code: 'AUTHORIZATION',
                        invalidArgs: args.name,

                    }
                });
            }
            const existed = await Author.findOne({ name: args.author });
            if (!existed) {
                const newPerson = new Author({ name: args.author });
                const newBook = new Book({ ...args, author: newPerson });
                await newPerson.save();
                return newBook.save();
            }
            const newBook = new Book({ ...args, author: existed });
            return newBook.save();

        }
    },
};
module.exports = resolvers;