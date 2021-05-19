const users = [
    { "githubLogin": "mHattrup", "name": "Mike hattrup" },
    { "githubLogin": "gPlake", "name": "Glen Plake" },
    { "githubLogin": "sSchmidt", "name": "Scot Schmidt" }
]

const photos = [
    {
        "id": 1,
        "name": "Droppint the heart chute",
        "description": "heart chute description",
        "category": "ACTION",
        "githubUser": "gPlake",
        "created": "3-28-1977"
    },
    {
        "id": 2,
        "name": "Enjoying the SS",
        "description": "Enjoying the SS desc",
        "category": "SELFIE",
        "githubUser": "sSchmidt",
        "created": "1-2-1985"

    },
    {
        "id": 3,
        "name": "Gun Barrel 25",
        "description": "desc for Gun Barrel 25",
        "category": "LANDSCAPE",
        "githubUser": "sSchmidt",
        "created": "2018-04-15T19:09:57.308Z"

    }
]

const tags = [{
    "photoID": 1,
    "userID": "gPlake"
},
{
    "photoID": 2,
    "userID": "sSchmidt"
},
{
    "photoID": 3,
    "userID": "mHattrup"
},
{
    "photoID": 4,
    "userID": "gPlake"
}]
module.exports = { users, photos, tags }