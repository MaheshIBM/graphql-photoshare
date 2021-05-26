const fetch = require('node-fetch');
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
        me: (parents, args, { currentUser }) => currentUser
    },
    Mutation: {
        async postPhoto(parent, args, { db, currentUser }) {
            console.log("Post photo called by user", currentUser)
            if (!currentUser) {
                throw new Error("Only an authorized user can post a photo")
            }

            const newPhoto = {
                ...args.input,
                created: new Date(),
                userID: currentUser.githubLogin
            }
            const insertedIDs = await db.collection('photos').insert(newPhoto)
            newPhoto.id = insertedIDs[0]
            return newPhoto
        },
        async githubAuth(parent, { code }, { db }) {
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
        },
        addFakeUsers: async (root, { count }, { db }) => {
            const randomUserAPI = `https://randomuser.me/api/?results=${count}`

            const { results } = await fetch(randomUserAPI)
                .then(res => res.json())

            const users = results.map(r => ({
                githubLogin: r.login.username,
                name: `${r.name.first} ${r.name.last}`,
                avatar: r.picture.thumbnail,
                githubToken: r.login.sha1
            }))

            await db.collection('users').insert(users)
            return users

        },
        fakeUserAuth: async(parent, { githubLogin }, {db}) => {
            const user = await db.collection('users').findOne({githubLogin})
            if(!user){
                throw new Error('User not found in db')
            }

            return {
                token: user.githubToken,
                user
            }
        }
    },
    Photo: {
        id: parent => parent.id || parent._id,
        url: parent => `img/photos/${parent._id}.jpg`,
        postedBy: (parent, args, { db }) => {
            return db.collection("users")
                .findOne({ githubLogin: parent.userID })
        }
        // ,
        // taggedUsers: parent => tags.filter(tag => tag.photoID === parent.id)
        //     .map(tag => tag.userID)
        //     .map(userID => users.find(u => userID === u.githubLogin))
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