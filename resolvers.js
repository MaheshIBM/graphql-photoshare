const { GraphQLScalarType } = require('graphql')
const { users, photos, tags } = require('./users')
const { authWithGH } = require('./githubAuthAPI')
let _id = 0

const resolvers = {
    Query: {
        totalPhotos: (parent, args, { db }) => {
            //console.log("db", db.db('photoShare'))
            return db.collection('photos').estimatedDocumentCount()
        },
        allPhotos: (parent, args, { db }) => db.collection('photos')
            .find()
            .toArray(),

        totalUsers: (parent, args, { db }) =>
            db.collection('users').estimatedDocumentCount(),
        allUsers: (parent, args, { db }) => db.collection('users')
            .find()
            .toArray(),
    },
    Mutation: {
        postPhoto(parent, args) {
            const newPhoto = { id: _id++, ...args.input, created: new Date() }
            photos.push(newPhoto)
            return newPhoto
        },
        async githubAuth(parent, {code}, { db }) {
            console.log('code', code)
            const {
                message,
                access_token,
                avatar_url,
                login,
                name
            } = await authWithGH({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code
            })

            if (message) {
                throw Error(message)
            }

            let latestUserInfo = {
                name,
                githubLogin: login,
                githubToken: access_token,
                avatar: avatar_url
            }

            const { ops: [user] } = await db
                .collection('users')
                .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true })

            return { user, token: access_token }
        }
    },
    Photo: {
        url: parent => ` https://yoursite.com/img/${parent.id}.jpg`,
        postedBy: parent => {
            return users.find(u => u.githubLogin === parent.githubUser)
        },
        taggedUsers: parent => tags.filter(tag => tag.photoID === parent.id)
            .map(tag => tag.userID)
            .map(userID => users.find(u => userID === u.githubLogin))
    },

    User: {
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser === parent.githubLogin)
        },
        inPhotos: parent => tags.filter(tag => tag.userID === parent.id)
            .map(tag => tag.photoID)
            .map(photoID => photos.find(p => p.id === photoID))
    },

    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'A valid date time value',
        parseValue: value => new Date(value),
        parseLiteral: ast => ast.value,
        serialize: value => new Date(value).toISOString()
    })
}

module.exports = resolvers