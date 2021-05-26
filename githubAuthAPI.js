const fetch = require('node-fetch');

const throwNewError = error => {
    throw new Error(JSON.stringify(error))
}

const requestGithubToken = credentials =>
    fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
    })
        .then(res => res.json())
        .catch(throwNewError)

const requestGHUserAccount = token =>
    fetch('https://api.github.com/user?access_token=' + token,
        {
            headers: {
                "Authorization": `token ${token}`
            }
        })
        .then(res => res.json())
        .catch(throwNewError)

const authWithGH = async (credentials) => {
    console.log('authWithGH', credentials)
    const { access_token } = await requestGithubToken(credentials);
    const ghUser = await requestGHUserAccount(access_token)
    return { ...ghUser, access_token }
}

module.exports = { authWithGH }