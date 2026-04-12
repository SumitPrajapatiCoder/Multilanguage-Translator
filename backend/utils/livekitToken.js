// const { AccessToken } = require("livekit-server-sdk");

// const createToken = (room, name) => {

//     const at = new AccessToken(
//         process.env.LIVEKIT_API_KEY,
//         process.env.LIVEKIT_API_SECRET,
//         { identity: name }
//     );

//     at.addGrant({
//         roomJoin: true,
//         room,
//         canPublish: true,
//         canSubscribe: true
//     });

//     return at.toJwt();
// };


// module.exports = createToken;

























const { AccessToken } = require("livekit-server-sdk");

const createToken = (room, name) => {

    const at = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        { identity: name }   
    );

    at.addGrant({
        roomJoin: true,
        room,
        canPublish: true,
        canSubscribe: true
    });

    return at.toJwt();
};

module.exports = createToken;