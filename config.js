
var config = { };

// should end in /
config.rootUrl  = process.env.ROOT_URL                  || 'https://localhost';

config.facebook = {
    appId:          process.env.FACEBOOK_APPID          || '719182394777999',
    appSecret:      process.env.FACEBOOK_APPSECRET      || '16d4c00cb0bfdaa335b043d333a40f08',
    appNamespace:   process.env.FACEBOOK_APPNAMESPACE   || 'bang-on',
    redirectUri:    process.env.FACEBOOK_REDIRECTURI    ||  config.rootUrl + 'login/callback',
    scope:          process.env.FACEBOOK_SCOPE          || 'email,read_stream,user_online_presence,publish_actions,user_about_me,user_activities,user_birthday,user_education_history,user_hometown,user_interests,user_likes,user_location,user_photos'
};

module.exports = config;
